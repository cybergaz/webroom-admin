import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    serverActions: {
      // Banner uploads can be up to 5 MB; default server-action body cap is 1 MB.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
