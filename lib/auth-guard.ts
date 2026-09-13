import { createHash } from "node:crypto";

export const AUTH_HONEYPOT_FIELD = "website";

export const AUTH_LIMITS = {
  burstMax: 8,
  burstWindowMs: 15 * 60 * 1000,
  hourlyMax: 20,
  hourlyWindowMs: 60 * 60 * 1000,
  globalHourlyMax: 80,
  maxTrackedClients: 4096,
  maxEmailChars: 254,
  maxPasswordChars: 256,
  minSignUpPasswordChars: 8,
} as const;

export type RateLimitDecision =
  | { ok: true }
  | { ok: false; retryAfterMs: number };

type FormInspection =
  | { ok: true; email: string; password: string }
  | { ok: false; reason: "honeypot" | "invalid" };

function prune(timestamps: number[], now: number, windowMs: number) {
  const floor = now - windowMs;
  let index = 0;
  while (index < timestamps.length && timestamps[index] <= floor) index += 1;
  if (index > 0) timestamps.splice(0, index);
  return timestamps;
}

export class SlidingWindowLimiter {
  private readonly byKey = new Map<string, number[]>();
  private global: number[] = [];

  constructor(private readonly limits = AUTH_LIMITS) {}

  inspect(key: string, now = Date.now()): RateLimitDecision {
    const local = prune(this.byKey.get(key)?.slice() ?? [], now, this.limits.hourlyWindowMs);
    const global = prune(this.global.slice(), now, this.limits.hourlyWindowMs);
    const burst = prune(local.slice(), now, this.limits.burstWindowMs);

    if (burst.length >= this.limits.burstMax) {
      return { ok: false, retryAfterMs: this.retryAfter(burst, now, this.limits.burstWindowMs) };
    }
    if (local.length >= this.limits.hourlyMax) {
      return { ok: false, retryAfterMs: this.retryAfter(local, now, this.limits.hourlyWindowMs) };
    }
    if (global.length >= this.limits.globalHourlyMax) {
      return { ok: false, retryAfterMs: this.retryAfter(global, now, this.limits.hourlyWindowMs) };
    }
    return { ok: true };
  }

  consume(key: string, now = Date.now()): RateLimitDecision {
    const decision = this.inspect(key, now);
    if (!decision.ok) return decision;

    const local = prune(this.byKey.get(key) ?? [], now, this.limits.hourlyWindowMs);
    local.push(now);
    this.byKey.set(key, local);
    this.global = prune(this.global, now, this.limits.hourlyWindowMs);
    this.global.push(now);
    this.trimClients();
    return { ok: true };
  }

  clear(key: string) {
    this.byKey.delete(key);
  }

  reset() {
    this.byKey.clear();
    this.global = [];
  }

  size() {
    return this.byKey.size;
  }

  private retryAfter(timestamps: number[], now: number, windowMs: number) {
    const oldest = timestamps[0] ?? now;
    return Math.max(1000, oldest + windowMs - now);
  }

  private trimClients() {
    if (this.byKey.size <= this.limits.maxTrackedClients) return;
    const excess = this.byKey.size - Math.floor(this.limits.maxTrackedClients / 2);
    let removed = 0;
    for (const key of this.byKey.keys()) {
      this.byKey.delete(key);
      removed += 1;
      if (removed >= excess) break;
    }
  }
}

export const authAttemptLimiter = new SlidingWindowLimiter();

export function clientIpFromHeaders(headerList: Headers) {
  const forwarded = headerList.get("x-forwarded-for") || headerList.get("x-vercel-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 128);
  }
  const real = headerList.get("x-real-ip")?.trim();
  if (real) return real.slice(0, 128);
  return "unknown";
}

export function hashClientKey(ip: string) {
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

export function inspectAuthForm(formData: FormData): FormInspection {
  if (String(formData.get(AUTH_HONEYPOT_FIELD) || "").trim()) {
    return { ok: false, reason: "honeypot" };
  }

  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  if (!email || !password) return { ok: false, reason: "invalid" };
  if (email.length > AUTH_LIMITS.maxEmailChars) return { ok: false, reason: "invalid" };
  if (password.length > AUTH_LIMITS.maxPasswordChars) return { ok: false, reason: "invalid" };
  if (!email.includes("@")) return { ok: false, reason: "invalid" };
  return { ok: true, email, password };
}

export function isWeakSignUpPassword(password: string) {
  return password.length < AUTH_LIMITS.minSignUpPasswordChars;
}
