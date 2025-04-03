// Path: src/app/gachav6/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { useAbstractClient } from "@abstract-foundation/agw-react";
import {
  type Hash,
  parseAbiItem,
  decodeEventLog,
  TransactionReceipt,
  encodeFunctionData,
} from "viem";

import { publicClient } from "@/lib/publicClient";
import {
  GACHAV6_ABI,
  GACHAV6_CONTRACT_ADDRESS,
  POOL_NAMES,
} from "@/lib/gachaV6Constants";
import { GachaHistory } from "@/components/gacha/GachaHistory";
import { GachaClaimTab } from "@/components/gacha/GachaClaimTab";

/** Minimal data about each pool. */
interface PoolTicketInfo {
  poolId: number;
  purchased: bigint;
  claimed: bigint;
  available: bigint;
  claimAmount: string;
}

/** Final recap from `ClaimSettled`. */
export interface ClaimSettledLog {
  seqNo: bigint;
  token: `0x${string}`;
  amount: bigint;
  tier: bigint;
}

/** Gacha Points user data interface */
interface GachaUserData {
  wallet: string;
  points: number;
  ticketOpens: number;
  biggestWinInEth: number;
  totalWinInEth: number;
}

export default function GachaV6Page() {
  const { address, isConnected } = useAccount();
  const { data: agwClient } = useAbstractClient();

  // We'll track the known pool IDs here. Could be dynamic in a real scenario.
  const POOL_IDS = [1, 2, 3, 4, 5, 6, 7];

  // Local state for each pool's info
  const [pools, setPools] = useState<PoolTicketInfo[]>(
    POOL_IDS.map((id) => ({
      poolId: id,
      purchased: 0n,
      claimed: 0n,
      available: 0n,
      claimAmount: "",
    }))
  );

  // Generic UI states
  const [isLoading, setIsLoading] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [error, setError] = useState("");

  // Store the TX hash as a `Hash | null`.
  // `Hash` is `type Hash = 0x${string}`, provided by viem.
  const [txHash, setTxHash] = useState<Hash | null>(null);

  // Final claim logs + pools claimed
  const [claimRecap, setClaimRecap] = useState<ClaimSettledLog[]>([]);
  const [claimedPoolIds, setClaimedPoolIds] = useState<number[]>([]);

  // GachaPoints tracking
  const [userData, setUserData] = useState<GachaUserData | null>(null);
  const [pointsGained, setPointsGained] = useState<number | null>(null);

  // Toggle between "Last Claim Results" and "Claim History"
  const [activeTab, setActiveTab] = useState<"lastClaim" | "history">(
    "lastClaim"
  );

  /**
   * On mount, restore data from localStorage (if available).
   */
  useEffect(() => {
    try {
      // Last claim recap
      const raw = localStorage.getItem("gachav6LastClaimRecap");
      if (raw) {
        const parsed = JSON.parse(raw) as Array<{
          seqNo: string;
          token: `0x${string}`;
          amount: string;
          tier: string;
        }>;

        const restored = parsed.map((item) => ({
          seqNo: BigInt(item.seqNo),
          token: item.token,
          amount: BigInt(item.amount),
          tier: BigInt(item.tier),
        }));
        setClaimRecap(restored);
      }

      // Claimed pool IDs
      const rawPoolIds = localStorage.getItem("gachav6LastClaimedPools");
      if (rawPoolIds) {
        setClaimedPoolIds(JSON.parse(rawPoolIds));
      }

      // Points gained
      const rawPointsGained = localStorage.getItem("gachav6LastPointsGained");
      if (rawPointsGained) {
        setPointsGained(JSON.parse(rawPointsGained));
      }
    } catch (e) {
      console.warn("[useEffect] Could not parse stored claim recap", e);
    }
  }, []);

  /**
   * Persist some data to localStorage whenever it changes.
   */
  useEffect(() => {
    // Save claim logs
    if (claimRecap.length > 0) {
      const stringified = claimRecap.map((item) => ({
        seqNo: item.seqNo.toString(),
        token: item.token,
        amount: item.amount.toString(),
        tier: item.tier.toString(),
      }));
      localStorage.setItem(
        "gachav6LastClaimRecap",
        JSON.stringify(stringified)
      );
    } else {
      localStorage.removeItem("gachav6LastClaimRecap");
    }

    // Save claimed pool IDs
    if (claimedPoolIds.length > 0) {
      localStorage.setItem(
        "gachav6LastClaimedPools",
        JSON.stringify(claimedPoolIds)
      );
    } else {
      localStorage.removeItem("gachav6LastClaimedPools");
    }

    // Save points gained
    if (pointsGained !== null) {
      localStorage.setItem(
        "gachav6LastPointsGained",
        JSON.stringify(pointsGained)
      );
    } else {
      localStorage.removeItem("gachav6LastPointsGained");
    }
  }, [claimRecap, claimedPoolIds, pointsGained]);

  /**
   * Fetch user gacha points via our proxy route => Gacha game API
   */
  const loadUserPoints = useCallback(async (): Promise<number | null> => {
    if (!isConnected || !address) return null;

    try {
      const response = await fetch("/api/gacha/points", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ wallet: address }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch points: ${response.status}`);
      }
      const data = await response.json();
      if (data.me) {
        const stats: GachaUserData = {
          wallet: data.me.wallet,
          points: data.me.points,
          ticketOpens: data.me.ticketOpens,
          biggestWinInEth: data.me.biggestWinInEth,
          totalWinInEth: data.me.totalWinInEth,
        };
        setUserData(stats);
        return stats.points;
      }
      return null;
    } catch (err) {
      console.error("[loadUserPoints] Error:", err);
      return null;
    }
  }, [address, isConnected]);

  /**
   * Load all user tickets for each pool
   */
  const loadUserTickets = useCallback(async () => {
    if (!isConnected || !address || !agwClient) return;

    console.log("[loadUserTickets] Loading ticket data...");
    setIsLoading(true);
    setError("");
    setTxHash(null);

    try {
      // Also load user points
      await loadUserPoints();

      const updated: PoolTicketInfo[] = [];
      for (const pool of pools) {
        // readContract => getTicket
        const result = (await publicClient.readContract({
          address: GACHAV6_CONTRACT_ADDRESS,
          abi: GACHAV6_ABI,
          functionName: "getTicket",
          args: [BigInt(pool.poolId), address],
        })) as { purchased: bigint; claimed: bigint };

        const purchased = result?.purchased || 0n;
        const claimed = result?.claimed || 0n;
        const available = purchased > claimed ? purchased - claimed : 0n;

        updated.push({
          ...pool,
          purchased,
          claimed,
          available,
          claimAmount: "",
        });
      }
      setPools(updated);
    } catch (err) {
      console.error("[loadUserTickets] Error:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, [address, agwClient, isConnected, loadUserPoints, pools]);

  /**
   * Set all pools to claim max
   */
  function setMaxForAllPools() {
    setPools((prev) =>
      prev.map((pool) => ({
        ...pool,
        claimAmount: pool.available > 0n ? pool.available.toString() : "",
      }))
    );
  }

  /**
   * Batch-claim all selected tickets in a single transaction.
   * Then poll logs to parse final results.
   */
  async function handleBatchClaim() {
    if (!isConnected || !address || !agwClient) {
      setError("Please connect your wallet first.");
      return;
    }

    try {
      setIsClaiming(true);
      setError("");
      setTxHash(null);
      setClaimRecap([]);
      setClaimedPoolIds([]);
      setPointsGained(null);

      // Get user points before claiming (for calculating how many gained)
      const pointsBefore = await loadUserPoints();
      console.log(`[handleBatchClaim] Starting points: ${pointsBefore}`);

      // Build calls array
      const calls: { to: `0x${string}`; data: `0x${string}` }[] = [];
      const poolTicketCounts: Record<number, number> = {};
      const poolsBeingClaimed: number[] = [];

      let totalTickets = 0;
      for (const pool of pools) {
        const amt = parseInt(pool.claimAmount.trim(), 10);
        if (!amt || amt <= 0) continue; // skip blank or 0
        if (BigInt(amt) > pool.available) {
          throw new Error(`Pool #${pool.poolId} => not enough tickets.`);
        }

        totalTickets += amt;
        poolTicketCounts[pool.poolId] =
          (poolTicketCounts[pool.poolId] || 0) + amt;
        if (!poolsBeingClaimed.includes(pool.poolId)) {
          poolsBeingClaimed.push(pool.poolId);
        }

        // each ticket => one call
        for (let i = 0; i < amt; i++) {
          const data = encodeFunctionData({
            abi: GACHAV6_ABI,
            functionName: "claim",
            args: [BigInt(pool.poolId)],
          });
          calls.push({ to: GACHAV6_CONTRACT_ADDRESS, data });
        }
      }

      if (totalTickets === 0) {
        throw new Error("No tickets to claim. Enter at least 1 ticket.");
      }

      console.log(
        `[handleBatchClaim] Attempting to claim ${totalTickets} tickets from:`,
        poolTicketCounts
      );

      // Send batch transaction
      const hash = (await agwClient.sendTransactionBatch({ calls })) as Hash;
      console.log("[handleBatchClaim] TX hash:", hash);
      setTxHash(hash);

      // Remember these in localStorage
      setClaimedPoolIds(poolsBeingClaimed);
      localStorage.setItem(
        "gachav6PoolTicketCounts",
        JSON.stringify(poolTicketCounts)
      );

      // Wait for transaction receipt
      console.log("[handleBatchClaim] Waiting for transaction receipt...");
      const rawReceipt = await publicClient.getTransactionReceipt({ hash });

      // 1) zksync receipts can differ from standard viem receipts
      //    so we forcibly cast to TransactionReceipt
      if (!rawReceipt) {
        throw new Error("Transaction receipt not found or timed out.");
      }
      const receipt = rawReceipt as unknown as TransactionReceipt;
      console.log("[handleBatchClaim] Receipt block #:", receipt.blockNumber);

      // parse "ClaimStarted" logs for seqNos
      const startedSeqNos = parseClaimStartedLogs(receipt, address);
      console.log(
        "[handleBatchClaim] Found these seqNos in ClaimStarted logs:",
        startedSeqNos
      );
      if (startedSeqNos.length !== totalTickets) {
        console.warn(
          `[handleBatchClaim] Expected ${totalTickets} seqNos, got ${startedSeqNos.length}.`
        );
      }

      // Poll for "ClaimSettled" logs
      const settledLogs = await pollForClaimSettled(
        receipt.blockNumber!,
        startedSeqNos,
        60_000
      );
      console.log("[handleBatchClaim] ClaimSettled logs:", settledLogs);
      setClaimRecap(settledLogs);

      // Wait a little while so the Gacha game backend updates
      await new Promise((resolve) => setTimeout(resolve, 8000));

      // Compare user points after claiming => how many gained
      const pointsAfter = await loadUserPoints();
      if (pointsAfter !== null && pointsBefore !== null) {
        const gained = pointsAfter - pointsBefore;
        setPointsGained(gained);
        console.log(`[handleBatchClaim] Ending points: ${pointsAfter}`);
        console.log(`[handleBatchClaim] Total points gained: ${gained}`);
      }

      // Refresh the user's tickets
      setTimeout(() => {
        void loadUserTickets();
      }, 1000);
    } catch (err) {
      console.error("[handleBatchClaim] Error:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsClaiming(false);
    }
  }

  /** Parse "ClaimStarted" logs from the given receipt. */
  function parseClaimStartedLogs(
    receipt: TransactionReceipt,
    user?: `0x${string}`
  ) {
    const seqNos: bigint[] = [];
    for (const log of receipt.logs) {
      try {
        // Fixed: Using the complete ABI and proper typing for topics
        const decoded = decodeEventLog({
          abi: GACHAV6_ABI,
          data: log.data,
          topics: log.topics,
        });

        if (decoded.eventName === "ClaimStarted") {
          const receiver = decoded.args.receiver as `0x${string}`;
          const seqNo = decoded.args.seqNo as bigint;

          // Ensure it matches our wallet (if provided)
          if (user && receiver.toLowerCase() !== user.toLowerCase()) {
            continue;
          }
          seqNos.push(seqNo);
        }
      } catch {
        // Not a ClaimStarted log
      }
    }
    return seqNos;
  }

  /** Poll for "ClaimSettled" logs that match our seqNos. */
  async function pollForClaimSettled(
    fromBlock: bigint,
    seqNos: bigint[],
    timeoutMs: number
  ): Promise<ClaimSettledLog[]> {
    const needed = new Set(seqNos);
    const found: ClaimSettledLog[] = [];
    const startTime = Date.now();

    if (!seqNos.length) {
      console.log("[pollForClaimSettled] No seqNos => empty result");
      return [];
    }

    while (Date.now() - startTime < timeoutMs && needed.size > 0) {
      console.log(
        "[pollForClaimSettled] Checking logs from block:",
        fromBlock,
        [...needed]
      );
      // Using the complete ABI instead of a single event ABI item
      const logs = await publicClient.getLogs({
        address: GACHAV6_CONTRACT_ADDRESS,
        fromBlock,
        toBlock: "latest",
        event: parseAbiItem(
          "event ClaimSettled(uint64 seqNo, address token, uint256 amount, uint256 tier)"
        ),
      });

      for (const log of logs) {
        const seqNo = log.args?.seqNo as bigint;
        if (!seqNo || !needed.has(seqNo)) continue;

        const token = log.args.token as `0x${string}`;
        const amount = log.args.amount as bigint;
        const tier = log.args.tier as bigint;

        found.push({ seqNo, token, amount, tier });
        needed.delete(seqNo);
        console.log("[pollForClaimSettled] Found seqNo:", seqNo.toString());
      }
      if (needed.size === 0) break;
      await new Promise((r) => setTimeout(r, 4000));
    }

    if (needed.size > 0) {
      console.warn("[pollForClaimSettled] Timed out, missing:", [...needed]);
    }
    return found;
  }

  /** Auto-load user tickets if connected */
  useEffect(() => {
    if (isConnected && agwClient) {
      void loadUserTickets();
    }
  }, [isConnected, agwClient, loadUserTickets]);

  /** Sum up all "claimAmount" for a quick display. */
  function totalTicketsToProcess() {
    return pools.reduce((sum, p) => {
      const amt = parseInt(p.claimAmount.trim(), 10);
      return sum + (isNaN(amt) ? 0 : amt);
    }, 0);
  }

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
          Please connect your wallet first.
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          {/* Gacha Points Summary */}
          {userData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-background border border-border rounded-lg p-3">
                <div className="text-xs text-muted mb-1">Gacha Points</div>
                <div className="font-medium text-lg">
                  {userData.points.toLocaleString()}
                </div>
              </div>
              <div className="bg-background border border-border rounded-lg p-3">
                <div className="text-xs text-muted mb-1">Ticket Opens</div>
                <div className="font-medium text-lg">
                  {userData.ticketOpens.toLocaleString()}
                </div>
              </div>
              <div className="bg-background border border-border rounded-lg p-3">
                <div className="text-xs text-muted mb-1">Biggest Win</div>
                <div className="font-medium text-lg">
                  {userData.biggestWinInEth.toFixed(4)} ETH
                </div>
              </div>
              <div className="bg-background border border-border rounded-lg p-3">
                <div className="text-xs text-muted mb-1">Total Wins</div>
                <div className="font-medium text-lg">
                  {userData.totalWinInEth.toFixed(4)} ETH
                </div>
              </div>
            </div>
          )}

          {/* Pools Table */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Pools</h2>
            <div className="flex space-x-2">
              <button
                onClick={setMaxForAllPools}
                disabled={isLoading || pools.every((p) => p.available === 0n)}
                className="px-3 py-1 bg-success text-white rounded-lg hover:bg-success-hover transition-colors text-sm disabled:opacity-50"
              >
                Set All Max
              </button>
              <button
                onClick={loadUserTickets}
                disabled={isLoading}
                className="px-3 py-1 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm"
              >
                {isLoading ? "Loading..." : "Refresh Tickets"}
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-2 text-left">Pool</th>
                  <th className="p-2 text-left">Purchased</th>
                  <th className="p-2 text-left">Claimed</th>
                  <th className="p-2 text-left">Available</th>
                  <th className="p-2 text-left">Claim Amount</th>
                </tr>
              </thead>
              <tbody>
                {pools.map((p, idx) => {
                  const maxAvail = Number(p.available);
                  return (
                    <tr key={p.poolId} className="border-b border-border">
                      <td className="p-2 font-medium">
                        {POOL_NAMES[p.poolId] || `Pool #${p.poolId}`}
                      </td>
                      <td className="p-2">{p.purchased.toString()}</td>
                      <td className="p-2">{p.claimed.toString()}</td>
                      <td className="p-2">{p.available.toString()}</td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            max={maxAvail}
                            value={p.claimAmount}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPools((prev) =>
                                prev.map((poolItem, i2) =>
                                  i2 === idx
                                    ? { ...poolItem, claimAmount: val }
                                    : poolItem
                                )
                              );
                            }}
                            className="w-16 px-2 py-1 bg-background border border-border rounded-lg"
                          />
                          {maxAvail > 0 && (
                            <button
                              onClick={() => {
                                setPools((prev) =>
                                  prev.map((poolItem, i2) =>
                                    i2 === idx
                                      ? {
                                          ...poolItem,
                                          claimAmount: p.available.toString(),
                                        }
                                      : poolItem
                                  )
                                );
                              }}
                              className="px-2 py-1 bg-success text-white rounded hover:bg-success-hover text-xs"
                            >
                              Max
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Claim Button */}
          <button
            onClick={handleBatchClaim}
            disabled={isClaiming || totalTicketsToProcess() === 0}
            className="w-full px-4 py-2 bg-success text-white rounded-lg hover:bg-success-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isClaiming
              ? "Claiming..."
              : `Claim ${totalTicketsToProcess() || ""} Tickets`}
          </button>

          {/* Error or Transaction Hash Display */}
          {error && (
            <div className="p-4 bg-danger/10 border border-danger/25 text-danger rounded-lg">
              {error}
            </div>
          )}
          {txHash && (
            <div className="p-4 bg-success/10 border border-success/25 text-success rounded-lg break-all">
              <p className="font-bold">Batch Claim Submitted!</p>
              <p className="text-sm mt-1">Tx Hash:</p>
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

          {/* Tab Navigation */}
          <div className="mt-4">
            <div className="border-b border-border">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab("lastClaim")}
                  className={`px-4 py-2 -mb-px text-sm font-medium transition-colors ${
                    activeTab === "lastClaim"
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  Last Claim Results
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`px-4 py-2 -mb-px text-sm font-medium transition-colors ${
                    activeTab === "history"
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  Claim History
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-4 bg-card border-x border-b border-border rounded-b-lg">
              {activeTab === "lastClaim" ? (
                <GachaClaimTab
                  claimRecap={claimRecap}
                  claimedPoolIds={claimedPoolIds}
                  pointsGained={pointsGained}
                />
              ) : (
                <GachaHistory wallet={address || ""} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
