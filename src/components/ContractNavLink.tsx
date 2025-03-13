// Path: src/components/ContractNavLink.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function ContractNavLink() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <Link
      href="/contract-explorer"
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ml-2 ${
        isActive("/contract-explorer")
          ? "bg-primary text-white"
          : "text-foreground hover:bg-card"
      }`}
    >
      Explorer
    </Link>
  );
}
