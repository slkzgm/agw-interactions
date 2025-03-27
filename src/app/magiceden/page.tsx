"use client";

/**
 * Magic Eden Orders page (client):
 * 1) Automatically loads connected user's active orders on mount.
 * 2) Fetches from our local /api/magicEden/asks route to avoid CORS.
 * 3) Supports "Select All" / "Deselect All" for orders.
 * 4) Cancels orders via the /api/magicEden/cancel route:
 *    - If aggregator requires an EIP-712 signature, we sign it with wagmi's `useSignTypedData`.
 *    - Then the server route calls Magic Eden from server side (no CORS).
 * 5) Links final transaction to https://abscan.org/tx/TX_HASH.
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

  // Wagmi typed data hook for EIP-712 signing
  const { signTypedDataAsync } = useSignTypedData();

  // Orders & UI state
  const [orders, setOrders] = useState<MagicEdenOrder[]>([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");
  const [error, setError] = useState("");

  /**
   * On mount, if user is connected, fetch their orders.
   */
  useEffect(() => {
    if (isConnected && userWalletAddress) {
      void fetchOrdersForWallet(userWalletAddress);
    }
  }, [isConnected, userWalletAddress]);

  /**
   * Proxy fetch to /api/magicEden/asks route (server-side).
   * This avoids a direct call to Magic Eden and bypasses CORS issues.
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
   * Toggle selection for an individual order.
   */
  function toggleOrderSelection(orderId: string) {
    setSelectedOrderIds((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  }

  /**
   * Toggle "Select All" / "Deselect All."
   */
  function toggleSelectAll() {
    if (selectedOrderIds.length === orders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(orders.map((o) => o.id));
    }
  }

  /**
   * Our callback for EIP-712 signing (used in processMagicEdenSteps).
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
   * 1) POST /api/magicEden/cancel (step=cancel-v3) => get aggregator steps
   * 2) If aggregator needs signature => we sign typed data & proxy to aggregator
   * 3) If aggregator provides transaction => we broadcast on chain
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
        "[handleCancelSelectedOrders] Requesting aggregator steps via server route..."
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
          "[handleCancelSelectedOrders] No on-chain transaction returned (off-chain?)."
        );
      }
    } catch (err) {
      console.error("[handleCancelSelectedOrders] Error:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsCancelling(false);
    }
  }

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

      {/* Header row with refresh */}
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
