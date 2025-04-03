// Path: src/app/gachav6/layout.tsx
import { ReactNode } from "react";

export const metadata = {
  title: "GachaV6 Batch Claim | AGW Interactions",
  description:
    "Batch claim rewards from GachaV6 pools with a single transaction",
};

export default function GachaV6Layout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <h1 className="text-xl font-semibold">GachaV6 Batch Claim</h1>
        <p className="text-muted">
          Easily claim multiple GachaV6 tickets across different pools in a
          single transaction. This specialized interface batches your claim
          requests for maximum efficiency and lower overall gas costs.
        </p>
      </div>
      {children}
    </div>
  );
}
