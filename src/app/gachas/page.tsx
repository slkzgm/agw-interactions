// Path: src/app/gachas/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { encodeFunctionData } from "viem";
import { useAbstractClient } from "@abstract-foundation/agw-react";
import { useAccount } from "wagmi";
import { GACHAS_ABI, GACHAS_CONTRACT_ADDRESS } from "@/lib/gachasConstants";
import { readContract } from "@/app/actions";

interface TokenTransfer {
  id: string;
  amount: string;
}

interface GachaBalance {
  id: string;
  balance: bigint;
}

export default function GachasPage() {
  const { address, isConnected } = useAccount();
  const { data: agwClient } = useAbstractClient();

  // State for input fields
  const [destination, setDestination] = useState<string>("");
  const [transfers, setTransfers] = useState<TokenTransfer[]>([
    { id: "", amount: "" },
  ]);
  const [txHash, setTxHash] = useState<string>("");
  const [isTransferring, setIsTransferring] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [gachaBalances, setGachaBalances] = useState<GachaBalance[]>([]);
  const [isLoadingBalances, setIsLoadingBalances] = useState<boolean>(false);
  const [ownedGachaIds, setOwnedGachaIds] = useState<string[]>([]);

  // Load all user gacha balances - wrapped in useCallback to avoid dependency issues
  const loadUserGachaBalances = useCallback(async () => {
    if (!address) return;

    try {
      setIsLoadingBalances(true);

      // For this example, we'll check a range of gacha IDs (1-20)
      // In a production app, you might want to get the actual list of available gachas
      const gachaIdRange = Array.from({ length: 20 }, (_, i) =>
        (i + 1).toString()
      );

      // Create addresses array (all same address)
      const addresses = gachaIdRange.map(() => address);
      const tokenIds = gachaIdRange.map((id) => id);

      // Call server action instead of direct publicClient call
      const response = await readContract("gachas", "balanceOfBatch", [
        addresses,
        tokenIds,
      ]);

      if (!response.success) {
        throw new Error(response.error || "Failed to load gacha balances");
      }

      const balances = response.result as (string | number)[];

      // Create balance objects and filter those with non-zero balance
      const balanceObjects = gachaIdRange.map((id, index) => ({
        id,
        balance: BigInt(balances[index]), // Convert back to BigInt for local usage
      }));

      const nonZeroBalances = balanceObjects.filter(
        (item) => item.balance > BigInt(0)
      );
      setGachaBalances(nonZeroBalances);

      // Set list of owned gacha IDs
      setOwnedGachaIds(nonZeroBalances.map((item) => item.id));

      // Pre-populate the first transfer if user has gachas
      if (nonZeroBalances.length > 0) {
        setTransfers([
          {
            id: nonZeroBalances[0].id,
            amount: "1",
          },
        ]);
      }
    } catch (err) {
      console.error("Error loading gacha balances:", err);
      setError("Failed to load your gacha balances. Please try again.");
    } finally {
      setIsLoadingBalances(false);
    }
  }, [address]);

  // Load user's gacha balances when connected
  useEffect(() => {
    if (isConnected && address) {
      loadUserGachaBalances();
    }
  }, [isConnected, address, loadUserGachaBalances]);

  // Add a new gacha field
  const addGachaField = () => {
    setTransfers([...transfers, { id: "", amount: "" }]);
  };

  // Remove a gacha field
  const removeGachaField = (index: number) => {
    if (transfers.length > 1) {
      const newTransfers = [...transfers];
      newTransfers.splice(index, 1);
      setTransfers(newTransfers);
    }
  };

  // Update field values
  const updateTransfer = (
    index: number,
    field: keyof TokenTransfer,
    value: string
  ) => {
    const newTransfers = [...transfers];
    newTransfers[index][field] = value;
    setTransfers(newTransfers);
  };

  // Set max amount for a gacha
  const setMaxAmount = (index: number, gachaId: string) => {
    const gachaItem = gachaBalances.find((item) => item.id === gachaId);
    if (gachaItem) {
      const newTransfers = [...transfers];
      newTransfers[index].amount = gachaItem.balance.toString();
      setTransfers(newTransfers);
    }
  };

  // Handle batch transfer
  async function handleGachaTransfer() {
    try {
      setError("");
      setTxHash("");
      setIsTransferring(true);

      if (!agwClient) {
        throw new Error("AGW client is not available.");
      }

      if (!address || !isConnected) {
        throw new Error("Wallet not connected.");
      }

      if (!destination || !destination.startsWith("0x")) {
        throw new Error("Invalid destination address.");
      }

      // Filter out empty entries
      const validTransfers = transfers.filter(
        (t) => t.id.trim() !== "" && t.amount.trim() !== ""
      );

      if (validTransfers.length === 0) {
        throw new Error("No valid gachas to transfer.");
      }

      // Prepare token IDs and amounts arrays
      const ids = validTransfers.map((t) => BigInt(t.id.trim()));
      const amounts = validTransfers.map((t) => BigInt(t.amount.trim()));

      // Verify user has sufficient balances
      for (const transfer of validTransfers) {
        const gachaItem = gachaBalances.find((item) => item.id === transfer.id);
        const transferAmount = BigInt(transfer.amount);

        if (!gachaItem || gachaItem.balance < transferAmount) {
          throw new Error(`Insufficient balance for Gacha ID ${transfer.id}`);
        }
      }

      const data = encodeFunctionData({
        abi: GACHAS_ABI,
        functionName: "safeBatchTransferFrom",
        args: [
          address as `0x${string}`,
          destination as `0x${string}`,
          ids,
          amounts,
          "0x" as `0x${string}`, // No additional data
        ],
      });

      const hash = await agwClient.sendTransactionBatch({
        calls: [
          {
            to: GACHAS_CONTRACT_ADDRESS,
            data,
          },
        ],
      });

      setTxHash(hash);

      // Reset form after successful transaction
      setTimeout(() => {
        loadUserGachaBalances();
      }, 2000);
    } catch (err) {
      console.error("Error during gacha transfer:", err);
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
      <h1 className="text-3xl font-bold">Transfer Gachas</h1>
      <p className="text-muted">
        Transfer multiple gachas from your connected wallet to another address
        in a single transaction.
      </p>

      {isConnected ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gacha Balances Card */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Your Gacha Balances</h2>
              <button
                onClick={loadUserGachaBalances}
                disabled={isLoadingBalances}
                className="px-3 py-1 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm"
              >
                {isLoadingBalances ? "Loading..." : "Refresh"}
              </button>
            </div>

            {isLoadingBalances ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : gachaBalances.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {gachaBalances.map((gacha) => (
                  <div
                    key={gacha.id}
                    className="flex justify-between items-center p-3 bg-background border border-border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">Gacha #{gacha.id}</div>
                      <div className="text-sm text-muted">
                        Balance: {gacha.balance.toString()}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        // Add this gacha to transfers if not already there
                        if (!transfers.some((t) => t.id === gacha.id)) {
                          setTransfers([
                            ...transfers,
                            { id: gacha.id, amount: "1" },
                          ]);
                        }
                      }}
                      className="px-2 py-1 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-xs"
                    >
                      Transfer
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted">
                You don&apos;t have any gachas yet.
              </div>
            )}
          </div>

          {/* Transfer Form Card */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold">Transfer Gachas</h2>

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

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block font-semibold">
                  Gachas to Transfer
                </label>
                <button
                  onClick={addGachaField}
                  className="px-2 py-1 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm"
                >
                  + Add Gacha
                </button>
              </div>

              {transfers.map((transfer, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="flex-1 space-y-1">
                    <select
                      value={transfer.id}
                      onChange={(e) =>
                        updateTransfer(index, "id", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="">Select Gacha ID</option>
                      {ownedGachaIds.map((id) => (
                        <option key={id} value={id}>
                          Gacha #{id}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex space-x-1">
                      <input
                        type="text"
                        placeholder="Amount"
                        value={transfer.amount}
                        onChange={(e) =>
                          updateTransfer(index, "amount", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      {transfer.id && (
                        <button
                          type="button"
                          onClick={() => setMaxAmount(index, transfer.id)}
                          className="px-2 py-1 bg-success text-white rounded-lg hover:bg-success-hover transition-colors text-sm whitespace-nowrap"
                        >
                          Max
                        </button>
                      )}
                    </div>
                  </div>
                  {transfers.length > 1 && (
                    <button
                      onClick={() => removeGachaField(index)}
                      className="px-2 py-1 bg-danger text-white rounded-lg hover:bg-danger-hover transition-colors text-sm"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleGachaTransfer}
              disabled={
                isTransferring || !destination || transfers.every((t) => !t.id)
              }
              className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTransferring ? "Transferring..." : "Transfer Gachas"}
            </button>

            {error && (
              <div className="mt-4 p-4 bg-danger/10 border border-danger/25 text-danger rounded-lg">
                Error: {error}
              </div>
            )}

            {txHash && (
              <div className="mt-4 p-4 bg-success/10 border border-success/25 text-success rounded-lg break-all">
                <p className="font-bold">Gacha Transfer Submitted!</p>
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
      ) : (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <p className="text-xl mb-4">
            Please connect your wallet to view and transfer your gachas
          </p>
          <p className="text-muted">
            Use the Connect button in the navigation bar
          </p>
        </div>
      )}
    </div>
  );
}
