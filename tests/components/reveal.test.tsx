import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Reveal } from "@/components/reveal";
import { installMatchMedia } from "../helpers";

describe("Reveal", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows content immediately when reduced motion is on", () => {
    installMatchMedia({ "(prefers-reduced-motion: reduce)": true });
    render(
      <Reveal>
        <p>Field note</p>
      </Reveal>,
    );

    expect(screen.getByText("Field note").parentElement).toHaveAttribute("data-visible", "true");
  });

  it("reveals in-view content after animation frames when motion is allowed", async () => {
    installMatchMedia({ "(prefers-reduced-motion: reduce)": false });
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      top: 40,
      bottom: 120,
      left: 0,
      right: 0,
      width: 100,
      height: 80,
      x: 0,
      y: 40,
      toJSON() {
        return {};
      },
    });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 });

    render(
      <Reveal>
        <p>Trajectory</p>
      </Reveal>,
    );

    const node = screen.getByText("Trajectory").parentElement;
    expect(node).toHaveAttribute("data-visible", "false");
    await waitFor(() => {
      expect(node).toHaveAttribute("data-visible", "true");
    });
  });

  it("applies a transition delay when asked", () => {
    installMatchMedia({ "(prefers-reduced-motion: reduce)": true });
    render(
      <Reveal delayMs={120}>
        <p>Later</p>
      </Reveal>,
    );

    expect(screen.getByText("Later").parentElement).toHaveStyle({ transitionDelay: "120ms" });
  });

  it("reveals content on scroll when IntersectionObserver does not deliver", async () => {
    installMatchMedia({ "(prefers-reduced-motion: reduce)": false });
    let top = 1200;
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(() => ({
      top,
      bottom: top + 80,
      left: 0,
      right: 100,
      width: 100,
      height: 80,
      x: 0,
      y: top,
      toJSON() {
        return {};
      },
    }));
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 });

    render(
      <Reveal>
        <p>Fallback reveal</p>
      </Reveal>,
    );

    const node = screen.getByText("Fallback reveal").parentElement;
    expect(node).toHaveAttribute("data-visible", "false");
    top = 400;
    fireEvent.scroll(window);
    await waitFor(() => expect(node).toHaveAttribute("data-visible", "true"));
  });
});
