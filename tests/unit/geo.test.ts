import { describe, expect, it, vi } from "vitest";
import {
  clientIpFromHeaders,
  isPrivateIp,
  isValidIp,
  lookupIpGeo,
  vercelGeoFromHeaders,
  visitorPayload,
} from "@/lib/geo";

describe("visitor geo", () => {
  it("reads the first public forwarded IP and ignores private addresses", () => {
    expect(clientIpFromHeaders(new Headers({ "x-forwarded-for": "203.0.113.10, 10.0.0.1" }))).toBe("203.0.113.10");
    expect(clientIpFromHeaders(new Headers({ "x-forwarded-for": "not-an-ip, 10.0.0.1" }))).toBe("");
    expect(isPrivateIp("127.0.0.1")).toBe(true);
    expect(isPrivateIp("10.4.0.8")).toBe(true);
    expect(isPrivateIp("192.168.1.2")).toBe(true);
    expect(isPrivateIp("fe80::1")).toBe(true);
    expect(isPrivateIp("203.0.113.10")).toBe(false);
    expect(isValidIp("8.8.8.8")).toBe(true);
    expect(isValidIp("8.8.8.8/secret")).toBe(false);
    expect(isValidIp("169.254.169.254")).toBe(true);
  });

  it("prefers Vercel geo headers and never includes the IP in the payload", () => {
    const visitor = vercelGeoFromHeaders(
      new Headers({
        "x-vercel-ip-latitude": "36.33",
        "x-vercel-ip-longitude": "-119.29",
        "x-vercel-ip-city": "Visalia",
        "x-vercel-ip-country-region": "CA",
        "x-vercel-ip-country": "US",
      }),
    );
    expect(visitor).toMatchObject({ lat: 36.33, lon: -119.29, city: "Visalia", source: "vercel" });
    expect(visitorPayload(visitor!)).not.toHaveProperty("ip");
    expect(visitorPayload(visitor!)).not.toHaveProperty("source");
    expect(vercelGeoFromHeaders(new Headers())).toBeNull();
    expect(
      vercelGeoFromHeaders(
        new Headers({
          "x-vercel-ip-latitude": "0",
          "x-vercel-ip-longitude": "0",
        }),
      ),
    ).toBeNull();
  });

  it("looks up a public IP without exposing it", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        latitude: 34.05,
        longitude: -118.25,
        city: "Los Angeles",
        region: "California",
        country: "United States",
      }),
    });

    const visitor = await lookupIpGeo("8.8.8.8", fetchImpl as unknown as typeof fetch);
    expect(fetchImpl).toHaveBeenCalledWith("https://ipwho.is/8.8.8.8", expect.any(Object));
    expect(visitor).toMatchObject({ lat: 34.05, lon: -118.25, city: "Los Angeles", source: "ip" });
    expect(JSON.stringify(visitor)).not.toContain("8.8.8.8");
  });

  it("does not look up malformed forwarded addresses", async () => {
    const fetchImpl = vi.fn();
    expect(await lookupIpGeo("8.8.8.8@evil.example", fetchImpl as unknown as typeof fetch)).toBeNull();
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
