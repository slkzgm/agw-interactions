// Path: src/components/Function.tsx
import React, { useState } from "react";
import type { AbstractClient } from "@abstract-foundation/agw-client";
import type { AbiFunction } from "@/lib/constants";
import { CONTRACT_ABI } from "@/lib/constants";

interface FunctionProps {
  fn: AbiFunction;
  contractAddress: `0x${string}`;
  agwClient: AbstractClient;
}

export function Function({ fn, contractAddress, agwClient }: FunctionProps) {
  const [inputValues, setInputValues] = useState<string[]>([]);
  const [valueEth, setValueEth] = useState<string>("0");
  const [result, setResult] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const isReadOnly = ["view", "pure"].includes(fn.stateMutability);
  const isPayable = fn.stateMutability === "payable";

  async function handleCall() {
    setIsLoading(true);
    try {
      let parsedArgs: unknown[] = [];
      if (fn.inputs) {
        parsedArgs = fn.inputs.map((input, i) => {
          const rawValue = inputValues[i] || "";

          // Handle array types
          if (input.type.endsWith("[]")) {
            const arr = JSON.parse(rawValue);
            if (!Array.isArray(arr)) {
              throw new Error(
                `Argument #${i}: Expected a JSON array string like [1,2,3].`
              );
            }
            if (input.type.includes("uint") || input.type.includes("int")) {
              return arr.map((x: number | string) => BigInt(x));
            }
            return arr;
          }

          // Handle integer types
          if (input.type.includes("uint") || input.type.includes("int")) {
            return BigInt(rawValue);
          }

          // Fallback for strings, addresses, etc.
          return rawValue;
        });
      }

      if (isReadOnly) {
        const response = await agwClient.readContract({
          address: contractAddress,
          abi: CONTRACT_ABI,
          functionName: fn.name,
          args: parsedArgs,
        });
        setResult(response);
        console.log("[READ]", fn.name, "Response:", response);
      } else {
        let valueBigInt: bigint | undefined;
        if (isPayable && valueEth && valueEth !== "0") {
          const floatVal = parseFloat(valueEth);
          if (Number.isNaN(floatVal)) {
            throw new Error(`Invalid ETH value: ${valueEth}`);
          }
          valueBigInt = BigInt(Math.floor(floatVal * 1e18));
        }

        const txHash = await agwClient.writeContract({
          address: contractAddress,
          abi: CONTRACT_ABI,
          functionName: fn.name,
          args: parsedArgs,
          value: valueBigInt,
        });
        setResult(txHash);
        console.log("[WRITE]", fn.name, "TxHash:", txHash);
      }
    } catch (error) {
      console.error("Error:", error);
      setResult(String(error));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="space-y-4">
        <div className="flex items-baseline">
          <h3 className="text-lg font-medium">{fn.name}</h3>
          <span className="ml-2 text-sm text-muted">
            ({isReadOnly ? "Read" : "Write"})
          </span>
        </div>
        <div className="space-y-4">
          {fn.inputs?.map((input, i) => (
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
          ))}
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
            onClick={handleCall}
            disabled={isLoading}
            className={`w-full px-4 py-2 text-white rounded-lg transition-colors ${
              isReadOnly
                ? "bg-primary hover:bg-primary-hover"
                : "bg-success hover:bg-success-hover"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                Processing...
              </span>
            ) : isReadOnly ? (
              "Read"
            ) : (
              "Write"
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
        </div>
      </div>
    </div>
  );
}
