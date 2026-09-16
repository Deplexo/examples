import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Forma — Make room for your best work", description: "An independent workspace for thoughtful teams. Explore the Forma website starter and make it your own." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
