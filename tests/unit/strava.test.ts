import { afterEach, describe, expect, it, vi } from "vitest";

import { getStravaStats } from "@/lib/strava";

const stravaEnvKeys = [
  "STRAVA_ACCESS_TOKEN",
  "STRAVA_CLIENT_ID",
  "STRAVA_CLIENT_SECRET",
  "STRAVA_REFRESH_TOKEN",
  "STRAVA_ATHLETE_ID",
] as const;

describe("getStravaStats", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    for (const key of stravaEnvKeys) delete process.env[key];
  });

  it("does not request Strava when server credentials are absent", async () => {
    const fetchSpy = vi.spyOn(global, "fetch");

    await expect(getStravaStats()).resolves.toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("maps Strava totals with a server-only access token", async () => {
    process.env.STRAVA_ACCESS_TOKEN = "server-only-token";
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(new Response(JSON.stringify({
      ytd_run_totals: { count: 7, distance: 12000, moving_time: 4800 },
      all_run_totals: { count: 42, distance: 84000, moving_time: 36000 },
    }), { status: 200 }));

    await expect(getStravaStats()).resolves.toEqual({
      yearToDateRun: { count: 7, distanceMeters: 12000, movingSeconds: 4800 },
      allTimeRun: { count: 42, distanceMeters: 84000, movingSeconds: 36000 },
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("/athletes/45200919/stats"),
      expect.objectContaining({ headers: { Authorization: "Bearer server-only-token" } }),
    );
  });
});
