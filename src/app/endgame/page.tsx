// Path: src/app/endgame/page.tsx
"use client";

import React from "react";
import { useAccount } from "wagmi";
import { useAbstractClient } from "@abstract-foundation/agw-react";
import { AbstractClient } from "@abstract-foundation/agw-client";
import { EndgameFunctions } from "@/components/EndgameFunctions";

export default function EndgamePage() {
  const { status } = useAccount();
  const { data: agwClient, isLoading } = useAbstractClient();

  if (!agwClient && isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Endgame Contract Interface</h1>
        <p className="text-muted mt-2">
          Interact with the Endgame contract functions
        </p>
      </div>

      <div className="space-y-6">
        {status === "connected" && agwClient ? (
          <EndgameFunctions agwClient={agwClient as AbstractClient} />
        ) : (
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-center text-muted">
              Please connect your wallet to interact with the contract functions
            </p>
          </div>
        )}
      </div>
    </>
  );
}
