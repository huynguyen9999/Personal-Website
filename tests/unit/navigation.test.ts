import { describe, expect, it } from "vitest";
import { primaryNavLinks } from "@/components/navigation";

describe("primary navigation helpers", () => {
  it("exposes the compact four-part public archive without owner access", () => {
    expect(primaryNavLinks.map((link) => [link.href, link.label])).toEqual([
      ["/", "Home"],
      ["/about", "My Story"],
      ["/#making", "My Projects"],
      ["/#life", "Life"],
    ]);

    const hrefs = primaryNavLinks.flatMap((link) => [link.href, ...link.items.map((item) => item.href)]) as string[];
    expect(hrefs).not.toContain("/admin");
    expect(hrefs).not.toContain("/work");
    expect(hrefs).not.toContain("/now");
    expect(hrefs).toContain("/reading?shelf=currently-reading");
    expect(hrefs).toContain("/reading?shelf=read");
    expect(hrefs).toContain("/reading?shelf=reading-next");
  });
});
