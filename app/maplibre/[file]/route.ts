import { basename, join } from "node:path";
import { readFile } from "node:fs/promises";

export const runtime = "nodejs";

const WORKER_FILES = new Set(["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]);

export async function GET(
  _request: Request,
  context: { params: Promise<{ file: string }> },
) {
  const { file: rawFile } = await context.params;
  const file = basename(rawFile);
  if (!WORKER_FILES.has(file)) {
    return new Response(null, { status: 404 });
  }

  const buffer = await readFile(join(process.cwd(), "node_modules/maplibre-gl/dist", file));
  return new Response(buffer, {
    headers: {
      "Content-Type": "text/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
