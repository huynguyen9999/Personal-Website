import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OriginMap } from "@/components/origin-map";
import { HOME } from "@/lib/places";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("OriginMap", () => {
  it("turns the visitor location into the concise dynamic distance heading", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ lat: HOME.lat, lon: HOME.lon, city: "Visalia" }),
    }));

    render(<OriginMap />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "You are 0 miles away from Huy Nguyen" })).toBeInTheDocument();
    });
    expect(screen.queryByText(/Network location is an ISP estimate/)).not.toBeInTheDocument();
    expect(screen.queryByText(/I’m from Visalia, California/)).not.toBeInTheDocument();
  });
});
