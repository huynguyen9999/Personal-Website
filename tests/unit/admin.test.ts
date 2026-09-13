import { beforeEach, describe, expect, it, vi } from "vitest";
import { headers } from "next/headers";
import { isOwnerEmail, normalizeAdminEmail } from "@/lib/admin";
import { AUTH_LIMITS, authAttemptLimiter } from "@/lib/auth-guard";
import { signIn, signUp } from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/server";
import { formDataFrom } from "../helpers";

describe("admin email helpers", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    delete process.env.ADMIN_EMAIL;
  });

  it("normalizes owner emails the same way sign-in does", () => {
    expect(normalizeAdminEmail("  DominicHuyn@gmail.com ")).toBe("dominichuyn@gmail.com");
    expect(normalizeAdminEmail(null)).toBe("");
  });

  it("accepts only the configured owner email", () => {
    vi.stubEnv("ADMIN_EMAIL", "dominichuyn@gmail.com");
    expect(isOwnerEmail("dominichuyn@gmail.com")).toBe(true);
    expect(isOwnerEmail("other@example.com")).toBe(false);
    expect(isOwnerEmail("Dominichuyn@gmail.com")).toBe(false);
  });

  it("rejects every email when ADMIN_EMAIL is unset", () => {
    expect(isOwnerEmail("dominichuyn@gmail.com")).toBe(false);
  });
});

describe("admin actions without a live password", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv("ADMIN_EMAIL", "dominichuyn@gmail.com");
    vi.mocked(createClient).mockReset();
    vi.mocked(headers).mockResolvedValue(new Headers({ "x-forwarded-for": "203.0.113.50" }));
    authAttemptLimiter.reset();
  });

  it("rejects unauthorized sign-in before creating a Supabase client", async () => {
    await expect(
      signIn(formDataFrom({ email: "intruder@example.com", password: "not-a-real-password" })),
    ).rejects.toThrow("NEXT_REDIRECT:/admin?error=failed");
    expect(createClient).not.toHaveBeenCalled();
  });

  it("rejects unauthorized sign-up before creating a Supabase client", async () => {
    await expect(
      signUp(formDataFrom({ email: "intruder@example.com", password: "long-enough" })),
    ).rejects.toThrow("NEXT_REDIRECT:/admin?error=failed");
    expect(createClient).not.toHaveBeenCalled();
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

  it("locks the address after a burst of failures so a 500-try hour cannot continue", async () => {
    for (let i = 0; i < AUTH_LIMITS.burstMax; i += 1) {
      await expect(
        signIn(formDataFrom({ email: "intruder@example.com", password: "guess" })),
      ).rejects.toThrow("NEXT_REDIRECT:/admin?error=failed");
    }

    await expect(
      signIn(formDataFrom({ email: "intruder@example.com", password: "guess" })),
    ).rejects.toThrow("NEXT_REDIRECT:/admin?error=limited");
    expect(createClient).not.toHaveBeenCalled();
  });

  it("clears the lock after a successful owner sign-in", async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(createClient).mockResolvedValue({
      auth: { signInWithPassword },
    } as never);

    for (let i = 0; i < AUTH_LIMITS.burstMax - 1; i += 1) {
      signInWithPassword.mockResolvedValueOnce({ error: { message: "invalid" } });
      await expect(
        signIn(formDataFrom({ email: "dominichuyn@gmail.com", password: "wrong" })),
      ).rejects.toThrow("NEXT_REDIRECT:/admin?error=failed");
    }

    signInWithPassword.mockResolvedValueOnce({ error: null });
    await expect(
      signIn(formDataFrom({ email: "dominichuyn@gmail.com", password: "correct-horse" })),
    ).rejects.toThrow("NEXT_REDIRECT:/admin");

    signInWithPassword.mockResolvedValueOnce({ error: { message: "invalid" } });
    await expect(
      signIn(formDataFrom({ email: "dominichuyn@gmail.com", password: "wrong-again" })),
    ).rejects.toThrow("NEXT_REDIRECT:/admin?error=failed");
  });
});
