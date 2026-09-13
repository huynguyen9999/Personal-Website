import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

describe("crawlers", () => {
  it("keeps /admin out of robots and the sitemap", () => {
    const manifest = robots();
    const rules = Array.isArray(manifest.rules) ? manifest.rules : [manifest.rules];
    const disallowed = rules.flatMap((rule) => {
      const value = rule.disallow;
      return value == null ? [] : Array.isArray(value) ? value : [value];
    });

    expect(disallowed).toContain("/admin");
    expect(disallowed).toContain("/admin/");
    expect(sitemap().some((entry) => entry.url.includes("/admin"))).toBe(false);
  });
});
