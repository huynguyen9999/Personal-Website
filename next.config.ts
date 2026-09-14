import type { NextConfig } from "next";
import { ADMIN_SECURITY_HEADERS, SITE_SECURITY_HEADERS } from "./lib/security-headers";

const supabaseHostname = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
      : "vqvrwnicifqcmevssgdi.supabase.co";
  } catch {
    return "vqvrwnicifqcmevssgdi.supabase.co";
  }
})();

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  poweredByHeader: false,
  transpilePackages: ["maplibre-gl"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SITE_SECURITY_HEADERS.map(([key, value]) => ({ key, value })),
      },
      {
        source: "/admin",
        headers: ADMIN_SECURITY_HEADERS.map(([key, value]) => ({ key, value })),
      },
      {
        source: "/admin/:path*",
        headers: ADMIN_SECURITY_HEADERS.map(([key, value]) => ({ key, value })),
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHostname,
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "covers.openlibrary.org",
        pathname: "/b/**",
      },
      {
        protocol: "https",
        hostname: "books.google.com",
        pathname: "/books/content",
      },
    ],
  },
};

export default nextConfig;
