import { describe, expect, it } from "vitest";
import { primaryNavLinks } from "@/components/navigation";

describe("primary navigation helpers", () => {
  it("exposes the public archive and never Work, Life, or a header admin tab", () => {
    expect(primaryNavLinks.map((link) => [link.href, link.label])).toEqual([
      ["/", "Home"],
      ["/about", "Story"],
      ["/reading", "Reading"],
      ["/now", "Now"],
    ]);

    const hrefs = primaryNavLinks.flatMap((link) => [link.href, ...link.items.map((item) => item.href)]) as string[];
    expect(hrefs).not.toContain("/admin");
    expect(hrefs.some((href) => href === "/work" || href === "/life" || href.startsWith("/work") || href.startsWith("/life"))).toBe(false);
  });
});
