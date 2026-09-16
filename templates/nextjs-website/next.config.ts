import type { NextConfig } from "next";
const config: NextConfig = { turbopack: { root: process.cwd() }, output: "standalone", images: { unoptimized: true }, poweredByHeader: false };
export default config;
