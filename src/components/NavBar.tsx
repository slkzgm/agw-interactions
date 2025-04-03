// Path: src/components/NavBar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { useAccount } from "wagmi";
import { useLoginWithAbstract } from "@abstract-foundation/agw-react";

export function NavBar() {
  const pathname = usePathname();
  const { login, logout } = useLoginWithAbstract();
  const { address, status } = useAccount();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const supportWallet = "0x78283D6c30a7DcD380A3E5BDb907ad3342c275C5";

  const isActive = (path: string) => {
    return pathname === path;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(supportWallet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-10 bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between py-4">
          {/* Logo and Navigation */}
          <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 mb-4 md:mb-0 w-full md:w-auto">
            <div className="flex items-center mr-8">
              <h1 className="text-xl font-bold text-foreground">
                AGW Interactions
              </h1>
              <span className="ml-2 text-sm text-muted px-2 border-l border-border">
                by{" "}
                <a
                  href="https://github.com/slkzgm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  SLK
                </a>
              </span>
            </div>

            <nav className="flex flex-wrap items-center gap-2">
              {/* Main Explorer Link */}
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

              {/* Section Divider */}
              <span className="text-sm text-muted self-center">|</span>

              {/* OCH Section with improved dropdown menu */}
              <div className="relative och-dropdown">
                <span
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors
                  ${
                    isActive("/leveling") ||
                    isActive("/endgame") ||
                    isActive("/heroes") ||
                    isActive("/gachas")
                      ? "bg-primary text-white"
                      : "text-foreground hover:bg-card"
                  }`}
                >
                  OCH
                  <svg
                    className="w-3 h-3 ml-1 opacity-70"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>

                <div className="och-dropdown-menu">
                  <div className="py-1">
                    <Link
                      href="/leveling"
                      className={`block px-4 py-2 text-sm transition-colors ${
                        isActive("/leveling")
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-foreground hover:bg-card"
                      }`}
                    >
                      Leveling
                    </Link>
                    <Link
                      href="/endgame"
                      className={`block px-4 py-2 text-sm transition-colors ${
                        isActive("/endgame")
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-foreground hover:bg-card"
                      }`}
                    >
                      Endgame
                    </Link>
                    <Link
                      href="/heroes"
                      className={`block px-4 py-2 text-sm transition-colors ${
                        isActive("/heroes")
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-foreground hover:bg-card"
                      }`}
                    >
                      Heroes
                    </Link>
                    <Link
                      href="/gachas"
                      className={`block px-4 py-2 text-sm transition-colors ${
                        isActive("/gachas")
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-foreground hover:bg-card"
                      }`}
                    >
                      Gachas
                    </Link>
                  </div>
                </div>
              </div>

              {/* Other Links - Consistent styling */}
              <Link
                href="/gacha-game"
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive("/gacha-game")
                    ? "bg-primary text-white"
                    : "text-foreground hover:bg-card"
                }`}
              >
                Gacha Game
              </Link>
              <Link
                href="/magiceden"
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
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

      {/* Mobile menu toggle button */}
      <div className="md:hidden px-4 pb-4 flex justify-end">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-card border border-border"
        >
          <span className="sr-only">Open menu</span>
          {mobileMenuOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18"></path>
              <path d="M6 6l12 12"></path>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12h18"></path>
              <path d="M3 6h18"></path>
              <path d="M3 18h18"></path>
            </svg>
          )}
        </button>
      </div>

      {/* Mobile navigation menu */}
      <div
        className={`md:hidden ${mobileMenuOpen ? "block" : "hidden"} pb-4 px-4`}
      >
        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
          {/* Main Explorer Section */}
          <Link
            href="/"
            className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              isActive("/contract-explorer") || isActive("/")
                ? "bg-primary text-white"
                : "text-foreground hover:bg-background"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Explorer
          </Link>

          {/* OCH Contracts Section */}
          <div className="border-t border-border pt-2 mt-2">
            <div className="px-4 py-1 mb-1 bg-card rounded-lg flex items-center">
              <span className="text-sm font-medium">OCH Contracts</span>
            </div>

            <div className="ml-2 space-y-2">
              <Link
                href="/leveling"
                className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive("/leveling")
                    ? "bg-primary text-white"
                    : "text-foreground hover:bg-background"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Leveling
              </Link>

              <Link
                href="/endgame"
                className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive("/endgame")
                    ? "bg-primary text-white"
                    : "text-foreground hover:bg-background"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Endgame
              </Link>

              <Link
                href="/heroes"
                className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive("/heroes")
                    ? "bg-primary text-white"
                    : "text-foreground hover:bg-background"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Heroes
              </Link>

              <Link
                href="/gachas"
                className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive("/gachas")
                    ? "bg-primary text-white"
                    : "text-foreground hover:bg-background"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Gachas
              </Link>
            </div>
          </div>

          {/* Other Sections - without the header for cleaner look */}
          <div className="border-t border-border pt-2 mt-2">
            <Link
              href="/gacha-game"
              className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive("/gacha-game")
                  ? "bg-primary text-white"
                  : "text-foreground hover:bg-background"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Gacha Game
            </Link>

            <Link
              href="/magiceden"
              className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive("/magiceden")
                  ? "bg-primary text-white"
                  : "text-foreground hover:bg-background"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Magic Eden
            </Link>
          </div>

          <div className="border-t border-border pt-3 mt-2">
            <div className="relative">
              <button
                onClick={copyToClipboard}
                className="w-full flex items-center justify-center text-sm bg-background border border-border px-3 py-2 rounded-lg hover:bg-card transition-colors gap-2"
              >
                <span>Support: </span>
                <span className="font-mono text-xs">
                  {supportWallet.slice(0, 6)}...{supportWallet.slice(-4)}
                </span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
              {copied && (
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-foreground text-background text-xs py-1 px-2 rounded">
                  Copied!
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
