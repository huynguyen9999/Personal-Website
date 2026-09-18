import { drivingMilesTo, validCoordinate } from "@/lib/driving-distance";

export const dynamic = "force-dynamic";

const headers = {
  "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = validCoordinate(searchParams.get("lat"), 90);
  const lon = validCoordinate(searchParams.get("lon"), 180);
  if (lat == null || lon == null || (lat === 0 && lon === 0)) {
    return Response.json({ error: "A valid destination is required." }, { status: 400, headers });
  }

  try {
    const miles = await drivingMilesTo({ lat, lon });
    if (miles == null) throw new Error("No driving route");
    return Response.json({ miles, provider: "OpenStreetMap / OSRM" }, { headers });
  } catch {
    return Response.json(
      { error: "Driving distance is temporarily unavailable." },
      { status: 502, headers },
    );
  }
}
