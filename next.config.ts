import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Privy uses styled-components which needs to be transpiled for Next.js
  transpilePackages: ["@privy-io/react-auth"],
};

export default nextConfig;
