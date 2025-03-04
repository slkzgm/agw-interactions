// Path: src/components/EndgameFunctions.tsx
"use client";

/**
 * Description: Renders the Endgame contract functions in a read/write interface.
 */

import React, { useState } from "react";
import type { AbstractClient } from "@abstract-foundation/agw-client";
import {
  ENDGAME_ABI,
  ENDGAME_CONTRACT_ADDRESS,
  EndgameAbiFunction,
  EndgameFunctionItem,
} from "@/lib/endgameConstants";
import { Function } from "./Function";

interface EndgameFunctionsProps {
  agwClient: AbstractClient;
}

export function EndgameFunctions({ agwClient }: EndgameFunctionsProps) {
  const [selectedTab, setSelectedTab] = useState<"read" | "write">("read");

  // Filter read-only functions
  const readFunctions = ENDGAME_ABI.filter(
    (item: EndgameFunctionItem) =>
      item.type === "function" &&
      item.stateMutability &&
      (item.stateMutability === "view" || item.stateMutability === "pure")
  ) as EndgameAbiFunction[];

  // Filter write functions
  const writeFunctions = ENDGAME_ABI.filter(
    (item: EndgameFunctionItem) =>
      item.type === "function" &&
      item.stateMutability &&
      item.stateMutability !== "view" &&
      item.stateMutability !== "pure"
  ) as EndgameAbiFunction[];

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Endgame Contract Functions</h2>
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
                fn={{
                  // The shared "Function" component expects an AbiFunction shape
                  type: "function",
                  name: fn.name,
                  stateMutability: fn.stateMutability,
                  inputs: fn.inputs,
                  outputs: fn.outputs,
                }}
                contractAddress={ENDGAME_CONTRACT_ADDRESS}
                agwClient={agwClient}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}
