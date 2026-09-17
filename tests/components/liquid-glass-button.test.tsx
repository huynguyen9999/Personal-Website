import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LiquidGlassButton } from "@/components/ui/liquid-glass-button";

describe("LiquidGlassButton", () => {
  it("preserves an accessible external link when composed around an anchor", () => {
    render(
      <LiquidGlassButton asChild size="compact">
        <a href="https://example.com" target="_blank" rel="noopener noreferrer">Example</a>
      </LiquidGlassButton>,
    );

    const link = screen.getByRole("link", { name: "Example" });
    expect(link).toHaveClass("liquid-glass-button", "liquid-glass-button--compact");
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders a real button with the requested type", () => {
    render(<LiquidGlassButton type="button">Filter</LiquidGlassButton>);

    expect(screen.getByRole("button", { name: "Filter" })).toHaveAttribute("type", "button");
  });
});
