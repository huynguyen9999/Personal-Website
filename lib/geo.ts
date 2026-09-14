export type VisitorGeo = {
  lat: number;
  lon: number;
  city: string;
  region: string;
  country: string;
  source: "vercel" | "ip";
};

const IPV4 =
  /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

export function isValidIp(ip: string) {
  if (!ip || ip.length > 45) return false;
  if (IPV4.test(ip)) return true;
  if (!ip.includes(":") || /[^0-9a-fA-F:]/.test(ip)) return false;
  return (ip.match(/::/g)?.length ?? 0) <= 1;
}

export function clientIpFromHeaders(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for") || headers.get("x-vercel-forwarded-for") || "";
  const first = forwarded.split(",")[0]?.trim() ?? "";
  const fallback =
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") ||
    headers.get("x-client-ip") ||
    "";
  const ip = (first || fallback).replace(/^::ffff:/, "").trim();
  return isValidIp(ip) ? ip : "";
}

export function isPrivateIp(ip: string) {
  if (!ip) return true;
  const value = ip.toLowerCase();
  return (
    value === "::1" ||
    value === "127.0.0.1" ||
    value === "0.0.0.0" ||
    value.startsWith("10.") ||
    value.startsWith("192.168.") ||
    value.startsWith("127.") ||
    value.startsWith("169.254.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(value) ||
    value.startsWith("fc") ||
    value.startsWith("fd") ||
    value.startsWith("fe80:") ||
    value === "localhost"
  );
}

function readHeader(headers: Headers, name: string) {
  const value = headers.get(name);
  if (!value) return "";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function asVisitor(
  lat: number,
  lon: number,
  city: string,
  region: string,
  country: string,
  source: VisitorGeo["source"],
): VisitorGeo | null {
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    return null;
  }
  if (lat === 0 && lon === 0) return null;
  return {
    lat,
    lon,
    city: cleanPlace(city),
    region: cleanPlace(region, 40),
    country: cleanPlace(country, 56),
    source,
  };
}

export function vercelGeoFromHeaders(headers: Headers) {
  const latRaw = headers.get("x-vercel-ip-latitude");
  const lonRaw = headers.get("x-vercel-ip-longitude");
  if (!latRaw || !lonRaw) return null;
  try {
    return asVisitor(
      Number(decodeURIComponent(latRaw)),
      Number(decodeURIComponent(lonRaw)),
      readHeader(headers, "x-vercel-ip-city"),
      readHeader(headers, "x-vercel-ip-country-region"),
      readHeader(headers, "x-vercel-ip-country"),
      "vercel",
    );
  } catch {
    return null;
  }
}

function cleanPlace(value: string, max = 80) {
  return value.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, max);
}

export function visitorPayload(visitor: VisitorGeo) {
  return {
    lat: visitor.lat,
    lon: visitor.lon,
    city: cleanPlace(visitor.city),
    region: cleanPlace(visitor.region, 40),
    country: cleanPlace(visitor.country, 56),
  };
}

type IpWhoResponse = {
  success?: boolean;
  latitude?: number;
  longitude?: number;
  city?: string;
  region?: string;
  country?: string;
};

export async function lookupIpGeo(ip: string | null, fetchImpl: typeof fetch = fetch) {
  if (ip && !isValidIp(ip)) return null;
  const path = ip && !isPrivateIp(ip) ? `/${encodeURIComponent(ip)}` : "";
  const response = await fetchImpl(`https://ipwho.is${path}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) return null;
  const payload = (await response.json()) as IpWhoResponse;
  if (payload.success === false) return null;
  return asVisitor(
    Number(payload.latitude),
    Number(payload.longitude),
    payload.city || "",
    payload.region || "",
    payload.country || "",
    "ip",
  );
}
