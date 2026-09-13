import { PACIFIC_TIME_ZONE } from "@/lib/dates";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(
    {
      iso: new Date().toISOString(),
      timeZone: PACIFIC_TIME_ZONE,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    },
  );
}
