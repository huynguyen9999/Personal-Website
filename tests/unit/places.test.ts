import { describe, expect, it } from "vitest";
import {
  formatMiles,
  GLOBE_MILES,
  greatCircleCoordinates,
  haversineMiles,
  HOME,
  originView,
  visitorFromPayload,
  SANTA_BARBARA,
} from "@/lib/places";

describe("places", () => {
  it("treats Santa Barbara 93101 as the present home coordinate", () => {
    expect(HOME).toEqual(SANTA_BARBARA);
    expect(SANTA_BARBARA.postalCode).toBe("93101");
    const arc = greatCircleCoordinates(HOME, { lat: 40.71, lon: -74.01 });
    expect(arc[0]?.[0]).toBeCloseTo(HOME.lon, 5);
    expect(arc[0]?.[1]).toBeCloseTo(HOME.lat, 5);
    expect(arc.at(-1)?.[0]).toBeCloseTo(-74.01, 5);
  });

  it("measures an intercontinental journey in miles", () => {
    const miles = haversineMiles({ lat: 21.0278, lon: 105.8342 }, HOME);
    expect(miles).toBeGreaterThan(GLOBE_MILES);
    expect(miles).toBeGreaterThan(7500);
    expect(miles).toBeLessThan(8500);
    expect(formatMiles(miles)).toMatch(/^\d{1,3},\d{3}$/);
  });

  it("keeps nearby visitors close, then opens to a US-scale region", () => {
    const nearby = { lat: 34.43, lon: -119.7, label: "Santa Barbara" };
    const close = originView(nearby, "near");
    const region = originView(nearby, "region");
    expect(close).toMatchObject({ projection: "mercator", zoom: 7.1 });
    expect(region).toMatchObject({ projection: "mercator", maxZoom: 4 });
    if (!("bounds" in region)) throw new Error("expected regional bounds");
    expect(region.bounds[0][0]).toBeLessThanOrEqual(-124);
    expect(region.bounds[1][0]).toBeGreaterThanOrEqual(-67);
    expect(region.bounds[0][1]).toBeLessThanOrEqual(25);
    expect(region.bounds[1][1]).toBeGreaterThanOrEqual(49);
  });

  it("uses a globe for transoceanic visitors", () => {
    const distantVisitor = { lat: 35.6762, lon: 139.6503 };
    const world = originView(distantVisitor, "near");
    const pulledBack = originView(distantVisitor, "region");
    expect(world).toMatchObject({ projection: "globe", zoom: 1.85 });
    expect(pulledBack).toMatchObject({ projection: "globe", zoom: 1.15 });
  });

  it("ignores malformed geo payloads", () => {
    expect(visitorFromPayload({ lat: 36.3, lon: -119.3, city: "Visalia" })).toEqual({
      lat: 36.3,
      lon: -119.3,
      label: "Visalia",
    });
    expect(visitorFromPayload({ lat: 36.7, lon: -119.8, label: "Fresno, California" })).toEqual({
      lat: 36.7,
      lon: -119.8,
      label: "Fresno, California",
    });
    expect(visitorFromPayload({ lat: 0, lon: 0, city: "Null Island" })).toBeNull();
    expect(visitorFromPayload({ lat: "36", lon: -119 })).toBeNull();
    expect(visitorFromPayload({ lat: 36.3, lon: -119.3, city: "x".repeat(200) })?.label).toHaveLength(120);
  });
});
