// Path: src/app/(och-contracts)/layout.tsx
import { ReactNode } from "react";

export const metadata = {
  title: "OCH Contracts | Web3 Interactions",
  description:
    "Interact with OCH LevelingGame, Endgame, Heroes, and Gachas contracts",
};

export default function OCHContractsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <h1 className="text-xl font-semibold">OCH Contracts Suite</h1>
        <p className="text-muted">
          Specialized interface for interacting with the OCH ecosystem
          contracts. These pages provide tailored functionality for specific use
          cases.
        </p>
      </div>
      {children}
    </div>
  );
}
