import { describe, expect, it } from "vitest";
import {
  AUTH_HONEYPOT_FIELD,
  AUTH_LIMITS,
  SlidingWindowLimiter,
  clientIpFromHeaders,
  hashClientKey,
  inspectAuthForm,
  isWeakSignUpPassword,
} from "@/lib/auth-guard";
import { formDataFrom } from "../helpers";

describe("auth form inspection", () => {
  it("accepts a well-formed sign-in payload", () => {
    expect(
      inspectAuthForm(formDataFrom({ email: "dominichuyn@gmail.com", password: "long-enough" })),
    ).toEqual({
      ok: true,
      email: "dominichuyn@gmail.com",
      password: "long-enough",
    });
  });

  it("treats a filled honeypot as a bot and does not return the password", () => {
    expect(
      inspectAuthForm(
        formDataFrom({
          email: "dominichuyn@gmail.com",
          password: "long-enough",
          [AUTH_HONEYPOT_FIELD]: "https://spam.test",
        }),
      ),
    ).toEqual({ ok: false, reason: "honeypot" });
  });

  it("rejects empty, oversized, or malformed credentials before they reach auth", () => {
    expect(inspectAuthForm(formDataFrom({ email: "", password: "x" }))).toEqual({
      ok: false,
      reason: "invalid",
    });
    expect(inspectAuthForm(formDataFrom({ email: "not-an-email", password: "x" }))).toEqual({
      ok: false,
      reason: "invalid",
    });
    expect(
      inspectAuthForm(formDataFrom({ email: `${"a".repeat(255)}@x.co`, password: "x" })),
    ).toEqual({ ok: false, reason: "invalid" });
    expect(
      inspectAuthForm(formDataFrom({ email: "a@b.co", password: "p".repeat(AUTH_LIMITS.maxPasswordChars + 1) })),
    ).toEqual({ ok: false, reason: "invalid" });
    expect(isWeakSignUpPassword("short")).toBe(true);
    expect(isWeakSignUpPassword("long-enough")).toBe(false);
  });
});

describe("client identity", () => {
  it("uses the first forwarded address and hashes it for storage", () => {
    const ip = clientIpFromHeaders(new Headers({
      "x-forwarded-for": "203.0.113.10, 10.0.0.1",
    }));
    expect(ip).toBe("203.0.113.10");
    expect(hashClientKey(ip)).toHaveLength(32);
    expect(hashClientKey(ip)).not.toContain("203.0.113.10");
  });

  it("falls back to unknown when no client address is present", () => {
    expect(clientIpFromHeaders(new Headers())).toBe("unknown");
  });
});

describe("sliding-window auth limiter", () => {
  it("locks an address after a short burst, long before 500 tries", () => {
    const limiter = new SlidingWindowLimiter();
    const start = 1_700_000_000_000;

    for (let i = 0; i < AUTH_LIMITS.burstMax; i += 1) {
      expect(limiter.consume("bot", start + i).ok).toBe(true);
    }

    const blocked = limiter.consume("bot", start + AUTH_LIMITS.burstMax);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });

  it("caps an address at 20 attempts per hour across burst windows", () => {
    const limiter = new SlidingWindowLimiter();
    const start = 1_700_000_000_000;
    let allowed = 0;

    for (let wave = 0; wave < 3; wave += 1) {
      const waveStart = start + wave * AUTH_LIMITS.burstWindowMs;
      for (let i = 0; i < 7; i += 1) {
        if (limiter.consume("slow", waveStart + i).ok) allowed += 1;
      }
    }

    expect(allowed).toBe(AUTH_LIMITS.hourlyMax);
    expect(limiter.inspect("slow", start + 2 * AUTH_LIMITS.burstWindowMs).ok).toBe(false);
  });

  it("stops a 500-attempt hour from reaching the password check", () => {
    const limiter = new SlidingWindowLimiter();
    const start = 1_700_000_000_000;
    let allowed = 0;
    let denied = 0;

    for (let i = 0; i < 500; i += 1) {
      const decision = limiter.consume("flood", start + i * 1000);
      if (decision.ok) allowed += 1;
      else denied += 1;
    }

    expect(allowed).toBe(AUTH_LIMITS.burstMax);
    expect(denied).toBe(500 - AUTH_LIMITS.burstMax);
    expect(limiter.inspect("flood", start + 500_000).ok).toBe(false);
  });

  it("does not let one address's budget unlock another", () => {
    const limiter = new SlidingWindowLimiter();
    const start = 1_700_000_000_000;
    for (let i = 0; i < AUTH_LIMITS.burstMax; i += 1) limiter.consume("a", start);
    expect(limiter.consume("a", start).ok).toBe(false);
    expect(limiter.consume("b", start).ok).toBe(true);
  });

  it("clears a successful owner so a later typo is not still locked out", () => {
    const limiter = new SlidingWindowLimiter();
    const start = 1_700_000_000_000;
    for (let i = 0; i < AUTH_LIMITS.burstMax; i += 1) limiter.consume("owner", start);
    limiter.clear("owner");
    expect(limiter.consume("owner", start).ok).toBe(true);
  });

  it("enforces a global hourly ceiling across addresses", () => {
    const limiter = new SlidingWindowLimiter();
    const start = 1_700_000_000_000;
    for (let i = 0; i < AUTH_LIMITS.globalHourlyMax; i += 1) {
      expect(limiter.consume(`ip-${i}`, start).ok).toBe(true);
    }
    expect(limiter.consume("ip-overflow", start).ok).toBe(false);
  });
});
