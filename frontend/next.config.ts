import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: ["10.228.43.230"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mermaid.ink",
      },
    ],
  },
};  

export default nextConfig;
