import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OriginMap } from "@/components/origin-map";
import { HOME } from "@/lib/places";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("OriginMap", () => {
  it("turns the visitor location into the concise dynamic distance heading", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: string | URL | Request) => ({
      ok: true,
      json: async () => String(input).startsWith("/api/driving-distance")
        ? { miles: 0 }
        : { lat: HOME.lat, lon: HOME.lon, city: "Santa Barbara" },
    })));

    render(<OriginMap />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "You are 0 driving miles away from Huy Nguyen" })).toBeInTheDocument();
    });
    expect(screen.queryByText(/Network location is an ISP estimate/)).not.toBeInTheDocument();
    expect(screen.queryByText(/I’m from Santa Barbara, California/)).not.toBeInTheDocument();
  });
});
