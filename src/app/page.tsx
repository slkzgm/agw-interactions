// Path: src/app/contract-explorer/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useAbstractClient } from "@abstract-foundation/agw-react";
import { AbstractClient } from "@abstract-foundation/agw-client";
import { readDynamicContract as readContractData } from "./actions";
import { CONTRACT_ABI } from "@/lib/constants";

interface ContractFunction {
  name: string;
  type: string;
  stateMutability?: "view" | "pure" | "nonpayable" | "payable";
  inputs?: Array<{
    name: string;
    type: string;
    internalType?: string;
  }>;
  outputs?: Array<{
    name: string;
    type: string;
    internalType?: string;
  }>;
}

export default function ContractExplorerPage() {
  const { status } = useAccount();
  const { data: agwClient } = useAbstractClient();

  // State for contract input
  const [contractAddress, setContractAddress] = useState<string>("");
  const [contractABI, setContractABI] = useState<string>("");
  const [parsedABI, setParsedABI] = useState<ContractFunction[]>([]);
  const [abiError, setAbiError] = useState<string>("");

  // UI states
  const [selectedTab, setSelectedTab] = useState<"read" | "write">("read");
  const [isExploring, setIsExploring] = useState<boolean>(false);

  // Parse ABI when it changes
  useEffect(() => {
    if (contractABI.trim() === "") {
      setParsedABI([]);
      return;
    }

    try {
      const parsed = JSON.parse(contractABI);
      if (!Array.isArray(parsed)) {
        setAbiError("ABI must be a JSON array");
        setParsedABI([]);
        return;
      }

      // Filter out non-function items and normalize function objects
      const functions = parsed.filter(
        (item) => item.type === "function" && item.name
      ) as ContractFunction[];

      setParsedABI(functions);
      setAbiError("");
    } catch (error) {
      console.error("Error parsing ABI:", error);
      setAbiError("Invalid JSON ABI");
      setParsedABI([]);
    }
  }, [contractABI]);

  // Filter read and write functions
  const readFunctions = parsedABI.filter(
    (fn) => fn.stateMutability === "view" || fn.stateMutability === "pure"
  );

  const writeFunctions = parsedABI.filter(
    (fn) => fn.stateMutability !== "view" && fn.stateMutability !== "pure"
  );

  // Handle form submission
  const handleExploreContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (contractAddress && parsedABI.length > 0) {
      setIsExploring(true);
    }
  };

  // Reset exploration
  const resetExploration = () => {
    setIsExploring(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Contract Explorer</h1>
        <p className="text-muted mt-2">
          Interact with any contract by providing its address and ABI
        </p>
      </div>

      {!isExploring ? (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <form onSubmit={handleExploreContract} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="contractAddress" className="block font-medium">
                Contract Address
              </label>
              <input
                id="contractAddress"
                type="text"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="contractABI" className="block font-medium">
                Contract ABI (JSON)
              </label>
              <textarea
                id="contractABI"
                value={contractABI}
                onChange={(e) => setContractABI(e.target.value)}
                placeholder='[{"inputs":[],"name":"balanceOf",...}]'
                className="w-full h-64 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-mono text-sm"
                required
              />
              {abiError && <p className="text-danger text-sm">{abiError}</p>}
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                disabled={!contractAddress || parsedABI.length === 0}
              >
                Explore Contract
              </button>
              <button
                type="button"
                onClick={() => {
                  setContractAddress("");
                  setContractABI("");
                }}
                className="px-4 py-2 bg-background border border-border text-foreground rounded-lg hover:bg-card transition-colors"
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">
                Contract: {contractAddress}
              </h2>
              <p className="text-sm text-muted">
                {parsedABI.length} functions found
              </p>
            </div>
            <button
              onClick={resetExploration}
              className="px-3 py-1 bg-background border border-border text-foreground rounded-lg hover:bg-card transition-colors"
            >
              Change Contract
            </button>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="border-b border-border mb-4">
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedTab("read")}
                  className={`px-4 py-2 -mb-px text-sm font-medium transition-colors ${
                    selectedTab === "read"
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  Read Functions ({readFunctions.length})
                </button>
                <button
                  onClick={() => setSelectedTab("write")}
                  className={`px-4 py-2 -mb-px text-sm font-medium transition-colors ${
                    selectedTab === "write"
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  Write Functions ({writeFunctions.length})
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {selectedTab === "read" ? (
                readFunctions.length > 0 ? (
                  readFunctions.map((fn, index) => (
                    <ContractFunctionRead
                      key={index}
                      fn={fn}
                      contractAddress={contractAddress}
                    />
                  ))
                ) : (
                  <p className="text-center text-muted py-8">
                    No read functions found
                  </p>
                )
              ) : writeFunctions.length > 0 ? (
                status === "connected" && agwClient ? (
                  writeFunctions.map((fn, index) => (
                    <ContractFunctionWrite
                      key={index}
                      fn={fn}
                      contractAddress={contractAddress}
                      agwClient={agwClient as AbstractClient}
                    />
                  ))
                ) : (
                  <p className="text-center text-muted py-8">
                    Please connect your wallet to interact with write functions
                  </p>
                )
              ) : (
                <p className="text-center text-muted py-8">
                  No write functions found
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Component for read functions - using server actions
function ContractFunctionRead({
  fn,
  contractAddress,
}: {
  fn: ContractFunction;
  contractAddress: string;
}) {
  const [inputValues, setInputValues] = useState<string[]>([]);
  const [result, setResult] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Parse inputs and execute read call using server action
  const handleReadCall = async () => {
    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const parsedArgs =
        fn.inputs?.map((input, i) => {
          const rawValue = inputValues[i] || "";

          // Handle array types
          if (input.type.endsWith("[]")) {
            try {
              const arr = JSON.parse(rawValue);
              if (!Array.isArray(arr)) {
                throw new Error(`Argument #${i} must be a JSON array`);
              }
              if (input.type.includes("uint") || input.type.includes("int")) {
                return arr.map((x: number | string) => {
                  // Convert to string for serialization to server
                  const bigIntValue = BigInt(x.toString());
                  return bigIntValue.toString();
                });
              }
              return arr;
            } catch (err) {
              throw new Error(`Parsing error for argument #${i}: ${err}`);
            }
          }

          // Handle integer types
          if (input.type.includes("uint") || input.type.includes("int")) {
            // Convert to string for serialization to server
            return rawValue ? BigInt(rawValue).toString() : "0";
          }

          // Fallback for strings, addresses, etc.
          return rawValue;
        }) || [];

      // Call the server action
      const response = await readContractData(
        contractAddress,
        [fn], // Pass just this function as ABI
        fn.name,
        parsedArgs
      );

      if (response.success) {
        setResult(response.data);
      } else {
        setError(response.error || "Unknown error occurred");
      }
    } catch (err) {
      console.error(`Error executing ${fn.name}:`, err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background border border-border rounded-lg p-4">
      <div className="space-y-4">
        <div className="flex items-baseline">
          <h3 className="text-lg font-medium">{fn.name}</h3>
          <span className="ml-2 text-sm text-muted">(Read)</span>
        </div>

        <div className="space-y-4">
          {fn.inputs && fn.inputs.length > 0 ? (
            fn.inputs.map((input, i) => (
              <div key={i} className="space-y-1">
                <label className="block text-sm font-medium">
                  {input.name || `arg${i}`} ({input.type})
                </label>
                <input
                  type="text"
                  placeholder={
                    input.type.endsWith("[]") ? "[1, 2, 3]" : input.type
                  }
                  value={inputValues[i] || ""}
                  onChange={(e) => {
                    const newInputs = [...inputValues];
                    newInputs[i] = e.target.value;
                    setInputValues(newInputs);
                  }}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            ))
          ) : (
            <p className="text-sm text-muted">No parameters required</p>
          )}

          <button
            onClick={handleReadCall}
            disabled={isLoading}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                Loading...
              </span>
            ) : (
              "Read"
            )}
          </button>

          {result !== null && (
            <div className="mt-4 p-4 bg-background border border-border rounded-lg overflow-x-auto">
              <p className="font-medium mb-1">Result:</p>
              <pre className="text-sm whitespace-pre-wrap break-all">
                {typeof result === "object"
                  ? JSON.stringify(result, null, 2)
                  : String(result)}
              </pre>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-danger/10 border border-danger/25 text-danger rounded-lg">
              <p className="font-medium">Error:</p>
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Component for write functions (still needs client-side execution)
function ContractFunctionWrite({
  fn,
  contractAddress,
  agwClient,
}: {
  fn: ContractFunction;
  contractAddress: string;
  agwClient: AbstractClient;
}) {
  const [inputValues, setInputValues] = useState<string[]>([]);
  const [valueEth, setValueEth] = useState<string>("0");
  const [result, setResult] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const isPayable = fn.stateMutability === "payable";

  const handleWriteCall = async () => {
    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const parsedArgs =
        fn.inputs?.map((input, i) => {
          const rawValue = inputValues[i] || "";

          // Handle array types
          if (input.type.endsWith("[]")) {
            try {
              const arr = JSON.parse(rawValue);
              if (!Array.isArray(arr)) {
                throw new Error(`Argument #${i} must be a JSON array`);
              }
              if (input.type.includes("uint") || input.type.includes("int")) {
                return arr.map((x: number | string) => BigInt(x.toString()));
              }
              return arr;
            } catch (err) {
              throw new Error(`Parsing error for argument #${i}: ${err}`);
            }
          }

          // Handle integer types
          if (input.type.includes("uint") || input.type.includes("int")) {
            return rawValue ? BigInt(rawValue) : undefined;
          }

          // Fallback for strings, addresses, etc.
          return rawValue;
        }) || [];

      let valueBigInt: bigint | undefined;
      if (isPayable && valueEth && valueEth !== "0") {
        const floatVal = parseFloat(valueEth);
        if (Number.isNaN(floatVal)) {
          throw new Error(`Invalid ETH value: ${valueEth}`);
        }
        valueBigInt = BigInt(Math.floor(floatVal * 1e18));
      }

      // Write operations still need to be client-side for wallet signing
      const txHash = await agwClient.writeContract({
        address: contractAddress as `0x${string}`,
        abi: [fn] as unknown as typeof CONTRACT_ABI, // Cast single function ABI to the expected type
        functionName: fn.name,
        args: parsedArgs,
        value: valueBigInt,
      });

      setResult(txHash);
    } catch (err) {
      console.error(`Error executing ${fn.name}:`, err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background border border-border rounded-lg p-4">
      <div className="space-y-4">
        <div className="flex items-baseline">
          <h3 className="text-lg font-medium">{fn.name}</h3>
          <span className="ml-2 text-sm text-muted">(Write)</span>
        </div>

        <div className="space-y-4">
          {fn.inputs && fn.inputs.length > 0 ? (
            fn.inputs.map((input, i) => (
              <div key={i} className="space-y-1">
                <label className="block text-sm font-medium">
                  {input.name || `arg${i}`} ({input.type})
                </label>
                <input
                  type="text"
                  placeholder={
                    input.type.endsWith("[]") ? "[1, 2, 3]" : input.type
                  }
                  value={inputValues[i] || ""}
                  onChange={(e) => {
                    const newInputs = [...inputValues];
                    newInputs[i] = e.target.value;
                    setInputValues(newInputs);
                  }}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            ))
          ) : (
            <p className="text-sm text-muted">No parameters required</p>
          )}

          {isPayable && (
            <div className="space-y-1">
              <label className="block text-sm font-medium">Value (ETH)</label>
              <input
                type="number"
                placeholder="0.01"
                value={valueEth}
                onChange={(e) => setValueEth(e.target.value)}
                step="0.001"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          )}

          <button
            onClick={handleWriteCall}
            disabled={isLoading}
            className="px-4 py-2 bg-success text-white rounded-lg hover:bg-success-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                Processing transaction...
              </span>
            ) : (
              "Write"
            )}
          </button>

          {result != null && (
            <div className="mt-4 p-4 bg-success/10 border border-success/25 text-success rounded-lg break-all">
              <p className="font-bold">Transaction submitted!</p>
              <p className="text-sm mt-1">Transaction hash:</p>
              <a
                href={`https://abscan.org/tx/${result}`}
                target="_blank"
                rel="noreferrer"
                className="underline break-all"
              >
                {String(result)}
              </a>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-danger/10 border border-danger/25 text-danger rounded-lg">
              <p className="font-medium">Error:</p>
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
