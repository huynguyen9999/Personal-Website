import { describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/driving-distance/route";
import { drivingMilesFromResponse, drivingMilesTo, validCoordinate } from "@/lib/driving-distance";

describe("driving distance", () => {
  it("accepts only finite, in-range coordinates", () => {
    expect(validCoordinate("34.4208", 90)).toBe(34.4208);
    expect(validCoordinate("91", 90)).toBeNull();
    expect(validCoordinate("not-a-number", 180)).toBeNull();
  });

  it("converts an OSRM route distance from meters to rounded miles", () => {
    expect(drivingMilesFromResponse({ code: "Ok", routes: [{ distance: 360_493 }] })).toBe(224);
    expect(drivingMilesFromResponse({ code: "NoRoute", routes: [] })).toBeNull();
  });

  it("uses a fixed origin and encodes only validated coordinates in the provider URL", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ code: "Ok", routes: [{ distance: 360_493 }] }),
    });
    await expect(drivingMilesTo({ lat: 36.3302, lon: -119.2921 }, fetchMock)).resolves.toBe(224);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("-119.6982,34.4208;-119.2921,36.3302");
  });

  it("rejects malformed API requests before any provider call", async () => {
    const response = await GET(new Request("http://local/api/driving-distance?lat=100&lon=-119"));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "A valid destination is required." });
  });
});
