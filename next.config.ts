import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Next's client-side Router Cache stores visited pages in memory, but
    // dynamic routes default to a 0s freshness window — every click refetches
    // from the server even when nothing changed. These pages don't change
    // that often, so let revisits within the window reuse the cached copy.
    staleTimes: {
      dynamic: 60,
      static: 300,
    },
  },
};

export default nextConfig;
