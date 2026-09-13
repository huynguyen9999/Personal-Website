import { expect, test } from "@playwright/test";

test.describe("public archive smoke", () => {
  test("home loads the opening sequence", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("A life in progress");
    await expect(page.getByText("HO CHI MINH CITY → CALIFORNIA")).toBeVisible();
    await expect(page.locator("header.site-header")).toHaveAttribute("data-collapsed", "false");
  });

  test("primary nav reaches Story, Writing, Now, and Contact", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("a.nav-item[href='/admin']")).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: /^admin$/i })).toHaveCount(0);

    await page.locator("a.nav-item[href='/about']").click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.getByText("STORY / FIRST PASS")).toBeVisible();

    await page.locator("a.nav-item[href='/writing']").click();
    await expect(page).toHaveURL(/\/writing$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("The shelf is ready");
    await expect(page.getByRole("status")).toContainText("000");

    await page.locator("a.nav-item[href='/now']").click();
    await expect(page).toHaveURL(/\/now$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("In motion, not a summary");

    await page.getByRole("navigation", { name: "Footer" }).getByRole("link", { name: "Contact" }).click();
    await expect(page).toHaveURL(/\/contact$/);
    await expect(page.getByRole("link", { name: "dominichuyn@gmail.com" })).toHaveAttribute(
      "href",
      "mailto:dominichuyn@gmail.com",
    );
    await expect(page.getByRole("navigation", { name: "Footer" }).getByRole("link", { name: /GitHub/ })).toBeVisible();
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

  test("admin is a quiet footer line and shows a simple sign-in gate", async ({ page }) => {
    await page.goto("/");
    const admin = page.locator("footer.site-footer").getByRole("link", { name: "admin" });
    await expect(admin).toBeAttached();
    await admin.click();
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
});
