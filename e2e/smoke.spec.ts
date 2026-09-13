import { expect, test } from "@playwright/test";

test.describe("public archive smoke", () => {
  test("home loads the opening sequence", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("A life in progress");
    await expect(page.getByText("HO CHI MINH CITY → CALIFORNIA")).toBeVisible();
    await expect(page.locator("header.site-header")).toHaveAttribute("data-collapsed", "false");
  });

  test("compact nav reaches Story, the reading shelf, and Contact", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("a.nav-item[href='/admin']")).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: /^admin$/i })).toHaveCount(0);

    await page.locator("a.nav-item[href='/about']").click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.getByText("STORY / TWO COORDINATES")).toBeVisible();

    await page.locator("a.nav-item[href='/#life']").hover();
    await page.locator(".nav-dropdown a[href='/reading?shelf=currently-reading']").click();
    await expect(page).toHaveURL(/\/reading$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("My Shelf");
    await expect(page.getByRole("heading", { name: "The Richest Man in Babylon" })).toBeVisible();

    await page.getByRole("navigation", { name: "Footer" }).getByRole("link", { name: "Contact" }).click();
    await expect(page).toHaveURL(/\/contact$/);
    await expect(page.getByRole("link", { name: "dominichuyn@gmail.com" })).toHaveAttribute(
      "href",
      "mailto:dominichuyn@gmail.com",
    );
    await expect(page.getByRole("navigation", { name: "Footer" }).getByRole("link", { name: /GitHub/ })).toBeVisible();
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

  test("admin stays off the public chrome and remains available by direct route", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("footer.site-footer").getByRole("link", { name: "admin" })).toHaveCount(0);
    await page.goto("/admin");
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
