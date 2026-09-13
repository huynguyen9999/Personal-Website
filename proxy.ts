import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ADMIN_SECURITY_HEADERS, applyHeaders } from "@/lib/security-headers";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const response = hasSupabaseConfig() ? await updateSession(request) : NextResponse.next();
  applyHeaders(response.headers, ADMIN_SECURITY_HEADERS);
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
