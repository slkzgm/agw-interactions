// Path: src/components/Footer.tsx
"use client";
import React, { useState } from "react";
import Link from "next/link";

export function Footer() {
  const [copied, setCopied] = useState(false);
  const supportWallet = "0x78283D6c30a7DcD380A3E5BDb907ad3342c275C5";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(supportWallet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="border-t border-border bg-background py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-muted text-sm">
            © {new Date().getFullYear()} AGW Interactions by{" "}
            <Link
              href="https://github.com/slkzgm"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              SLK
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-sm text-muted relative">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-2 py-1 bg-card border border-border rounded-lg hover:bg-background transition-colors"
              >
                <span>Support:</span>
                <code className="px-2 py-1 bg-background border border-border rounded-lg text-xs md:text-sm font-mono">
                  {supportWallet.slice(0, 6)}...{supportWallet.slice(-4)}
                </code>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
              {copied && (
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-foreground text-background text-xs py-1 px-2 rounded whitespace-nowrap">
                  Copied!
                </span>
              )}
            </div>

            <div className="flex gap-4">
              <Link
                href="https://x.com/0xslk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-primary transition-colors"
                aria-label="X (formerly Twitter)"
              >
                {/* Updated X logo (formerly Twitter) */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </Link>
              <Link
                href="https://github.com/slkzgm"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-primary transition-colors"
                aria-label="GitHub"
              >
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
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
