import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQuarter, saveQuarter } from "@/app/admin/quarter-actions";
import { createClient } from "@/lib/supabase/server";
import { formDataFrom } from "../helpers";

describe("quarter admin actions", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv("ADMIN_USER_ID", "1c9b420d-c7f9-4d65-a22a-1c98b25e42e8");
    vi.mocked(createClient).mockReset();
  });

  it("rejects an invalid quarter before talking to Supabase", async () => {
    await expect(createQuarter(formDataFrom({ year: "2027", quarter: "5" }))).rejects.toThrow(
      "NEXT_REDIRECT:/admin?error=quarter-invalid#quarter-log",
    );
    await expect(saveQuarter(formDataFrom({ slug: "now" }))).rejects.toThrow(
      "NEXT_REDIRECT:/admin?error=quarter-invalid#quarter-log",
    );
    expect(createClient).not.toHaveBeenCalled();
  });

  it("keeps non-owners out of the memory log", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getClaims: vi.fn().mockResolvedValue({
          data: { claims: { sub: "intruder", email: "intruder@example.com" } },
        }),
      },
    } as never);

    await expect(createQuarter(formDataFrom({ year: "2027", quarter: "1" }))).rejects.toThrow(
      "NEXT_REDIRECT:/admin?error=unauthorized",
    );
  });
});
