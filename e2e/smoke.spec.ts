import { expect, test } from "@playwright/test";

test.describe("public archive smoke", () => {
  test("home keeps the original archive and adds the identity map", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "huy nguyen." })).toBeVisible();
    await expect(page.getByAltText("Huy Nguyen standing on a beach at dusk.")).toBeVisible();
    await expect(page.getByText("CURRENT FOCUS")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Electrical engineering at UC Santa Barbara." })).toBeVisible();
    await expect(page.getByRole("link", { name: /What I do/ }).first()).toHaveAttribute("href", "/what-i-do");
    await expect(page.getByRole("heading", { level: 1, name: /A life in progress/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: /A short signal from the present/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Building\. Personal website admin\/editor/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Reading\. .*Steve Jobs/ })).toBeVisible();
    await expect(page.locator(".present-dispatch")).toContainText(/Q3 2026/);
    await expect(page.locator(".present-clock")).toContainText(/PDT|PST/);
    await expect(page.getByText("ORIGIN / ADAPTATION")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Cars & bikes" })).toBeVisible();
    await expect(page.getByText("Huy Nguyen · Ho Chi Minh City → California")).toBeVisible();
    await expect(page.locator("header.site-header")).toHaveAttribute("data-collapsed", "false");
    await expect(page.getByRole("heading", { name: "Quick answers" })).toBeVisible();
    const vietnamFaq = page.getByRole("button", { name: /What do you miss most in Vietnam/i });
    await expect(vietnamFaq).toBeVisible();
    await vietnamFaq.click();
    await expect(vietnamFaq).toHaveAttribute("aria-expanded", "true");
  });

  test("compact nav reaches Story, What I do, Who I am, and Contact", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("a.nav-item[href='/admin']")).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: /^admin$/i })).toHaveCount(0);

    await page.locator("a.nav-item[href='/about']").click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.getByText("STORY / TWO COORDINATES")).toBeVisible();

    await page.locator("a.nav-item[href='/who-i-am']").hover();
    await expect(page.locator("a.nav-item[href='/who-i-am'] .nav-corner")).toHaveCount(4);
    const whoMenu = page.locator(".nav-cell:has(a.nav-item[href='/who-i-am']) .nav-dropdown");
    await expect(whoMenu.getByRole("link")).toHaveCount(2);
    await expect(whoMenu.locator("a[href='/who-i-am#hobbies']")).toBeVisible();
    await whoMenu.locator("a[href='/who-i-am#shelf']").click();
    await expect(page).toHaveURL(/\/who-i-am/);
    await expect(page.getByRole("heading", { name: "Book shelf." })).toBeVisible();
    await expect(page.getByRole("heading", { name: "The Richest Man in Babylon" })).toBeVisible();

    await page.getByRole("navigation", { name: "Footer" }).getByRole("link", { name: "Contact" }).click();
    await expect(page).toHaveURL(/\/contact$/);
    await expect(page.getByRole("link", { name: "dominichuyn@gmail.com" })).toHaveAttribute(
      "href",
      "mailto:dominichuyn@gmail.com",
    );
    await expect(page.getByRole("navigation", { name: "Footer" }).getByRole("link", { name: /GitHub/ })).toBeVisible();
  });

  test("What I do and Who I am land as their own pages", async ({ page }) => {
    await page.goto("/");
    await page.locator("a.nav-item[href='/what-i-do']").click();
    await expect(page).toHaveURL(/\/what-i-do$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Three practices");
    await page.getByRole("heading", { name: "Engineer" }).scrollIntoViewIfNeeded();
    await expect(page.getByRole("heading", { name: "Engineer" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Creator" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Student" })).toBeVisible();
    const github = page.locator("#resume a.practice-action[href='https://github.com/huynguyen9999']");
    const resume = page.locator("#resume a.practice-action[href='/files/Huy-B-Nguyen-Resume.pdf']");
    await expect(github).toHaveAttribute("target", "_blank");
    await expect(resume).toHaveAttribute("target", "_blank");
    await expect(page.getByText("Resume PDF not published yet.")).toHaveCount(0);

    await page.locator("a.nav-item[href='/who-i-am']").click();
    await expect(page).toHaveURL(/\/who-i-am$/);
    await expect(page.getByRole("heading", { level: 1, name: "Huy Nguyen." })).toBeVisible();
    await expect(page.getByRole("button", { name: /pronunciation of Huy Nguyen/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /You are .* miles away from Huy Nguyen/ })).toBeVisible();
    await expect(page.getByText(/Two coordinates, one route/)).toHaveCount(0);
    await expect(page.getByText(/Network location is an ISP estimate/)).toHaveCount(0);
    await expect(page.locator(".origin-map")).toBeVisible();
    await expect(page.getByRole("button", { name: /See the region|See the world/ })).toBeVisible();
    await expect(page.getByLabel("Set your location instead")).toBeVisible();
    await expect(page.getByRole("button", { name: /Use this device|Refresh device location/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Life beyond the screens." })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Cubes" })).toBeVisible();
    await page.getByRole("tab", { name: "Cubes" }).click();
    await expect(page.getByText("Holiday scramble.")).toBeVisible();
    await expect(page.getByRole("tab", { name: "Machines" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Work setup" })).toBeVisible();
  });

  test("reading shelves preserve curated links and switch without live metadata", async ({ page }) => {
    await page.goto("/reading");
    await expect(page.getByRole("link", { name: /View on Goodreads/ }).first()).toHaveAttribute(
      "href",
      "https://www.goodreads.com/book/show/43097201",
    );
    await page.locator(".shelf-tabs a[href='/reading?shelf=read']").click();
    await expect(page).toHaveURL(/shelf=read/);
    await expect(page.getByRole("heading", { name: "Atomic Habits" })).toBeVisible();
    await page.locator(".shelf-tabs a[href='/reading?shelf=reading-next']").click();
    await expect(page.getByRole("heading", { name: "The Lean Startup" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Good to Great" })).toBeVisible();
  });

  test("theme toggle updates the document theme", async ({ page }) => {
    await page.goto("/");
    await expect(async () => {
      await page.getByRole("button", { name: "dark" }).click();
      await expect(page.locator("html")).toHaveAttribute("data-theme-preference", "dark", { timeout: 1000 });
    }).toPass();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await page.getByRole("button", { name: "light" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(page.locator("html")).toHaveCSS("--selection", "#ff2800");
  });

  test("home has no horizontal overflow and the opening responds to scroll", async ({ page }) => {
    for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(viewport);
      await page.goto("/");
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

      const opening = page.locator(".home-portrait-opening");
      await page.evaluate(() => window.scrollTo(0, Math.round(window.innerHeight * 0.7)));
      await expect.poll(() => opening.evaluate((node) => Number(node.style.getPropertyValue("--portrait-progress")))).toBeGreaterThan(0);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
  });

  test("the life-in-progress photo uses the desktop side column and mobile reading flow", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const photo = page.locator(".opening-media img");
    const desktopBox = await photo.boundingBox();
    expect(desktopBox).not.toBeNull();
    expect(desktopBox!.x).toBeGreaterThan(720);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const mobileBox = await photo.boundingBox();
    const openingMeta = await page.locator(".opening-meta").boundingBox();
    expect(mobileBox).not.toBeNull();
    expect(openingMeta).not.toBeNull();
    expect(mobileBox!.y).toBeGreaterThan(openingMeta!.y + openingMeta!.height);
    expect(mobileBox!.width).toBeLessThanOrEqual(390);
  });

  test("header collapses on scroll down and returns on scroll up", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("header.site-header");
    await expect(header).toHaveAttribute("data-collapsed", "false");

    await expect(async () => {
      await page.evaluate(() => {
        document.documentElement.style.scrollBehavior = "auto";
        document.body.style.minHeight = "4000px";
        window.scrollTo(0, 400);
      });
      expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(56);
      await expect(header).toHaveAttribute("data-collapsed", "true", { timeout: 1000 });
    }).toPass();

    await page.evaluate(() => {
      window.scrollTo(0, 40);
    });
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(56);
    await expect(header).toHaveAttribute("data-collapsed", "false");
  });

  test("admin stays off the header and remains available from the footer", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("a.nav-item[href='/admin']")).toHaveCount(0);
    await page.locator("footer.site-footer").getByRole("link", { name: "admin" }).click();
    await expect(page).toHaveURL(/\/admin$/);

    const setup = page.getByText("SETUP REQUIRED");
    const login = page.getByRole("heading", { name: "Sign in" });
    await expect(setup.or(login)).toBeVisible();
    await expect(page.getByText("OWNER ACCESS")).toHaveCount(0);
    await expect(page.getByText(/sign in to edit/i)).toHaveCount(0);
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("hides the cursor trail", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect
      .poll(async () => page.locator("canvas.cursor-trail").evaluate((node) => (node as HTMLCanvasElement).width))
      .toBe(0);
    await expect
      .poll(async () => page.locator("canvas.cursor-trail").evaluate((node) => (node as HTMLCanvasElement).height))
      .toBe(0);
  });

  test("keeps book covers static", async ({ page }) => {
    await page.goto("/reading");
    await expect(page.locator(".book-prism")).toHaveCount(0);
    await expect(page.locator(".book-cover img").first()).toBeVisible();
  });
});
