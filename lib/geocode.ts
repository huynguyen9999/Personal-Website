type OpenMeteoResult = {
  name?: string;
  latitude?: number;
  longitude?: number;
  admin1?: string;
  country?: string;
  country_code?: string;
};

type OpenMeteoResponse = {
  results?: OpenMeteoResult[];
};

export type GeocodePlace = {
  lat: number;
  lon: number;
  label: string;
  countryCode: string;
};

export function sanitizePlaceQuery(value: unknown) {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 100);
}

export function normalizeGeocodeResults(results: OpenMeteoResult[] | undefined): GeocodePlace[] {
  return (results ?? []).flatMap((result) => {
    const lat = Number(result.latitude);
    const lon = Number(result.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
      return [];
    }
    if (lat === 0 && lon === 0) return [];
    const parts = [result.name, result.admin1, result.country]
      .map((part) => (part || "").replace(/[\u0000-\u001f\u007f]/g, "").trim())
      .filter(Boolean);
    if (!parts.length) return [];
    return [{
      lat,
      lon,
      label: parts.join(", ").slice(0, 120),
      countryCode: (result.country_code || "").replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase(),
    }];
  });
}

export async function searchPlaces(
  query: string,
  fetchImpl: typeof fetch = fetch,
): Promise<GeocodePlace[]> {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", query);
  url.searchParams.set("count", "5");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetchImpl(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) throw new Error("Geocoder unavailable");
    const payload = (await response.json()) as OpenMeteoResponse;
    return normalizeGeocodeResults(payload.results);
  } finally {
    clearTimeout(timeout);
  }
}
