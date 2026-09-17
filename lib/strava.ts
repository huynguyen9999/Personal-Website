const STRAVA_PROFILE_URL = "https://www.strava.com/athletes/45200919";
const DEFAULT_ATHLETE_ID = "45200919";

type ActivityTotalPayload = {
  count?: unknown;
  distance?: unknown;
  moving_time?: unknown;
};

export type ActivityTotal = {
  count: number;
  distanceMeters: number;
  movingSeconds: number;
};

export type StravaStats = {
  yearToDateRun: ActivityTotal;
  allTimeRun: ActivityTotal;
};

export { STRAVA_PROFILE_URL };

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function toActivityTotal(value: unknown): ActivityTotal {
  const total = value && typeof value === "object" ? value as ActivityTotalPayload : {};
  return {
    count: asNumber(total.count),
    distanceMeters: asNumber(total.distance),
    movingSeconds: asNumber(total.moving_time),
  };
}

async function getAccessToken() {
  const existingToken = process.env.STRAVA_ACCESS_TOKEN;
  if (existingToken) return existingToken;

  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const refreshToken = process.env.STRAVA_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) return null;

  const response = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    cache: "no-store",
  });
  if (!response.ok) return null;

  const payload = await response.json() as { access_token?: unknown };
  return typeof payload.access_token === "string" ? payload.access_token : null;
}

export async function getStravaStats(): Promise<StravaStats | null> {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return null;

    const athleteId = process.env.STRAVA_ATHLETE_ID || DEFAULT_ATHLETE_ID;
    const response = await fetch(`https://www.strava.com/api/v3/athletes/${encodeURIComponent(athleteId)}/stats`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      next: { revalidate: 3_600 },
    });
    if (!response.ok) return null;

    const payload = await response.json() as {
      ytd_run_totals?: unknown;
      all_run_totals?: unknown;
    };
    return {
      yearToDateRun: toActivityTotal(payload.ytd_run_totals),
      allTimeRun: toActivityTotal(payload.all_run_totals),
    };
  } catch {
    return null;
  }
}
