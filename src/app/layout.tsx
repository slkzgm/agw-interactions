// Path: frontend/app/layout.tsx
/**
 * Description: Root layout for Next.js (App Router)
 */
import "./globals.css";
import { ReactNode } from "react";
import { Providers } from "@/components/Providers";
import { NavBar } from "@/components/NavBar";

export const metadata = {
  title: "OCH LevelingGame Interactions",
  description: "Interact with OCH LevelingGame contracts using AGW",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <Providers>
          <NavBar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
