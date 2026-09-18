export const HO_CHI_MINH_CITY = {
  label: "Ho Chi Minh City",
  lat: 10.8231,
  lon: 106.6297,
} as const;

export const SANTA_BARBARA = {
  label: "Santa Barbara",
  region: "California",
  postalCode: "93101",
  lat: 34.4208,
  lon: -119.6982,
} as const;

export const HOME = SANTA_BARBARA;
export const GLOBE_MILES = 2800;

export type GeoPoint = {
  lat: number;
  lon: number;
  label?: string;
};

export type OriginFrame = "near" | "region";

export type OriginView =
  | {
      projection: "mercator" | "globe";
      center: [number, number];
      zoom: number;
    }
  | {
      projection: "mercator";
      bounds: [[number, number], [number, number]];
      padding: number;
      maxZoom: number;
    };

export function haversineMiles(from: GeoPoint, to: GeoPoint) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earth = 3958.8;
  const dLat = toRad(to.lat - from.lat);
  const dLon = toRad(to.lon - from.lon);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * earth * Math.asin(Math.min(1, Math.sqrt(a)));
}

export function formatMiles(miles: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(miles));
}

export type VisitorLocationSource = "network" | "device" | "provided";

export function visitorFromPayload(payload: unknown): GeoPoint | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;
  const lat = typeof record.lat === "number" ? record.lat : Number.NaN;
  const lon = typeof record.lon === "number" ? record.lon : Number.NaN;
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    return null;
  }
  if (lat === 0 && lon === 0) return null;
  const rawLabel =
    typeof record.label === "string"
      ? record.label
      : typeof record.city === "string"
        ? record.city
        : "";
  const label = rawLabel.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 120);
  return { lat, lon, label: label || "You" };
}

export function greatCircleCoordinates(from: GeoPoint, to: GeoPoint, steps = 48): [number, number][] {
  const lat1 = (from.lat * Math.PI) / 180;
  const lon1 = (from.lon * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const lon2 = (to.lon * Math.PI) / 180;
  const delta = 2 * Math.asin(
    Math.min(
      1,
      Math.sqrt(
        Math.sin((lat2 - lat1) / 2) ** 2 +
          Math.cos(lat1) * Math.cos(lat2) * Math.sin((lon2 - lon1) / 2) ** 2,
      ),
    ),
  );

  if (delta === 0) return [[from.lon, from.lat], [to.lon, to.lat]];

  const coords: [number, number][] = [];
  for (let index = 0; index <= steps; index += 1) {
    const fraction = index / steps;
    const A = Math.sin((1 - fraction) * delta) / Math.sin(delta);
    const B = Math.sin(fraction * delta) / Math.sin(delta);
    const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
    const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
    const z = A * Math.sin(lat1) + B * Math.sin(lat2);
    coords.push([
      (Math.atan2(y, x) * 180) / Math.PI,
      (Math.atan2(z, Math.sqrt(x * x + y * y)) * 180) / Math.PI,
    ]);
  }
  return coords;
}

export function originView(visitor: GeoPoint | null, frame: OriginFrame): OriginView {
  const miles = visitor ? haversineMiles(HOME, visitor) : null;
  if (miles != null && miles >= GLOBE_MILES && visitor) {
    const arc = greatCircleCoordinates(HOME, visitor, 8);
    const mid = arc[Math.floor(arc.length / 2)] ?? [HOME.lon, HOME.lat];
    return { projection: "globe", center: mid, zoom: frame === "region" ? 1.15 : 1.85 };
  }

  if (frame === "near") {
    if (miles == null) return { projection: "mercator", center: [HOME.lon, HOME.lat], zoom: 3.4 };
    if (!visitor || miles < 40) return { projection: "mercator", center: [HOME.lon, HOME.lat], zoom: 7.1 };
    return { projection: "mercator", bounds: geographicBox(HOME, visitor), padding: 96, maxZoom: 5.2 };
  }

  return {
    projection: "mercator",
    bounds: regionalBox(visitor),
    padding: 56,
    maxZoom: 4,
  };
}

function geographicBox(from: GeoPoint, to: GeoPoint): [[number, number], [number, number]] {
  return [
    [Math.min(from.lon, to.lon), Math.max(-75, Math.min(from.lat, to.lat))],
    [Math.max(from.lon, to.lon), Math.min(75, Math.max(from.lat, to.lat))],
  ];
}

function regionalBox(visitor: GeoPoint | null): [[number, number], [number, number]] {
  let west = -125;
  let east = -66;
  let south = 24;
  let north = 50;
  const points = visitor ? [HOME, visitor] : [HOME];
  for (const point of points) {
    west = Math.min(west, point.lon);
    east = Math.max(east, point.lon);
    south = Math.min(south, point.lat);
    north = Math.max(north, point.lat);
  }
  return [
    [west, Math.max(-75, south)],
    [east, Math.min(75, north)],
  ];
}
