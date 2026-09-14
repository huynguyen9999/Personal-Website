import { describe, expect, it } from "vitest";
import { ADMIN_SECURITY_HEADERS, SITE_SECURITY_HEADERS } from "@/lib/security-headers";

describe("security headers", () => {
  it("hardens every response against clickjacking and extra browser APIs", () => {
    const names = SITE_SECURITY_HEADERS.map(([name]) => name);
    expect(names).toEqual([
      "X-Content-Type-Options",
      "Referrer-Policy",
      "X-Frame-Options",
      "Permissions-Policy",
      "Cross-Origin-Opener-Policy",
    ]);
    expect(SITE_SECURITY_HEADERS.find(([name]) => name === "X-Frame-Options")?.[1]).toBe("DENY");
    expect(SITE_SECURITY_HEADERS.find(([name]) => name === "Permissions-Policy")?.[1]).toBe(
      "camera=(), microphone=(), geolocation=(self)",
    );
  });

  it("keeps the admin surface out of caches and search indexes", () => {
    expect(ADMIN_SECURITY_HEADERS).toEqual([
      ["X-Robots-Tag", "noindex, nofollow"],
      ["Cache-Control", "private, no-store, max-age=0"],
    ]);
  });
});
