export const PACIFIC_TIME_ZONE = "America/Los_Angeles";

function part(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) {
  return (parts.find((entry) => entry.type === type)?.value ?? "").replace(/[\s\u00a0\u202f]+/g, " ").trim();
}

export type PacificClockParts = {
  date: string;
  time: string;
  zone: string;
  iso: string;
};

export function formatPacificClock(now: Date): PacificClockParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: PACIFIC_TIME_ZONE,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZoneName: "short",
  }).formatToParts(now);

  const time = [part(parts, "hour"), part(parts, "minute"), part(parts, "second")]
    .filter(Boolean)
    .join(":");
  const zone = part(parts, "timeZoneName").replace(/\s+/g, " ") || "PT";
  const dayPeriod = part(parts, "dayPeriod").replace(/\s+/g, " ");

  return {
    date: `${part(parts, "weekday")}, ${part(parts, "month")} ${part(parts, "day")}, ${part(parts, "year")}`,
    time: dayPeriod ? `${time} ${dayPeriod}` : time,
    zone,
    iso: now.toISOString(),
  };
}
