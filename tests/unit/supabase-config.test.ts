import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { hasSupabaseConfig } from "@/lib/supabase/config";

describe("hasSupabaseConfig", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  });

  it("is false when either public value is missing", () => {
    expect(hasSupabaseConfig()).toBe(false);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    expect(hasSupabaseConfig()).toBe(false);
  });

  it("is true only when both public values are present", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test_not_a_secret");
    expect(hasSupabaseConfig()).toBe(true);
  });

  it("never reads a service-role key", () => {
    const source = readFileSync(path.resolve(__dirname, "../../lib/supabase/config.ts"), "utf8");
    expect(source).not.toMatch(/SERVICE_ROLE|service_role|service-role/i);
  });
});
