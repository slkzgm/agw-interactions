// Path: src/components/gacha/GachaHistory.tsx

/**
 * /src/components/gacha/GachaHistory.tsx
 * Description: Loads and displays the user's past Gacha results (including points wins and token wins),
 * along with per-pool stats (including total tickets for each pool and the win rate).
 */

import React, { useState, useEffect } from "react";
import { GachaResultsDisplay } from "./GachaResultsDisplay";
import { POOL_NAMES, TOKEN_INFO } from "@/lib/gachaV6Constants";

// Represents one entry in the gacha history
interface GachaHistoryItem {
  poolId: number;
  winAmount: number;
  winToken: string;
  winType: string; // "points" or "token"
  blockNumber: number;
  timestamp: string;
}

interface GachaHistoryProps {
  wallet: string;
}

export function GachaHistory({ wallet }: GachaHistoryProps) {
  const [history, setHistory] = useState<GachaHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!wallet) return;

    async function fetchHistory() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch("/api/gacha/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet }),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch history: ${response.status}`);
        }

        // Cast the fetched data as an array of GachaHistoryItem to avoid "any"
        const data = (await response.json()) as GachaHistoryItem[];

        // If it isn't an array or is empty, set an empty array
        if (!Array.isArray(data)) {
          setHistory([]);
        } else {
          setHistory(data);
        }
      } catch (err) {
        console.error("Error fetching gacha history:", err);
        setError(err instanceof Error ? err.message : "Failed to load history");
      } finally {
        setIsLoading(false);
      }
    }

    fetchHistory();
  }, [wallet]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-danger/10 border border-danger/25 text-danger rounded-lg">
        Error loading history: {error}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-muted">
        No gacha history found for this wallet.
      </div>
    );
  }

  // Separate points wins from token wins
  const pointsWins = history.filter((item) => item.winType === "points");
  const tokenWins = history.filter((item) => item.winType !== "points");

  // Calculate total points earned
  const totalPointsEarned = pointsWins.reduce(
    (sum, item) => sum + item.winAmount,
    0
  );

  // Summaries for each token type
  const tokenWinsByType = tokenWins.reduce(
    (acc, item) => {
      const key = item.winToken.toLowerCase();
      if (!acc[key]) {
        const tokenInfo = TOKEN_INFO[key] || {
          name: `Unknown Token (${key.slice(0, 6)}...)`,
          symbol: "???",
        };
        acc[key] = {
          token: key,
          tokenInfo,
          count: 0,
          totalAmount: 0,
        };
      }
      acc[key].count++;
      acc[key].totalAmount += item.winAmount;
      return acc;
    },
    {} as Record<
      string,
      {
        token: string;
        tokenInfo: { name: string; symbol: string };
        count: number;
        totalAmount: number;
      }
    >
  );

  // Build pool stats from the entire history
  // We'll count how many times each pool was used, and how many times it resulted in a token win.
  const poolStats = history.reduce(
    (acc, item) => {
      const pId = item.poolId;
      if (!acc[pId]) {
        acc[pId] = { poolId: pId, tickets: 0, wins: 0 };
      }
      // Every item in "history" is 1 ticket
      acc[pId].tickets++;
      // If it wasn't "points", that means it's a token win => increment wins
      if (item.winType !== "points") {
        acc[pId].wins++;
      }
      return acc;
    },
    {} as Record<number, { poolId: number; tickets: number; wins: number }>
  );

  // Convert that into the shape GachaResultsDisplay expects
  const poolSummaries = Object.values(poolStats).map((pool) => ({
    poolId: pool.poolId,
    poolName: POOL_NAMES[pool.poolId] || `Pool #${pool.poolId}`,
    // totalClaimed is effectively the total # of tickets in the user's history
    // for that pool
    totalClaimed: pool.tickets,
    wins: pool.wins,
  }));

  // Prepare detail rows for GachaResultsDisplay
  const rewards = tokenWins.map((item) => ({
    token: item.winToken,
    amount: item.winAmount,
    formattedAmount: item.winAmount.toFixed(6),
    poolId: item.poolId,
    timestamp: item.timestamp,
  }));

  return (
    <GachaResultsDisplay
      title="Claim History"
      subtitle="(Limited to last 50 tickets)"
      isLimitedHistory={true}
      totalTickets={history.length}
      totalPointsEarned={totalPointsEarned}
      totalTokenWins={tokenWins.length}
      tokenSummaries={Object.values(tokenWinsByType)}
      poolSummaries={poolSummaries}
      rewards={rewards}
      showTimestamp={true}
    />
  );
}
