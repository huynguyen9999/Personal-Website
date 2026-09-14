export const SITE_SECURITY_HEADERS: ReadonlyArray<readonly [string, string]> = [
  ["X-Content-Type-Options", "nosniff"],
  ["Referrer-Policy", "strict-origin-when-cross-origin"],
  ["X-Frame-Options", "DENY"],
  ["Permissions-Policy", "camera=(), microphone=(), geolocation=(self)"],
  ["Cross-Origin-Opener-Policy", "same-origin"],
];

export const ADMIN_SECURITY_HEADERS: ReadonlyArray<readonly [string, string]> = [
  ["X-Robots-Tag", "noindex, nofollow"],
  ["Cache-Control", "private, no-store, max-age=0"],
];

export function applyHeaders(
  target: { set(name: string, value: string): unknown },
  headers: ReadonlyArray<readonly [string, string]>,
) {
  for (const [name, value] of headers) target.set(name, value);
}
