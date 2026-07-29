import type { NextConfig } from "next";

/**
 * Hosts allowed for next/image. Firebase download URLs always include
 * ?alt=media&token=… so `search` must allow query strings.
 */
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/**",
        search: "**",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/**",
        search: "**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.threeatoms.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
