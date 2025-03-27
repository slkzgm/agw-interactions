// Path: src/app/magiceden/page.tsx
"use client";

/**
 * Magic Eden Orders Page (client):
 * 1) Loads the connected user's active orders on mount (via your server route -> official ME API).
 * 2) Displays "Select All" / "Deselect All", and allows cancellation.
 * 3) Cancels orders using two-step logic (signature + transaction) with official Magic Eden aggregator:
 *    - We sign EIP-712 data with wagmi's `useSignTypedData`.
 *    - We do server calls to /api/magicEden/cancel => which calls `https://api-mainnet.magiceden.dev/v3/rtp/ethereum/execute/cancel/v3`.
 * 4) Avoids direct cross-origin calls from the browser, preventing CORS in production.
 */

import React, { useEffect, useState } from "react";
import { useAccount, useSignTypedData } from "wagmi";
import { useAbstractClient } from "@abstract-foundation/agw-react";
import {
  fetchActiveMagicEdenOrders,
  requestMagicEdenCancellationSteps,
  processMagicEdenSteps,
  MagicEdenOrder,
  SignEip712Callback,
} from "@/lib/magicEdenApi";

export default function MagicEdenPage() {
  // Wagmi & Abstract states
  const { isConnected, address: userWalletAddress } = useAccount();
  const { data: agwClient } = useAbstractClient();

  // EIP-712 sign typed data
  const { signTypedDataAsync } = useSignTypedData();

  // Orders + UI states
  const [orders, setOrders] = useState<MagicEdenOrder[]>([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");
  const [error, setError] = useState("");

  /**
   * If wallet is connected, load the user's orders.
   */
  useEffect(() => {
    if (isConnected && userWalletAddress) {
      void fetchOrdersForWallet(userWalletAddress);
    }
  }, [isConnected, userWalletAddress]);

  /**
   * Fetch active orders by calling `/api/magicEden/asks?maker=...`.
   * That route will server-side fetch the official ME endpoint
   * `https://api-mainnet.magiceden.dev/v3/rtp/ethereum/orders/asks/v5`.
   */
  async function fetchOrdersForWallet(maker: string) {
    try {
      setIsLoadingOrders(true);
      setError("");
      setOrders([]);
      setSelectedOrderIds([]);
      setTransactionHash("");

      const fetched = await fetchActiveMagicEdenOrders(maker);
      setOrders(fetched);
      console.log("[MagicEdenPage] Orders fetched:", fetched);
    } catch (err) {
      console.error("[MagicEdenPage] Error fetching orders:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoadingOrders(false);
    }
  }

  /**
   * Toggle or untoggle a single order ID selection.
   */
  function toggleOrderSelection(orderId: string) {
    setSelectedOrderIds((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  }

  /**
   * Select All / Deselect All
   */
  function toggleSelectAll() {
    if (selectedOrderIds.length === orders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(orders.map((o) => o.id));
    }
  }

  /**
   * Our EIP-712 sign callback used by `processMagicEdenSteps`.
   */
  const signEip712: SignEip712Callback = async ({
    domain,
    types,
    primaryType,
    message,
  }) => {
    return signTypedDataAsync({
      domain: domain as Record<string, unknown>,
      types: types as Record<string, Array<{ name: string; type: string }>>,
      primaryType,
      message: message as Record<string, unknown>,
    });
  };

  /**
   * Cancel selected orders:
   * 1) We request aggregator "steps" from /api/magicEden/cancel => official ME "cancel/v3".
   * 2) If aggregator wants signature => sign EIP-712 and post signature => aggregator
   * 3) If aggregator provides transaction => broadcast on chain with `agwClient`.
   */
  async function handleCancelSelectedOrders() {
    try {
      if (!isConnected || !agwClient || !userWalletAddress) {
        throw new Error("Please connect your wallet before cancelling orders.");
      }
      if (selectedOrderIds.length === 0) {
        throw new Error("No orders selected for cancellation.");
      }

      setIsCancelling(true);
      setError("");
      setTransactionHash("");

      console.log(
        "[handleCancelSelectedOrders] Request aggregator steps via server route..."
      );
      const steps = await requestMagicEdenCancellationSteps(selectedOrderIds);
      console.log("[handleCancelSelectedOrders] Received steps:", steps);

      const finalTxHash = await processMagicEdenSteps(
        steps,
        agwClient,
        signEip712
      );
      if (finalTxHash) {
        console.log(
          "[handleCancelSelectedOrders] Cancellation Tx hash:",
          finalTxHash
        );
        setTransactionHash(String(finalTxHash));
      } else {
        console.log(
          "[handleCancelSelectedOrders] No on-chain transaction returned (maybe off-chain?)."
        );
      }
    } catch (err) {
      console.error("[handleCancelSelectedOrders] Error:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsCancelling(false);
    }
  }

  // If wallet is not connected, prompt the user
  if (!isConnected || !userWalletAddress) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Magic Eden Orders</h1>
        <p className="text-muted">
          Connect your wallet to load your active orders.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Magic Eden Orders</h1>
      <p className="text-muted">
        Viewing orders for wallet: <code>{userWalletAddress}</code>
      </p>

      {isLoadingOrders && (
        <div className="p-4 bg-card border border-border rounded-lg text-center">
          Fetching orders...
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Active Orders</h2>
        <div className="flex items-center gap-2">
          {orders.length > 0 && (
            <button
              onClick={toggleSelectAll}
              className="px-3 py-1 bg-foreground text-background rounded-lg hover:bg-muted transition-colors text-sm"
            >
              {selectedOrderIds.length === orders.length
                ? "Deselect All"
                : "Select All"}
            </button>
          )}
          <button
            onClick={() => fetchOrdersForWallet(userWalletAddress)}
            disabled={isLoadingOrders}
            className="px-3 py-1 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm"
          >
            {isLoadingOrders ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {orders.length === 0 && !isLoadingOrders ? (
        <div className="p-4 bg-card border border-border rounded-lg text-center">
          No active orders found.
        </div>
      ) : (
        orders.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <p className="text-sm text-muted">
              Select orders and click &quot;Cancel Selected Orders&quot;.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-2 text-left">Select</th>
                    <th className="p-2 text-left">Order ID</th>
                    <th className="p-2 text-left">Maker</th>
                    <th className="p-2 text-left">Item</th>
                    <th className="p-2 text-left">Price (ETH)</th>
                    <th className="p-2 text-left">Price (USD)</th>
                    <th className="p-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-border">
                      <td className="p-2">
                        <input
                          type="checkbox"
                          checked={selectedOrderIds.includes(order.id)}
                          onChange={() => toggleOrderSelection(order.id)}
                        />
                      </td>
                      <td className="p-2">{order.id}</td>
                      <td className="p-2">{order.maker}</td>
                      <td className="p-2">
                        {order.contract && order.tokenId
                          ? `${order.contract.slice(0, 6)}...${order.contract.slice(-4)} #${order.tokenId}`
                          : "--"}
                      </td>
                      <td className="p-2">{order.priceEth ?? "--"}</td>
                      <td className="p-2">
                        {order.priceUsd
                          ? `$${order.priceUsd.toFixed(2)}`
                          : "--"}
                      </td>
                      <td className="p-2">{order.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={handleCancelSelectedOrders}
              disabled={isCancelling || selectedOrderIds.length === 0}
              className="px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCancelling ? "Cancelling..." : "Cancel Selected Orders"}
            </button>
          </div>
        )
      )}

      {error && (
        <div className="p-4 bg-danger/10 border border-danger/25 text-danger rounded-lg">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {transactionHash && (
        <div className="p-4 bg-success/10 border border-success/25 text-success rounded-lg break-all">
          <p className="font-medium">Cancellation Transaction Submitted!</p>
          <p className="text-sm mt-1">Tx Hash:</p>
          <a
            href={`https://abscan.org/tx/${transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline break-all"
          >
            {transactionHash}
          </a>
        </div>
      )}
    </div>
  );
}
