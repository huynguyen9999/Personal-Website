import { NextRequest } from "next/server";
import {
  clientIpFromHeaders,
  isPrivateIp,
  lookupIpGeo,
  vercelGeoFromHeaders,
  visitorPayload,
} from "@/lib/geo";

export const dynamic = "force-dynamic";

const empty = {
  lat: null,
  lon: null,
  city: "",
  region: "",
  country: "",
};

export async function GET(request: NextRequest) {
  const headers = { "Cache-Control": "no-store" };
  const vercel = vercelGeoFromHeaders(request.headers);
  if (vercel) {
    return Response.json(visitorPayload(vercel), { headers });
  }

  const ip = clientIpFromHeaders(request.headers);
  try {
    if (ip && !isPrivateIp(ip)) {
      const visitor = await lookupIpGeo(ip);
      if (visitor) return Response.json(visitorPayload(visitor), { headers });
    }
  } catch {
    // Approximate location is optional; never leak the IP.
  }

  return Response.json(empty, { headers });
}
