import { HOME, type GeoPoint } from "@/lib/places";

const METERS_TO_MILES = 0.000621371;
const ROUTING_ENDPOINT = "https://router.project-osrm.org/route/v1/driving";

type OsrmRouteResponse = {
  code?: string;
  routes?: Array<{ distance?: number }>;
};

export function validCoordinate(value: string | null, limit: number) {
  if (value == null || value.trim() === "") return null;
  const coordinate = Number(value);
  return Number.isFinite(coordinate) && Math.abs(coordinate) <= limit ? coordinate : null;
}

export function drivingMilesFromResponse(payload: OsrmRouteResponse) {
  const meters = payload.code === "Ok" ? payload.routes?.[0]?.distance : undefined;
  if (!Number.isFinite(meters) || !meters || meters <= 0) return null;
  return Math.round(meters * METERS_TO_MILES);
}

export async function drivingMilesTo(
  destination: GeoPoint,
  fetchImpl: typeof fetch = fetch,
) {
  const url = new URL(
    `${ROUTING_ENDPOINT}/${HOME.lon},${HOME.lat};${destination.lon},${destination.lat}`,
  );
  url.searchParams.set("overview", "false");
  url.searchParams.set("alternatives", "false");
  url.searchParams.set("steps", "false");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetchImpl(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "HuyNguyenPersonalWebsite/1.0 (+https://thehobbiest.vercel.app)",
      },
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) throw new Error("Routing unavailable");
    return drivingMilesFromResponse((await response.json()) as OsrmRouteResponse);
  } finally {
    clearTimeout(timeout);
  }
}
