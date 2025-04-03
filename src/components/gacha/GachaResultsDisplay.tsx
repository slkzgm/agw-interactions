// Path: src/components/gacha/GachaResultsDisplay.tsx
// (Unmodified except for clarifying that poolSummaries now includes total tickets and
// automatically displays the win rate.)
//
// This file already supports "poolSummaries" with { totalClaimed, wins } and prints a "win rate".
// No changes needed other than to confirm it will show totalClaimed and calculate the rate.
//
// (Included here only so you see it's unchanged.)

import React from "react";
import { formatDistanceToNow } from "date-fns";
import { formatUnits } from "viem";
import { TOKEN_INFO, POOL_NAMES } from "@/lib/gachaV6Constants";

interface TokenReward {
  token: string;
  amount: bigint | number;
  formattedAmount?: string;
  poolId: number;
  timestamp?: string;
}

interface TokenSummary {
  token: string;
  tokenInfo: { name: string; symbol: string };
  count: number;
  totalAmount: number | bigint;
}

interface PoolSummary {
  poolId: number;
  poolName: string;
  totalClaimed?: number;
  wins: number;
}

interface GachaResultsDisplayProps {
  title: string;
  subtitle?: string;
  isLimitedHistory?: boolean;

  totalTickets: number;
  totalPointsEarned: number;
  totalTokenWins: number;

  tokenSummaries: TokenSummary[];
  poolSummaries?: PoolSummary[];

  rewards: TokenReward[];
  showTimestamp?: boolean;
}

export function GachaResultsDisplay({
  title,
  subtitle,
  isLimitedHistory,
  totalTickets,
  totalPointsEarned,
  totalTokenWins,
  tokenSummaries,
  poolSummaries,
  rewards,
  showTimestamp = false,
}: GachaResultsDisplayProps) {
  function getTokenInfo(tokenAddress: string) {
    const lowerCase = tokenAddress.toLowerCase();
    return (
      TOKEN_INFO[lowerCase] || {
        name: `Unknown Token (${lowerCase.slice(0, 6)}...)`,
        symbol: "???",
      }
    );
  }

  function getPoolName(poolId: number, providedName?: string) {
    if (providedName) return providedName;
    return POOL_NAMES[poolId] || `Pool #${poolId}`;
  }

  function getTimeAgo(timestamp?: string) {
    if (!timestamp) return "Unknown time";
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return "Unknown time";
    }
  }

  function calculateWinRate(wins: number, total: number) {
    if (total === 0) return "0%";
    return `${((wins / total) * 100).toFixed(1)}%`;
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-background border border-border rounded-lg p-3">
          <div className="text-xs text-muted mb-1">Total Tickets</div>
          <div className="font-medium text-lg">
            {totalTickets.toLocaleString()}
          </div>
        </div>

        <div className="bg-background border border-border rounded-lg p-3">
          <div className="text-xs text-muted mb-1">GP Earned</div>
          <div className="font-medium text-lg">
            {totalPointsEarned.toLocaleString()}
          </div>
        </div>

        <div className="bg-background border border-border rounded-lg p-3">
          <div className="text-xs text-muted mb-1">Token Wins</div>
          <div className="font-medium text-lg">{totalTokenWins}</div>
        </div>

        <div className="bg-background border border-border rounded-lg p-3">
          <div className="text-xs text-muted mb-1">Win Rate</div>
          <div className="font-medium text-lg">
            {calculateWinRate(totalTokenWins, totalTickets)}
          </div>
        </div>
      </div>

      {/* Pool Summaries if available */}
      {poolSummaries && poolSummaries.length > 0 && (
        <div className="bg-background border border-border rounded-lg p-4">
          <h4 className="text-base font-medium mb-2">Pools Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {poolSummaries.map((pool) => (
              <div
                key={pool.poolId}
                className="border border-border rounded-lg p-3"
              >
                <div className="font-medium">{pool.poolName}</div>
                <div className="text-sm">
                  {pool.totalClaimed
                    ? `${pool.totalClaimed} ticket${
                        pool.totalClaimed !== 1 ? "s" : ""
                      } · `
                    : ""}
                  {pool.wins} win{pool.wins !== 1 ? "s" : ""}
                  {pool.totalClaimed
                    ? ` · Win rate: ${calculateWinRate(
                        pool.wins,
                        pool.totalClaimed
                      )}`
                    : ""}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Token Win Summary */}
      {tokenSummaries.length > 0 && (
        <div className="bg-background border border-border rounded-lg p-4">
          <h4 className="text-base font-medium mb-2">
            Token Rewards Summary
            {isLimitedHistory && (
              <span className="ml-2 text-xs text-muted">
                (Limited to last 50 tickets)
              </span>
            )}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tokenSummaries.map((summary, index) => (
              <div key={index} className="border border-border rounded-lg p-3">
                <div className="font-medium">{summary.tokenInfo.name}</div>
                <div className="text-sm">
                  {summary.count > 0 &&
                    `${summary.count} win${summary.count !== 1 ? "s" : ""} · `}
                  Total:{" "}
                  {typeof summary.totalAmount === "bigint"
                    ? parseFloat(formatUnits(summary.totalAmount, 18)).toFixed(
                        6
                      )
                    : summary.totalAmount.toFixed(6)}{" "}
                  {summary.tokenInfo.symbol}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Details Table */}
      <div className="bg-background border border-border rounded-lg overflow-hidden">
        <div className="border-b border-border">
          <h4 className="text-base font-medium p-4">
            {title}
            {subtitle && (
              <span className="ml-2 text-xs text-muted">{subtitle}</span>
            )}
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="p-2 text-left">Pool</th>
                <th className="p-2 text-left">Reward</th>
                <th className="p-2 text-right">Amount</th>
                {showTimestamp && <th className="p-2 text-right">Time</th>}
              </tr>
            </thead>
            <tbody>
              {rewards.map((item, idx) => {
                const tokenInfo = getTokenInfo(item.token);
                // If no preformatted amount, auto-format from BigInt
                const displayAmount =
                  item.formattedAmount ||
                  (typeof item.amount === "bigint"
                    ? parseFloat(formatUnits(item.amount, 18)).toFixed(6)
                    : item.amount.toFixed(6));

                return (
                  <tr
                    key={idx}
                    className="border-b border-border hover:bg-card"
                  >
                    <td className="p-2">{getPoolName(item.poolId)}</td>
                    <td className="p-2 text-success">{tokenInfo.symbol}</td>
                    <td className="p-2 text-right font-mono">
                      {displayAmount}
                    </td>
                    {showTimestamp && (
                      <td className="p-2 text-right text-muted">
                        {getTimeAgo(item.timestamp)}
                      </td>
                    )}
                  </tr>
                );
              })}
              {rewards.length === 0 && (
                <tr>
                  <td
                    colSpan={showTimestamp ? 4 : 3}
                    className="p-4 text-center text-muted"
                  >
                    No token rewards found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
