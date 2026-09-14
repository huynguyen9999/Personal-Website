import { sanitizePlaceQuery, searchPlaces } from "@/lib/geocode";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Enter a city or postal code." }, { status: 400, headers });
  }

  const query =
    body && typeof body === "object"
      ? sanitizePlaceQuery((body as { query?: unknown }).query)
      : "";
  if (query.length < 2) {
    return Response.json({ error: "Enter between 2 and 100 characters." }, { status: 400, headers });
  }

  try {
    const results = await searchPlaces(query);
    return Response.json({ results }, { headers });
  } catch {
    return Response.json(
      { error: "Location search is temporarily unavailable. Try again." },
      { status: 502, headers },
    );
  }
}
