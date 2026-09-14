import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/geocode/route";
import { normalizeGeocodeResults, sanitizePlaceQuery } from "@/lib/geocode";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("place geocoding", () => {
  it("sanitizes and validates the query before calling the provider", async () => {
    expect(sanitizePlaceQuery("  Visalia \u0000 CA  ")).toBe("Visalia  CA");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const response = await POST(new Request("http://local/api/geocode", {
      method: "POST",
      body: JSON.stringify({ query: " " }),
    }));

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns a small normalized list of worldwide matches", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [{
          name: "Visalia",
          latitude: 36.33023,
          longitude: -119.29206,
          admin1: "California",
          country: "United States",
          country_code: "US",
        }],
      }),
    }));
    const response = await POST(new Request("http://local/api/geocode", {
      method: "POST",
      body: JSON.stringify({ query: "93291" }),
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      results: [{
        lat: 36.33023,
        lon: -119.29206,
        label: "Visalia, California, United States",
        countryCode: "US",
      }],
    });
  });

  it("drops malformed provider coordinates", () => {
    expect(normalizeGeocodeResults([
      { name: "Null", latitude: 0, longitude: 0, country: "Nowhere" },
      { name: "Bad", latitude: 999, longitude: -119, country: "US" },
    ])).toEqual([]);
  });
});
