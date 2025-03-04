// Path: src/app/endgame/page.tsx
"use client";

/**
 * Description: A dedicated page for interacting with the Endgame contract
 */

import React from "react";
import { useAccount } from "wagmi";
import {
  useLoginWithAbstract,
  useAbstractClient,
} from "@abstract-foundation/agw-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AbstractClient } from "@abstract-foundation/agw-client";
import { EndgameFunctions } from "@/components/EndgameFunctions";

export default function EndgamePage() {
  const { login, logout } = useLoginWithAbstract();
  const { address, status } = useAccount();
  const { data: agwClient, isLoading } = useAbstractClient();

  if (!agwClient && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-4 space-y-6 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold">Endgame Contract Interface</h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {status === "connected" ? (
              <div className="flex items-center gap-4">
                <code className="px-3 py-1 bg-card border border-border rounded-lg text-sm font-mono">
                  {address}
                </code>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger-hover transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={login}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
              >
                Connect with Abstract
              </button>
            )}
          </div>
        </div>
        {status === "connected" && (
          <EndgameFunctions agwClient={agwClient as AbstractClient} />
        )}
      </div>
    </div>
  );
}
