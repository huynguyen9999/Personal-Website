import { createHash, timingSafeEqual } from "node:crypto";

function sha256(value: string) {
  return createHash("sha256").update(value).digest();
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function normalizeAdminUserId(value: unknown) {
  const userId = String(value || "").trim().toLowerCase();
  return UUID_PATTERN.test(userId) ? userId : "";
}

export function isOwnerUserId(userId: string) {
  const expected = normalizeAdminUserId(process.env.ADMIN_USER_ID);
  const matches = timingSafeEqual(sha256(normalizeAdminUserId(userId)), sha256(expected));
  return Boolean(expected) && matches;
}
