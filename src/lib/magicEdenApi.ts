// Path: src/lib/magicEdenApi.ts
/**
 * Magic Eden API Helpers with typed code (no `any`).
 */

import type { AbstractClient } from "@abstract-foundation/agw-client";
import type { Hex } from "viem";

// If aggregator needs typed data sign:
export type SignEip712Callback = (params: {
  domain: Record<string, unknown>;
  types: Record<string, unknown>;
  primaryType: string;
  message: Record<string, unknown>;
}) => Promise<Hex>;

/**
 * Minimal shape for a mapped/returned order.
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
 * The shape of a single order returned by Magic Eden's asks/v5 endpoint.
 */
interface MagicEdenFetchedOrder {
  id: string;
  maker: string;
  status: string;
  contract?: string;
  criteria?: {
    data?: {
      token?: {
        tokenId?: string;
      };
    };
  };
  price?: {
    amount?: {
      decimal?: number;
      usd?: number;
    };
  };
  // add more fields if needed
}

/**
 * The top-level shape from GET /v3/rtp/abstract/orders/asks/v5
 */
interface MagicEdenAsksV5Response {
  orders: MagicEdenFetchedOrder[];
}

/**
 * 1) Fetch Active Orders - typed so we never use `any`.
 */
export async function fetchActiveMagicEdenOrders(
  makerAddress: string
): Promise<MagicEdenOrder[]> {
  // Here we assume you proxy from the client to your Next.js route /api/magicEden/asks.
  const url = `/api/magicEden/asks?maker=${encodeURIComponent(makerAddress)}&status=active`;
  console.log("[fetchActiveMagicEdenOrders] GET (via Next.js proxy):", url);

  const resp = await fetch(url, { method: "GET" });
  if (!resp.ok) {
    throw new Error(`Proxy /api/magicEden/asks error: ${resp.status}`);
  }

  // We'll parse the JSON with a known shape
  const data: unknown = await resp.json();

  // Type-check the structure
  if (typeof data !== "object" || data === null) {
    throw new Error("Proxy response is not an object.");
  }
  if (!("orders" in data)) {
    throw new Error("No 'orders' field in proxy response.");
  }

  const { orders } = data as MagicEdenAsksV5Response;

  // Now map with typed items
  return orders.map((item: MagicEdenFetchedOrder) => {
    const contractAddr = item.contract || "";
    const tokenId = item.criteria?.data?.token?.tokenId || "";
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

// -------------------------------------------------------------------
// Example Steps interfaces for aggregator
// -------------------------------------------------------------------
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
  id: string;
  kind: string;
  items: MagicEdenCancelStepItem[];
}

interface MagicEdenStepsResponse {
  steps: MagicEdenCancelStep[];
}

// -------------------------------------------------------------------
// Example: requestMagicEdenCancellationSteps, processMagicEdenSteps
// (You might be calling your own Next.js routes here as well.)
// -------------------------------------------------------------------

/**
 * 2) Request aggregator "steps" by calling your Next.js route with { step: "cancel-v3", orderIds }.
 */
export async function requestMagicEdenCancellationSteps(
  orderIds: string[]
): Promise<MagicEdenCancelStep[]> {
  console.log(
    "[requestMagicEdenCancellationSteps] via /api/magicEden/cancel, step=cancel-v3"
  );

  const resp = await fetch("/api/magicEden/cancel", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      step: "cancel-v3",
      orderIds,
    }),
  });
  if (!resp.ok) {
    throw new Error(`Proxy /api/magicEden/cancel error: ${resp.status}`);
  }

  const data: unknown = await resp.json();
  if (typeof data !== "object" || data === null) {
    throw new Error("Aggregator steps response not an object.");
  }
  if (!("steps" in data)) {
    throw new Error("Missing 'steps' in aggregator steps response.");
  }

  const { steps } = data as MagicEdenStepsResponse;
  return steps;
}

/**
 * 3) Process aggregator steps. If aggregator needs a signature step => we sign typed data
 *    then call /api/magicEden/cancel again with { step: "cancel-signature", ... }.
 */
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

        // Sign typed data with wagmi callback
        const signature = await signEip712({
          domain,
          types,
          primaryType,
          message: value,
        });
        console.log("[processMagicEdenSteps] Received signature:", signature);

        // call /api/magicEden/cancel with step=cancel-signature
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

        const postData: unknown = await postResp.json();
        if (
          typeof postData === "object" &&
          postData !== null &&
          "steps" in postData
        ) {
          const updated = (postData as { steps: MagicEdenCancelStep[] }).steps;
          console.log(
            "[processMagicEdenSteps] Updated steps after signature:",
            updated
          );
          currentSteps = updated;
        } else {
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

        console.log("[processMagicEdenSteps] Broadcast TX. Hash:", txHash);
        return txHash as string;
      }

      console.log(
        "[processMagicEdenSteps] Transaction step has no items. Possibly done."
      );
      return undefined;
    }

    // If no signature or transaction step found => done
    console.log(
      "[processMagicEdenSteps] No signature or transaction step found. Possibly done."
    );
    return undefined;
  }

  console.warn("[processMagicEdenSteps] Exceeded iteration limit (5).");
  return undefined;
}
