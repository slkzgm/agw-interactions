// Path: src/app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";
import { Providers } from "@/components/Providers";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: {
    default: "Contract Explorer | AGW Interactions",
    template: "%s | AGW Interactions",
  },
  description: "Interact with any blockchain contract using AGW",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground flex flex-col">
        <Providers>
          <NavBar />
          <main className="flex-grow container mx-auto px-4 py-6">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
