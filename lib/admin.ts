import { createHash, timingSafeEqual } from "node:crypto";

function sha256(value: string) {
  return createHash("sha256").update(value).digest();
}

export function normalizeAdminEmail(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

export function isOwnerEmail(email: string) {
  const expected = normalizeAdminEmail(process.env.ADMIN_EMAIL);
  const matches = timingSafeEqual(sha256(email), sha256(expected));
  return Boolean(expected) && matches;
}
