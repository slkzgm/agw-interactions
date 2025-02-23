// Path: src/components/Providers.tsx
"use client";

import { AbstractWalletProvider } from "@abstract-foundation/agw-react";
import { abstract } from "viem/chains";
import { ThemeProvider } from "./ThemeProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AbstractWalletProvider chain={abstract}>
        {children}
      </AbstractWalletProvider>
    </ThemeProvider>
  );
}
