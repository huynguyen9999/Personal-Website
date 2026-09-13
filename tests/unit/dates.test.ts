import { describe, expect, it } from "vitest";
import { formatPacificClock, formatPresentDispatch, pacificOffsetMs } from "@/lib/dates";
import { GET as getPacificTime } from "@/app/api/time/route";

describe("formatPresentDispatch", () => {
  it("uses the current month when nothing has been published yet", () => {
    expect(formatPresentDispatch(undefined, new Date("2026-09-13T18:00:00.000Z"))).toBe("September 2026");
    expect(formatPresentDispatch("not-a-date", new Date("2026-09-13T18:00:00.000Z"))).toBe("September 2026");
  });

  it("uses the published month in Santa Barbara time", () => {
    expect(formatPresentDispatch("2026-09-15T12:00:00.000Z")).toBe("September 2026");
  });
});

describe("Pacific Time clock", () => {
  it("formats a known instant as Sunday morning PDT", () => {
    expect(formatPacificClock(new Date("2026-09-13T18:00:00.000Z"))).toMatchObject({
      date: "Sunday, September 13, 2026",
      time: "11:00:00 AM",
      zone: "PDT",
    });
  });

  it("switches the abbreviation to PST after daylight time ends", () => {
    expect(formatPacificClock(new Date("2026-12-13T20:00:00.000Z")).zone).toBe("PST");
  });

  it("measures the offset between server time and the local clock", () => {
    expect(pacificOffsetMs("2026-09-13T18:00:00.000Z", Date.parse("2026-09-13T18:00:01.000Z"))).toBe(-1000);
  });

  it("returns a fresh uncached Pacific timestamp", async () => {
    const before = Date.now();
    const response = await getPacificTime();
    const payload = await response.json() as { iso: string; timeZone: string };
    expect(payload.timeZone).toBe("America/Los_Angeles");
    expect(new Date(payload.iso).getTime()).toBeGreaterThanOrEqual(before - 50);
    expect(response.headers.get("Cache-Control")).toMatch(/no-store/);
  });
});
