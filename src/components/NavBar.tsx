// Path: src/components/NavBar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { ThemeToggle } from "./ThemeToggle";
import { useAccount } from "wagmi";
import { useLoginWithAbstract } from "@abstract-foundation/agw-react";

export function NavBar() {
  const pathname = usePathname();
  const { login, logout } = useLoginWithAbstract();
  const { address, status } = useAccount();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <header className="sticky top-0 z-10 bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between py-4">
          {/* Logo and Navigation */}
          <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 mb-4 md:mb-0 w-full md:w-auto">
            <h1 className="text-xl font-bold mr-8">AGW Interactions</h1>
            <nav className="flex flex-wrap">
              <Link
                href="/"
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive("/contract-explorer") || isActive("/")
                    ? "bg-primary text-white"
                    : "text-foreground hover:bg-card"
                }`}
              >
                Explorer
              </Link>

              <span className="mx-2 text-sm text-muted self-center">|</span>
              <span className="text-sm text-muted self-center mr-2">OCH:</span>

              <Link
                href="/leveling"
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive("/leveling")
                    ? "bg-primary text-white"
                    : "text-foreground hover:bg-card"
                }`}
              >
                Leveling
              </Link>
              <Link
                href="/endgame"
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ml-2 ${
                  isActive("/endgame")
                    ? "bg-primary text-white"
                    : "text-foreground hover:bg-card"
                }`}
              >
                Endgame
              </Link>
              <Link
                href="/heroes"
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ml-2 ${
                  isActive("/heroes")
                    ? "bg-primary text-white"
                    : "text-foreground hover:bg-card"
                }`}
              >
                Heroes
              </Link>
              <Link
                href="/gachas"
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ml-2 ${
                  isActive("/gachas")
                    ? "bg-primary text-white"
                    : "text-foreground hover:bg-card"
                }`}
              >
                Gachas
              </Link>
              <Link
                href="/magiceden"
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ml-2 ${
                  isActive("/magiceden")
                    ? "bg-primary text-white"
                    : "text-foreground hover:bg-card"
                }`}
              >
                Magic Eden
              </Link>
            </nav>
          </div>

          {/* Actions: Theme Toggle and Connect Button */}
          <div className="flex items-center space-x-4 w-full md:w-auto justify-center md:justify-end">
            <ThemeToggle />
            {status === "connected" ? (
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <code className="px-2 py-1 bg-card border border-border rounded-lg text-xs md:text-sm font-mono truncate max-w-32 md:max-w-full">
                  {address}
                </code>
                <button
                  onClick={logout}
                  className="px-3 py-1 bg-danger text-white rounded-lg hover:bg-danger-hover transition-colors text-sm"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={login}
                className="px-3 py-1 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm"
              >
                Connect
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
