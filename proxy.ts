import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  if (!hasSupabaseConfig()) return NextResponse.next();
  return updateSession(request);
}

export const config = {
  matcher: ["/admin/:path*"],
};
