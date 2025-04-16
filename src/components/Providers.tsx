// Path: src/components/Providers.tsx
"use client";

import { AbstractWalletProvider } from "@abstract-foundation/agw-react";
import { abstractTestnet } from "viem/chains";
import { ThemeProvider } from "./ThemeProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AbstractWalletProvider chain={abstractTestnet}>
        {children}
      </AbstractWalletProvider>
    </ThemeProvider>
  );
}
