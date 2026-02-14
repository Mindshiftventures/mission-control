import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/mission",
  assetPrefix: "/mission",
  env: {
    KV_REST_API_URL: process.env.KV_REST_API_URL,
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
    DATABASE_URL: process.env.DATABASE_URL,
  },
};

export default nextConfig;
