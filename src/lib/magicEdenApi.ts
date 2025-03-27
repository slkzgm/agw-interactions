// Path: src/lib/magicEdenApi.ts
/**
 * Magic Eden API Helpers with two-step cancellation logic.
 *
 * - fetchActiveMagicEdenOrders => fetch the user's active orders
 * - requestMagicEdenCancellationSteps => request "steps" to cancel
 * - processMagicEdenSteps => handle "signature" steps (EIP-712) + postSignature, then "transaction" step
 *
 * Code is production-ready, logs in English only, with strict TS types.
 */

import type { Hex } from "viem";
import type { AbstractClient } from "@abstract-foundation/agw-client";

/**
 * A callback type for EIP-712 typed data signing via wagmi or other methods.
 */
export type SignEip712Callback = (params: {
  domain: Record<string, unknown>;
  types: Record<string, unknown>;
  primaryType: string;
  message: Record<string, unknown>;
}) => Promise<Hex>;

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
 * A partial shape for Magic Eden order data from the asks/v5 endpoint
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
}

/**
 * Response shape from GET /v3/rtp/abstract/orders/asks/v5
 */
interface MagicEdenAsksV5Response {
  orders: MagicEdenFetchedOrder[];
}

/**
 * Fetch active orders from Magic Eden's "asks/v5" endpoint.
 */
export async function fetchActiveMagicEdenOrders(
  makerAddress: string
): Promise<MagicEdenOrder[]> {
  const queryParams = new URLSearchParams({
    status: "active",
    maker: makerAddress,
    collectionsSetId:
      "d63e7e7a6f484b6bec8ffb0e67409a849e295b76e6eb257abe8cb58f10122da2",
  });

  const url = `https://api-mainnet.magiceden.io/v3/rtp/abstract/orders/asks/v5?${queryParams}`;
  console.log("[fetchActiveMagicEdenOrders] GET:", url);

  const resp = await fetch(url, {
    method: "GET",
    headers: {
      accept: "application/json, text/plain, */*",
      "accept-language": "en",
      "cache-control": "no-cache",
      pragma: "no-cache",
    },
  });
  if (!resp.ok) {
    throw new Error(`Magic Eden responded with ${resp.status}`);
  }

  const data: unknown = await resp.json();

  if (typeof data !== "object" || data === null) {
    throw new Error("Response is not an object.");
  }
  if (!("orders" in data)) {
    throw new Error("No 'orders' field in Magic Eden response.");
  }

  const { orders } = data as MagicEdenAsksV5Response;

  return orders.map((item) => {
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

/** For the aggregator's signature step. */
interface MagicEdenSignatureData {
  signatureKind: string; // e.g. "eip712"
  domain: Record<string, unknown>;
  types: Record<string, unknown>;
  value: Record<string, unknown>;
  primaryType: string;
}

/** The aggregator's signature POST instructions. */
interface MagicEdenSignaturePost {
  endpoint: string; // "/execute/cancel-signature/v1"
  method: string; // "POST"
  body: Record<string, unknown>;
}

/** Step item "data" for signature or transaction. */
interface MagicEdenCancelStepItemData {
  // signature step
  sign?: MagicEdenSignatureData;
  post?: MagicEdenSignaturePost;
  // transaction step
  from?: string;
  to?: string;
  data?: string;
}

/** A single step item, which references order IDs and a step "data" object. */
interface MagicEdenCancelStepItem {
  status: string;
  orderIds: string[];
  data: MagicEdenCancelStepItemData;
}

/** A single step from aggregator: "cancellation-signature" or "cancellation". */
export interface MagicEdenCancelStep {
  id: string; // "cancellation-signature" or "cancellation"
  kind: string; // "signature" or "transaction"
  items: MagicEdenCancelStepItem[];
}

/** Full aggregator response for requesting cancellation steps. */
interface MagicEdenCancelStepsResponse {
  steps: MagicEdenCancelStep[];
}

/**
 * Request "steps" for cancellation from Magic Eden's "/execute/cancel/v3" endpoint.
 * This may yield a single transaction step or a signature step first.
 */
export async function requestMagicEdenCancellationSteps(
  orderIds: string[]
): Promise<MagicEdenCancelStep[]> {
  console.log("[requestMagicEdenCancellationSteps] Cancelling IDs:", orderIds);

  const url =
    "https://api-mainnet.magiceden.io/v3/rtp/abstract/execute/cancel/v3";
  const payload = { orderIds };

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/plain, */*",
      "x-rkc-version": "2.5.4",
      "cache-control": "no-cache",
      pragma: "no-cache",
    },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    throw new Error(`Magic Eden cancel/v3 error: ${resp.status}`);
  }

  const data: unknown = await resp.json();
  if (typeof data !== "object" || data === null) {
    throw new Error("Cancellation response is not an object.");
  }
  if (!("steps" in data)) {
    throw new Error("Missing 'steps' in Magic Eden cancellation response.");
  }

  const { steps } = data as MagicEdenCancelStepsResponse;
  return steps;
}

/**
 * Process each "step" from Magic Eden:
 * - If "signature" step, sign typed data (EIP-712) and POST that signature to aggregator.
 * - If "transaction" step, send the transaction on chain with Abstract client.
 *
 * Returns the final tx hash if there's an on-chain step, otherwise undefined.
 *
 * 1) We iterate multiple times if aggregator yields new steps after signature.
 * 2) We pass a signEip712 callback so that the UI can handle typed data signing with wagmi.
 */
export async function processMagicEdenSteps(
  steps: MagicEdenCancelStep[],
  agwClient: AbstractClient,
  signEip712: SignEip712Callback
): Promise<string | undefined> {
  let currentSteps = steps;

  for (let i = 0; i < 5; i++) {
    // 1) Check for "signature" step
    const signatureStep = currentSteps.find((s) => s.kind === "signature");
    if (signatureStep) {
      console.log(
        "[processMagicEdenSteps] Handling signature step:",
        signatureStep
      );

      for (const item of signatureStep.items) {
        if (!item.data.sign || !item.data.post) continue;

        // EIP-712 typed data
        const { domain, types, value, primaryType } = item.data.sign;
        console.log("[processMagicEdenSteps] EIP-712 domain:", domain);
        console.log("[processMagicEdenSteps] EIP-712 types:", types);
        console.log(
          "[processMagicEdenSteps] EIP-712 primaryType:",
          primaryType
        );
        console.log("[processMagicEdenSteps] EIP-712 value:", value);

        // 2) sign typed data with the callback
        const signature = await signEip712({
          domain,
          types,
          primaryType,
          message: value,
        });

        console.log("[processMagicEdenSteps] Received signature:", signature);

        // aggregator typically wants ?signature= in query param
        const baseUrl = "https://api-mainnet.magiceden.io/v3/rtp/abstract";
        const queryParams = new URLSearchParams({ signature });
        const postUrl = `${baseUrl}${item.data.post.endpoint}?${queryParams}`;

        // The body is typically { orderIds, orderKind, ... }
        const postBody = item.data.post.body;
        console.log(
          "[processMagicEdenSteps] POSTing signature to:",
          postUrl,
          postBody
        );

        const postResp = await fetch(postUrl, {
          method: item.data.post.method,
          headers: {
            "content-type": "application/json",
            accept: "application/json, text/plain, */*",
            "x-rkc-version": "2.5.4",
          },
          body: JSON.stringify(postBody),
        });
        if (!postResp.ok) {
          throw new Error(
            `Magic Eden signature POST failed: ${postResp.status}`
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
            "[processMagicEdenSteps] Received updated steps after signature:",
            updated
          );
          currentSteps = updated;
        } else {
          // If no new steps, remove the signature step
          currentSteps = currentSteps.filter((st) => st !== signatureStep);
        }
      }
      continue; // re-check steps in next iteration
    }

    // 3) Check for "transaction" step
    const txStep = currentSteps.find((s) => s.kind === "transaction");
    if (txStep) {
      console.log("[processMagicEdenSteps] Handling transaction step:", txStep);

      if (txStep.items.length > 0) {
        const txItem = txStep.items[0];
        if (!txItem.data?.to || !txItem.data?.data) {
          throw new Error("Transaction step missing 'to' or 'data'.");
        }

        // broadcast the transaction
        const txHash = await agwClient.sendTransactionBatch({
          calls: [
            {
              to: txItem.data.to as `0x${string}`,
              data: txItem.data.data as `0x${string}`,
            },
          ],
        });
        console.log("[processMagicEdenSteps] Broadcasted TX. Hash:", txHash);

        return txHash as string;
      }

      console.log(
        "[processMagicEdenSteps] Transaction step has no items. Possibly done."
      );
      return undefined;
    }

    console.log(
      "[processMagicEdenSteps] No signature or transaction step found. Possibly done."
    );
    return undefined;
  }

  console.warn("[processMagicEdenSteps] Exceeded iteration limit (5).");
  return undefined;
}
