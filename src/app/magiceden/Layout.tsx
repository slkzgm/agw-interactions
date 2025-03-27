// Path: src/app/(och-contracts)/layout.tsx
import { ReactNode } from "react";

export const metadata = {
  title: "Magic Eden | AGW Interactions",
  description: "Mass cancel listings from Magic Eden using your AGW",
};

export default function OCHContractsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <h1 className="text-xl font-semibold">Magic Eden Listings</h1>
        <p className="text-muted">
          Specialized interface for mass delist Magic Eden orders.
        </p>
      </div>
      {children}
    </div>
  );
}
