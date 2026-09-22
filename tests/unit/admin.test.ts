import { beforeEach, describe, expect, it, vi } from "vitest";
import { isOwnerUserId, normalizeAdminUserId } from "@/lib/admin";
import { signIn } from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/server";
import { formDataFrom } from "../helpers";

const OWNER_ID = "1c9b420d-c7f9-4d65-a22a-1c98b25e42e8";

describe("admin owner helpers", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    delete process.env.ADMIN_USER_ID;
  });

  it("accepts only valid normalized UUIDs", () => {
    expect(normalizeAdminUserId(`  ${OWNER_ID.toUpperCase()} `)).toBe(OWNER_ID);
    expect(normalizeAdminUserId("not-a-user-id")).toBe("");
  });

  it("accepts only the configured owner account", () => {
    vi.stubEnv("ADMIN_USER_ID", OWNER_ID);
    expect(isOwnerUserId(OWNER_ID)).toBe(true);
    expect(isOwnerUserId("2c9b420d-c7f9-4d65-a22a-1c98b25e42e8")).toBe(false);
  });

  it("fails closed when the owner account is unset", () => {
    expect(isOwnerUserId(OWNER_ID)).toBe(false);
  });
});

describe("admin actions without a live password", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv("ADMIN_USER_ID", OWNER_ID);
    vi.mocked(createClient).mockReset();
  });

  it("does not disclose authorization during sign-in", async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({ error: { message: "invalid" } });
    vi.mocked(createClient).mockResolvedValue({ auth: { signInWithPassword } } as never);
    await expect(
      signIn(formDataFrom({ email: "intruder@example.com", password: "not-a-real-password" })),
    ).rejects.toThrow("NEXT_REDIRECT:/admin?error=failed");
    expect(signInWithPassword).toHaveBeenCalledWith({ email: "intruder@example.com", password: "not-a-real-password" });
  });

  it("fails closed on a honeypot fill and never talks to Supabase", async () => {
    await expect(
      signIn(formDataFrom({
        email: "dominichuyn@gmail.com",
        password: "placeholder-only",
        website: "http://bot.test",
      })),
    ).rejects.toThrow("NEXT_REDIRECT:/admin?error=failed");
    expect(createClient).not.toHaveBeenCalled();
  });

  it("asks the mocked auth client to sign in the owner without using a real password against production", async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({ error: { message: "invalid" } });
    vi.mocked(createClient).mockResolvedValue({
      auth: { signInWithPassword },
    } as never);

    await expect(
      signIn(formDataFrom({ email: "dominichuyn@gmail.com", password: "placeholder-only" })),
    ).rejects.toThrow("NEXT_REDIRECT:/admin?error=failed");

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "dominichuyn@gmail.com",
      password: "placeholder-only",
    });
  });

});
