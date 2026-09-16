import type { NextConfig } from "next";
const config: NextConfig = { turbopack: { root: process.cwd() }, output: "export", images: { unoptimized: true }, trailingSlash: true };
export default config;
