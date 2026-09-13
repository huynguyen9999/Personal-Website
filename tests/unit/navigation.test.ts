import { describe, expect, it } from "vitest";
import { primaryNavLinks } from "@/components/navigation";

describe("primary navigation helpers", () => {
  it("exposes the six-part public archive without a header admin tab", () => {
    expect(primaryNavLinks.map((link) => [link.href, link.label])).toEqual([
      ["/", "Home"],
      ["/about", "Story"],
      ["/#making", "Making"],
      ["/reading", "Notes"],
      ["/#life", "Life"],
      ["/now", "Now"],
    ]);

    const hrefs = primaryNavLinks.flatMap((link) => [link.href, ...link.items.map((item) => item.href)]) as string[];
    expect(hrefs).not.toContain("/admin");
    expect(hrefs).not.toContain("/work");
  });
});
