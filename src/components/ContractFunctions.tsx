// Path: src/components/ContractFunctions.tsx
import React, { useState } from "react";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/lib/constants";
import { Function } from "./Function";
import type { AbstractClient } from "@abstract-foundation/agw-client";
import type { AbiFunction, ContractFunctionItem } from "@/lib/constants";

interface ContractFunctionsProps {
  agwClient: AbstractClient;
}

export function ContractFunctions({ agwClient }: ContractFunctionsProps) {
  const [selectedTab, setSelectedTab] = useState<"read" | "write">("read");

  // Filter read-only functions
  const readFunctions = CONTRACT_ABI.filter(
    (item: ContractFunctionItem) =>
      item.type === "function" &&
      (item.stateMutability === "view" || item.stateMutability === "pure")
  ) as AbiFunction[];

  // Filter write functions
  const writeFunctions = CONTRACT_ABI.filter(
    (item: ContractFunctionItem) =>
      item.type === "function" &&
      item.stateMutability !== "view" &&
      item.stateMutability !== "pure"
  ) as AbiFunction[];

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Contract Functions</h2>
        <div className="border-b border-border">
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedTab("read")}
              className={`px-4 py-2 -mb-px text-sm font-medium transition-colors ${
                selectedTab === "read"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Read Functions
            </button>
            <button
              onClick={() => setSelectedTab("write")}
              className={`px-4 py-2 -mb-px text-sm font-medium transition-colors ${
                selectedTab === "write"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Write Functions
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[600px] pr-2 space-y-4">
          {(selectedTab === "read" ? readFunctions : writeFunctions).map(
            (fn, idx) => (
              <Function
                key={idx}
                fn={fn}
                contractAddress={CONTRACT_ADDRESS}
                agwClient={agwClient}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}
