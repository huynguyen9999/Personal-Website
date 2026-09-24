import { describe, expect, it } from "vitest";
import { isExternalHref, opensInNewTab, primaryNavLinks } from "@/lib/navigation";

describe("primary navigation helpers", () => {
  it("exposes the public archive with a direct contact route and without owner access", () => {
    expect(primaryNavLinks.map((link) => [link.href, link.label])).toEqual([
      ["/", "Home"],
      ["/about", "My Story"],
      ["/what-i-do", "What I do"],
      ["/who-i-am", "Who I am"],
      ["/contact", "Contact"],
    ]);

    const hrefs = primaryNavLinks.flatMap((link) => [link.href, ...link.items.map((item) => item.href)]) as string[];
    expect(hrefs).not.toContain("/admin");
    expect(hrefs).not.toContain("/work");
    expect(hrefs).not.toContain("/now");
    expect(hrefs).not.toContain("/#now");
    expect(hrefs).not.toContain("/#making");
    expect(hrefs).not.toContain("/#life");
    expect(primaryNavLinks.find((link) => link.href === "/")?.items).toEqual([]);
    expect(hrefs).not.toContain("/#opening-title");
    expect(hrefs).toContain("/about#trajectory");
    expect(hrefs).toContain("/files/Huy-B-Nguyen-Resume.pdf");
    expect(hrefs).toContain("https://github.com/huynguyen9999");
    expect(hrefs).not.toContain("/what-i-do#resume");
    expect(hrefs).toContain("/who-i-am#hobbies");
    expect(hrefs).toContain("/who-i-am#shelf");
    expect(hrefs).not.toContain("/who-i-am?hobby=adventures#hobbies");
    expect(hrefs).not.toContain("/who-i-am?hobby=machines#hobbies");
    expect(hrefs).not.toContain("/who-i-am?hobby=tennis#hobbies");
    expect(hrefs).not.toContain("/who-i-am#drive");
    expect(hrefs).not.toContain("/who-i-am#setup");
    expect(isExternalHref("https://github.com/huynguyen9999")).toBe(true);
    expect(isExternalHref("/what-i-do")).toBe(false);
    expect(opensInNewTab("/files/Huy-B-Nguyen-Resume.pdf")).toBe(true);
    expect(opensInNewTab("/what-i-do")).toBe(false);
  });
});
