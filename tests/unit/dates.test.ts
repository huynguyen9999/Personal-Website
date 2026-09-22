import { describe, expect, it } from "vitest";
import { formatPacificClock } from "@/lib/dates";

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

});
