// Path: src/components/gacha/GachaClaimTab.tsx

/**
 * /src/components/gacha/GachaClaimTab.tsx
 * Description: Displays the results of the last Gacha V6 claim, showing pool summaries and token wins.
 */

import React from "react";
import { POOL_NAMES, TOKEN_INFO } from "@/lib/gachaV6Constants";
import { GachaResultsDisplay } from "./GachaResultsDisplay";

// Typed interface for a single "claim settled" log
export interface ClaimSettledLog {
  seqNo: bigint;
  token: `0x${string}`;
  amount: bigint;
  tier: bigint;
}

// Props for our GachaClaimTab component
interface GachaClaimTabProps {
  claimRecap: ClaimSettledLog[];
  claimedPoolIds: number[];
  pointsGained: number | null;
}

// We'll parse "gachav6PoolTicketCounts" from localStorage as Record<number, number> to avoid "any".
function parsePoolTicketCounts(): Record<number, number> {
  try {
    const stored = localStorage.getItem("gachav6PoolTicketCounts");
    if (stored) {
      // Safely cast to the known shape: Record<number, number>
      return JSON.parse(stored) as Record<number, number>;
    }
  } catch (e) {
    console.warn("Could not parse pool ticket counts", e);
  }
  return {};
}

export function GachaClaimTab({
  claimRecap,
  claimedPoolIds,
  pointsGained,
}: GachaClaimTabProps) {
  // Safely parse from localStorage with an explicit type.
  const poolTicketCounts = parsePoolTicketCounts();

  // If user hasn't claimed anything recently, just show a placeholder.
  if (claimRecap.length === 0) {
    return (
      <div className="text-center py-8 text-muted">
        No recent claim results. Claim some tickets to see results here.
      </div>
    );
  }

  // Filter out the "points" token to show only token wins in the main table
  const tokenWins = claimRecap.filter(
    (c) =>
      c.token.toLowerCase() !== "0x0000000000000000000000000000000000000000"
  );

  // Group token wins by type
  const tokenWinsByType = tokenWins.reduce(
    (acc, item) => {
      const key = item.token.toLowerCase();
      if (!acc[key]) {
        const tokenInfo = TOKEN_INFO[key] || {
          name: `Unknown Token (${key.slice(0, 6)}...)`,
          symbol: "???",
        };
        acc[key] = {
          token: key,
          tokenInfo,
          count: 0,
          totalAmount: BigInt(0),
        };
      }
      acc[key].count++;
      acc[key].totalAmount += item.amount;
      return acc;
    },
    {} as Record<
      string,
      {
        token: string;
        tokenInfo: { name: string; symbol: string };
        count: number;
        totalAmount: bigint;
      }
    >
  );

  // For pool-based summary of wins
  const poolWinCounts: Record<number, number> = {};
  for (const log of tokenWins) {
    const poolId = Number(log.tier);
    poolWinCounts[poolId] = (poolWinCounts[poolId] || 0) + 1;
  }

  // Build the pool summaries using both the stored local poolTicketCounts (for totalClaimed)
  // and the counts from the tokenWins (for .wins).
  const poolSummaries = claimedPoolIds.map((poolId) => ({
    poolId,
    poolName: POOL_NAMES[poolId] || `Pool #${poolId}`,
    totalClaimed: poolTicketCounts[poolId] || 0, // how many tickets you tried to claim
    wins: poolWinCounts[poolId] || 0,
  }));

  // Convert claim logs to GachaResultsDisplay format
  const rewards = tokenWins.map((log) => ({
    token: log.token,
    amount: log.amount,
    poolId: Number(log.tier),
  }));

  return (
    <GachaResultsDisplay
      title="Last Claim Results"
      totalTickets={claimRecap.length}
      totalPointsEarned={pointsGained || 0}
      totalTokenWins={tokenWins.length}
      tokenSummaries={Object.values(tokenWinsByType)}
      poolSummaries={poolSummaries}
      rewards={rewards}
      showTimestamp={false}
    />
  );
}
