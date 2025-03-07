// Path: src/app/batch-transfer/page.tsx
"use client";

/**
 * Full page for batch-transferring multiple NFTs from the current user to a single address.
 * Uses the AGW client and the contract's standard transferFrom / safeTransferFrom function calls.
 * If the contract had a built-in "transferMany" function, we'd prefer that single call;
 * but since it doesn't, we batch multiple transfer calls in a single transaction.
 */

import React, { useState } from "react";
import { encodeFunctionData } from "viem";
import { HEROES_ABI, HEROES_CONTRACT_ADDRESS } from "@/lib/heroesConstants";
import {useAbstractClient} from '@abstract-foundation/agw-react';
import {useAccount} from 'wagmi';

export default function BatchTransferPage() {
  const { address, status } = useAccount();
  const { data: agwClient } = useAbstractClient();

  // State for the input fields
  const [destination, setDestination] = useState<string>("");
  const [tokenIds, setTokenIds] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");
  const [isTransferring, setIsTransferring] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  /**
   * Handle the batch transfer
   */
  async function handleBatchTransfer() {
    try {
      setError("");
      setTxHash("");
      setIsTransferring(true);

      if (!agwClient) {
        throw new Error("AGW client is not available.");
      }
      if (!address || status !== "connected") {
        throw new Error("Wallet not connected.");
      }

      // Parse user input for token IDs; expects comma-separated or JSON array
      // Example inputs: "1,2,3" or "[1,2,3]"
      let parsedIds: number[];

      try {
        if (tokenIds.trim().startsWith("[") && tokenIds.trim().endsWith("]")) {
          // Attempt JSON parse if it looks like an array
          parsedIds = JSON.parse(tokenIds.trim());
        } else {
          // Otherwise, parse comma-separated
          parsedIds = tokenIds
            .split(",")
            .map((id) => parseInt(id.trim(), 10))
            .filter((id) => !isNaN(id));
        }
      } catch (err) {
        console.error(err)
        throw new Error(
          "Invalid token ID list. Provide comma-separated or JSON array of token IDs."
        );
      }

      if (!destination || !destination.startsWith("0x")) {
        throw new Error("Invalid destination address.");
      }
      if (parsedIds.length === 0) {
        throw new Error("No token IDs provided.");
      }

      const calls = parsedIds.map((id) => {
        return {
          to: HEROES_CONTRACT_ADDRESS,
          data: encodeFunctionData({
            abi: HEROES_ABI,
            functionName: "safeTransferFrom",
            args: [address, destination as `0x${string}`, BigInt(id)],
          }),
        };
      });

      const hash = await agwClient.sendTransactionBatch({
        calls,
      });

      setTxHash(hash);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    } finally {
      setIsTransferring(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Batch Transfer NFTs</h1>
      <p className="text-muted">
        Transfer multiple NFTs from your connected wallet to the same address in
        a single transaction batch.
      </p>

      <div className="bg-card border border-border rounded-lg p-6 space-y-4 max-w-lg">
        <div className="space-y-1">
          <label className="block font-semibold">Destination Address</label>
          <input
            type="text"
            placeholder="0xRecipientAddress"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="space-y-1">
          <label className="block font-semibold">Token IDs</label>
          <input
            type="text"
            placeholder="e.g. 1,2,3 or [1,2,3]"
            value={tokenIds}
            onChange={(e) => setTokenIds(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <p className="text-sm text-muted">
            Enter comma-separated IDs or a JSON array. Example: 1,2,3 or [1,2,3]
          </p>
        </div>

        <button
          onClick={handleBatchTransfer}
          disabled={isTransferring || !agwClient || status !== "connected"}
          className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isTransferring ? "Transferring..." : "Transfer"}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-danger/10 border border-danger/25 text-danger rounded-lg">
            Error: {error}
          </div>
        )}

        {txHash && (
          <div className="mt-4 p-4 bg-success/10 border border-success/25 text-success rounded-lg break-all">
            <p className="font-bold">Batch Transfer Submitted!</p>
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
    </div>
  );
}
