import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Alex Morgan — Developer & designer", description: "A personal portfolio with selected projects, writing, and a little about the person behind the work." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
