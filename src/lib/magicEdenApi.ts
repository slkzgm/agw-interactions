// Path: src/lib/magicEdenApi.ts
/**
 * Magic Eden API Helpers with zero usage of `any`.
 *
 * We define an interface for the raw orders so we can avoid `(item: any) => {...}`
 */

import type { Hex } from "viem";
import type { AbstractClient } from "@abstract-foundation/agw-client";

/**
 * A callback type for EIP-712 typed data signing with wagmi or other methods.
 */
export type SignEip712Callback = (params: {
  domain: Record<string, unknown>;
  types: Record<string, unknown>;
  primaryType: string;
  message: Record<string, unknown>;
}) => Promise<Hex>;

/**
 * The shape of the mapped orders we display in the UI.
 */
export interface MagicEdenOrder {
  id: string;
  maker: string;
  status: string;
  contract?: string;
  tokenId?: string;
  priceEth?: number;
  priceUsd?: number;
}

/**
 * The shape of a single raw order from Magic Eden's aggregator.
 * (We define enough fields to parse contract, maker, price, etc.)
 */
interface MagicEdenFetchedOrder {
  id: string;
  maker: string;
  status: string;
  contract?: string;
  price?: {
    amount?: {
      decimal?: number;
      usd?: number;
    };
  };
  criteria?: {
    data?: {
      token?: {
        tokenId?: string;
      };
    };
  };
  // add other fields if needed
}

/**
 * The shape of the top-level object returned by the aggregator route
 * that includes an "orders" array of `MagicEdenFetchedOrder`.
 */
interface MagicEdenAsksResponse {
  orders: MagicEdenFetchedOrder[];
}

// 1) Fetch active orders from our proxy route => aggregator
export async function fetchActiveMagicEdenOrders(
  makerAddress: string
): Promise<MagicEdenOrder[]> {
  const url = `/api/magicEden/asks?maker=${encodeURIComponent(makerAddress)}&status=active`;
  console.log(
    "[fetchActiveMagicEdenOrders] calling local route => aggregator:",
    url
  );

  const resp = await fetch(url, { method: "GET" });
  if (!resp.ok) {
    throw new Error(`Proxy /api/magicEden/asks error: ${resp.status}`);
  }

  const data = (await resp.json()) as unknown;
  if (typeof data !== "object" || data === null) {
    throw new Error("No valid JSON in aggregator response.");
  }
  if (!("orders" in data)) {
    throw new Error("No 'orders' field in aggregator response.");
  }

  // We cast data to our typed shape:
  const { orders } = data as MagicEdenAsksResponse;

  // Now parse each raw order into our UI shape
  return orders.map((item: MagicEdenFetchedOrder) => {
    const contractAddr = item.contract ?? "";
    const tokenId = item.criteria?.data?.token?.tokenId ?? "";
    const priceEth = item.price?.amount?.decimal ?? 0;
    const priceUsd = item.price?.amount?.usd ?? 0;

    return {
      id: item.id,
      maker: item.maker,
      status: item.status,
      contract: contractAddr,
      tokenId,
      priceEth,
      priceUsd,
    };
  });
}

// Step interface definitions for aggregator
interface MagicEdenSignatureData {
  signatureKind: string;
  domain: Record<string, unknown>;
  types: Record<string, unknown>;
  value: Record<string, unknown>;
  primaryType: string;
}

interface MagicEdenSignaturePost {
  endpoint: string;
  method: string;
  body: Record<string, unknown>;
}

interface MagicEdenCancelStepItemData {
  sign?: MagicEdenSignatureData;
  post?: MagicEdenSignaturePost;
  from?: string;
  to?: string;
  data?: string;
}

interface MagicEdenCancelStepItem {
  status: string;
  orderIds: string[];
  data: MagicEdenCancelStepItemData;
}

export interface MagicEdenCancelStep {
  id: string; // "cancellation-signature" or "cancellation"
  kind: string; // "signature" or "transaction"
  items: MagicEdenCancelStepItem[];
}

interface MagicEdenStepsResponse {
  steps: MagicEdenCancelStep[];
}

// 2) Request aggregator steps from our route => official aggregator
export async function requestMagicEdenCancellationSteps(
  orderIds: string[]
): Promise<MagicEdenCancelStep[]> {
  console.log(
    "[requestMagicEdenCancellationSteps] calling /api/magicEden/cancel => aggregator"
  );
  const resp = await fetch("/api/magicEden/cancel", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      step: "cancel-v3",
      orderIds,
    }),
  });
  if (!resp.ok) {
    throw new Error(`Proxy /api/magicEden/cancel error: ${resp.status}`);
  }

  const data = (await resp.json()) as unknown;
  if (typeof data !== "object" || data === null || !("steps" in data)) {
    throw new Error("No 'steps' in aggregator response.");
  }

  const { steps } = data as MagicEdenStepsResponse;
  return steps;
}

// 3) Process aggregator steps (signature => aggregator => transaction => broadcast)
export async function processMagicEdenSteps(
  steps: MagicEdenCancelStep[],
  agwClient: AbstractClient,
  signEip712: SignEip712Callback
): Promise<string | undefined> {
  let currentSteps = steps;

  for (let i = 0; i < 5; i++) {
    // 1) signature step?
    const signatureStep = currentSteps.find((s) => s.kind === "signature");
    if (signatureStep) {
      console.log(
        "[processMagicEdenSteps] Found signature step:",
        signatureStep
      );

      for (const item of signatureStep.items) {
        if (!item.data.sign || !item.data.post) continue;

        const { domain, types, value, primaryType } = item.data.sign;
        console.log("[processMagicEdenSteps] EIP-712 domain:", domain);
        console.log("[processMagicEdenSteps] EIP-712 types:", types);
        console.log(
          "[processMagicEdenSteps] EIP-712 primaryType:",
          primaryType
        );
        console.log("[processMagicEdenSteps] EIP-712 value:", value);

        // sign typed data with provided callback
        const signature = await signEip712({
          domain,
          types,
          primaryType,
          message: value,
        });
        console.log("[processMagicEdenSteps] signature:", signature);

        // Then call local route => aggregator endpoint
        const postResp = await fetch("/api/magicEden/cancel", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            step: "cancel-signature",
            signature,
            endpoint: item.data.post.endpoint,
            postBody: item.data.post.body,
          }),
        });

        if (!postResp.ok) {
          throw new Error(
            `Proxy /api/magicEden/cancel signature error: ${postResp.status}`
          );
        }

        const postData = await postResp.json();
        if (
          typeof postData === "object" &&
          postData !== null &&
          "steps" in postData
        ) {
          console.log(
            "[processMagicEdenSteps] Updated steps after signature:",
            postData.steps
          );
          currentSteps = (postData as { steps: MagicEdenCancelStep[] }).steps;
        } else {
          // no new steps => remove signature step
          currentSteps = currentSteps.filter((st) => st !== signatureStep);
        }
      }
      continue;
    }

    // 2) transaction step
    const txStep = currentSteps.find((s) => s.kind === "transaction");
    if (txStep) {
      console.log("[processMagicEdenSteps] Found transaction step:", txStep);

      if (txStep.items.length > 0) {
        const txItem = txStep.items[0];
        if (!txItem.data?.to || !txItem.data?.data) {
          throw new Error("Transaction step missing 'to' or 'data'.");
        }

        const txHash = await agwClient.sendTransactionBatch({
          calls: [
            {
              to: txItem.data.to as `0x${string}`,
              data: txItem.data.data as `0x${string}`,
            },
          ],
        });
        console.log("[processMagicEdenSteps] broadcast TX. Hash:", txHash);

        return txHash as string;
      }

      console.log(
        "[processMagicEdenSteps] Transaction step has no items => done?"
      );
      return undefined;
    }

    // No signature/transaction => done
    console.log(
      "[processMagicEdenSteps] No signature or transaction step => done?"
    );
    return undefined;
  }

  console.warn("[processMagicEdenSteps] Exceeded iteration limit (5).");
  return undefined;
}
