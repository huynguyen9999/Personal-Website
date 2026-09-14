import { describe, expect, it } from "vitest";
import { isExternalHref, primaryNavLinks } from "@/lib/navigation";

describe("primary navigation helpers", () => {
  it("exposes the compact four-part public archive without owner access", () => {
    expect(primaryNavLinks.map((link) => [link.href, link.label])).toEqual([
      ["/", "Home"],
      ["/about", "My Story"],
      ["/what-i-do", "What I do"],
      ["/who-i-am", "Who I am"],
    ]);

    const hrefs = primaryNavLinks.flatMap((link) => [link.href, ...link.items.map((item) => item.href)]) as string[];
    expect(hrefs).not.toContain("/admin");
    expect(hrefs).not.toContain("/work");
    expect(hrefs).not.toContain("/now");
    expect(hrefs).not.toContain("/#now");
    expect(hrefs).not.toContain("/#making");
    expect(hrefs).not.toContain("/#life");
    expect(hrefs).toContain("/#opening-title");
    expect(hrefs).toContain("/#identity-map");
    expect(hrefs).toContain("/#present-title");
    expect(hrefs).toContain("/about#trajectory");
    expect(hrefs).toContain("/what-i-do#resume");
    expect(hrefs).toContain("https://github.com/huynguyen9999");
    expect(hrefs).toContain("/who-i-am#shelf");
    expect(hrefs).toContain("/who-i-am#drive");
    expect(hrefs).toContain("/who-i-am#setup");
    expect(isExternalHref("https://github.com/huynguyen9999")).toBe(true);
    expect(isExternalHref("/what-i-do")).toBe(false);
  });
});
