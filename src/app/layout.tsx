// frontend/app/layout.tsx
/**
 * full-path: frontend/app/layout.tsx
 * Description: Root layout for Next.js (App Router)
 */
import "./globals.css";
import { ReactNode } from "react";
import Providers from '@/components/Providers';

export const metadata = {
    title: "My Minimal Next App",
    description: "Test setup with Next.js, Tailwind, TypeScript, etc.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
        <Providers>
            <body className="bg-gray-50 text-slate-900">{children}</body>
        </Providers>
        </html>
    );
}
