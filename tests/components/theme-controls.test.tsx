import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ThemeControls } from "@/components/theme-controls";
import { installMatchMedia } from "../helpers";

describe("ThemeControls", () => {
  it("stores an explicit theme and marks the pressed control", async () => {
    installMatchMedia({ "(prefers-color-scheme: dark)": false });
    const user = userEvent.setup();
    render(<ThemeControls />);

    await user.click(screen.getByRole("button", { name: "dark" }));

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(document.documentElement.dataset.themePreference).toBe("dark");
    expect(localStorage.getItem("site-theme")).toBe("dark");
    expect(screen.getByRole("button", { name: "dark" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "light" })).toHaveAttribute("aria-pressed", "false");
  });

  it("resolves system theme from the color-scheme media query", async () => {
    installMatchMedia({ "(prefers-color-scheme: dark)": true });
    const user = userEvent.setup();
    render(<ThemeControls />);

    await user.click(screen.getByRole("button", { name: "system" }));

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(document.documentElement.dataset.themePreference).toBe("system");
    expect(localStorage.getItem("site-theme")).toBe("system");
  });
});
