// Path: src/app/gachav6/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useAbstractClient } from "@abstract-foundation/agw-react";
import { encodeFunctionData } from "viem";

import { GACHAV6_ABI, GACHAV6_CONTRACT_ADDRESS } from "@/lib/gachaV6Constants";
import { publicClient } from "@/lib/publicClient";

/**
 * A simple interface describing the user's ticket data for a specific pool:
 * - poolId: The numeric ID of the pool
 * - purchased: How many tickets user bought
 * - claimed: How many tickets user has already claimed
 * - available: How many tickets are still claimable = purchased - claimed
 * - claimAmount: How many tickets user wants to claim now (input field)
 */
interface PoolTicketInfo {
  poolId: number;
  purchased: bigint;
  claimed: bigint;
  available: bigint;
  claimAmount: string;
}

export default function GachaV6Page() {
  // Wagmi + Abstract states
  const { address, isConnected } = useAccount();
  const { data: agwClient } = useAbstractClient();

  // For demo, we define some pool IDs the user can interact with
  // In production, you might fetch these dynamically from the contract or config
  const POOL_IDS = [1, 2, 3, 4, 5, 6, 7];

  const [pools, setPools] = useState<PoolTicketInfo[]>(
    POOL_IDS.map((id) => ({
      poolId: id,
      purchased: BigInt(0),
      claimed: BigInt(0),
      available: BigInt(0),
      claimAmount: "",
    }))
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");

  /**
   * Load user's ticket info for each pool:
   * We'll call `getTicket(poolId, user)` and compute:
   *   available = purchased - claimed
   */
  async function loadUserTickets() {
    if (!isConnected || !address || !agwClient) return;

    try {
      setIsLoading(true);
      setError("");
      setTxHash("");

      const updatedPools: PoolTicketInfo[] = [];
      for (const pool of pools) {
        const result = (await publicClient.readContract({
          address: GACHAV6_CONTRACT_ADDRESS,
          abi: GACHAV6_ABI,
          functionName: "getTicket",
          args: [BigInt(pool.poolId), address],
        })) as { purchased: bigint; claimed: bigint };

        const purchased = result?.purchased || BigInt(0);
        const claimed = result?.claimed || BigInt(0);
        const available = purchased > claimed ? purchased - claimed : BigInt(0);

        updatedPools.push({
          ...pool,
          purchased,
          claimed,
          available,
          claimAmount: "",
        });
      }

      setPools(updatedPools);
    } catch (err) {
      console.error("[GachaV6Page] Error loading user tickets:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Handle batch claiming:
   * Because the contract's `claim(poolId)` method claims a single ticket (no "amount" param),
   * we must call it as many times as the user wants to claim. We'll do multiple calls
   * in a single user operation (batch).
   */
  async function handleBatchClaim() {
    if (!isConnected || !address || !agwClient) {
      setError("Please connect your wallet first.");
      return;
    }

    try {
      setIsClaiming(true);
      setError("");
      setTxHash("");

      const calls: { to: `0x${string}`; data: `0x${string}` }[] = [];

      for (const pool of pools) {
        // Convert the user input into a valid number
        const amtToClaim = parseInt(pool.claimAmount.trim(), 10);
        if (!amtToClaim || amtToClaim <= 0) continue;

        // Check if they have enough available
        const amtBN = BigInt(amtToClaim);
        if (amtBN > pool.available) {
          throw new Error(
            `Not enough tickets available in pool #${pool.poolId}. 
            You have ${pool.available.toString()} available but entered ${amtBN.toString()}.`
          );
        }

        // For each ticket, we do one call to claim(poolId).
        for (let i = 0; i < amtToClaim; i++) {
          const data = encodeFunctionData({
            abi: GACHAV6_ABI,
            functionName: "claim",
            args: [BigInt(pool.poolId)],
          });
          calls.push({ to: GACHAV6_CONTRACT_ADDRESS, data });
        }
      }

      if (calls.length === 0) {
        throw new Error("No valid claim amounts specified.");
      }

      console.log("[GachaV6Page] Sending batch calls to claim tickets:", calls);

      // Send them all as a single user operation
      const hash = await agwClient.sendTransactionBatch({ calls });
      setTxHash(hash);

      // Optionally refresh data after a short delay
      setTimeout(() => {
        void loadUserTickets();
      }, 3000);
    } catch (err) {
      console.error("[GachaV6Page] Error in handleBatchClaim:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsClaiming(false);
    }
  }

  /**
   * Load user tickets on mount or when the user connects.
   */
  useEffect(() => {
    if (isConnected && agwClient) {
      void loadUserTickets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, agwClient]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">GachaV6 Batch Claim</h1>
      <p className="text-muted">
        Select how many tickets to claim per pool. Each ticket requires one
        on-chain claim, but we batch them into a single transaction for
        convenience.
      </p>

      {!isConnected ? (
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <p className="text-lg">Please connect your wallet to continue.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your Pools</h2>
            <button
              onClick={loadUserTickets}
              disabled={isLoading}
              className="px-3 py-1 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm"
            >
              {isLoading ? "Loading..." : "Refresh Tickets"}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-2 text-left">Pool ID</th>
                  <th className="p-2 text-left">Purchased</th>
                  <th className="p-2 text-left">Claimed</th>
                  <th className="p-2 text-left">Available</th>
                  <th className="p-2 text-left">Claim Amount</th>
                </tr>
              </thead>
              <tbody>
                {pools.map((pool, idx) => (
                  <tr
                    key={pool.poolId}
                    className="border-b border-border last:border-none"
                  >
                    <td className="p-2">#{pool.poolId}</td>
                    <td className="p-2">{pool.purchased.toString()}</td>
                    <td className="p-2">{pool.claimed.toString()}</td>
                    <td className="p-2">{pool.available.toString()}</td>
                    <td className="p-2">
                      <input
                        type="number"
                        min={0}
                        value={pool.claimAmount}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPools((prev) =>
                            prev.map((p, i) =>
                              i === idx ? { ...p, claimAmount: val } : p
                            )
                          );
                        }}
                        className="w-20 px-2 py-1 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="0"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleBatchClaim}
            disabled={isClaiming}
            className="w-full px-4 py-2 bg-success text-white rounded-lg hover:bg-success-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isClaiming ? "Claiming..." : "Claim Tickets"}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-danger/10 border border-danger/25 text-danger rounded-lg">
              <p className="font-medium">Error:</p>
              <p>{error}</p>
            </div>
          )}

          {txHash && (
            <div className="mt-4 p-4 bg-success/10 border border-success/25 text-success rounded-lg break-all">
              <p className="font-bold">Batch Claim Submitted!</p>
              <p className="text-sm mt-1">Transaction Hash:</p>
              <a
                href={`https://abscan.org/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
                className="underline break-all"
              >
                {txHash}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
