import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CursorTrail } from "@/components/cursor-trail";
import { installMatchMedia } from "../helpers";

function trailElements() {
  const canvas = document.querySelector("canvas.cursor-trail") as HTMLCanvasElement | null;
  const pointer = document.querySelector("svg.cursor-glyph") as SVGSVGElement | null;
  return { canvas, pointer };
}

describe("CursorTrail", () => {
  it("clears the canvas and hides the pointer when reduced motion is on", () => {
    installMatchMedia({ "(prefers-reduced-motion: reduce)": true });
    render(<CursorTrail />);

    const { canvas, pointer } = trailElements();
    expect(canvas).not.toBeNull();
    expect(pointer).not.toBeNull();
    expect(canvas?.width).toBe(0);
    expect(canvas?.height).toBe(0);
    expect(pointer?.style.opacity).toBe("0");
  });

  it("sizes the canvas when motion is allowed", () => {
    installMatchMedia({ "(prefers-reduced-motion: reduce)": false });
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 1024 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 768 });
    Object.defineProperty(window, "devicePixelRatio", { configurable: true, value: 1 });

    render(<CursorTrail />);

    const { canvas, pointer } = trailElements();
    expect(canvas?.width).toBe(1024);
    expect(canvas?.height).toBe(768);
    expect(pointer?.style.opacity).not.toBe("0");
  });
});
