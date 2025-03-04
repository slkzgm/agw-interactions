// Path: src/components/NavBar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export function NavBar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="mb-6 border-b border-border pb-2">
      <nav className="flex flex-wrap">
        <Link
          href="/"
          className={`px-4 py-2 text-sm font-medium transition-colors mr-2 rounded-t-lg ${
            isActive("/")
              ? "bg-card text-primary border-l border-r border-t border-border"
              : "text-muted hover:text-foreground"
          }`}
        >
          LevelingGame
        </Link>
        <Link
          href="/endgame"
          className={`px-4 py-2 text-sm font-medium transition-colors rounded-t-lg ${
            isActive("/endgame")
              ? "bg-card text-primary border-l border-r border-t border-border"
              : "text-muted hover:text-foreground"
          }`}
        >
          Endgame
        </Link>
      </nav>
    </div>
  );
}
