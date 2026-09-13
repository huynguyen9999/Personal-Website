import { PACIFIC_TIME_ZONE } from "@/lib/dates";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createPublicClient } from "@/lib/supabase/public";

export const QUARTER_KIND = "now" as const;
export const QUARTER_NOTE_MAX = 500;
export const QUARTER_YEAR_MIN = 2020;
export const QUARTER_YEAR_MAX = 2040;

export const quarterFields = [
  { id: "building", label: "Building" },
  { id: "learning", label: "Learning" },
  { id: "reading", label: "Reading" },
  { id: "tennis", label: "Tennis" },
  { id: "thinking", label: "Thinking about" },
  { id: "listening", label: "Listening to" },
  { id: "obsession", label: "Current obsession" },
] as const;

export type QuarterFieldId = (typeof quarterFields)[number]["id"];
export type QuarterNumber = 1 | 2 | 3 | 4;
export type QuarterNotes = Record<QuarterFieldId, string>;
export type QuarterStatus = "draft" | "published" | "local fallback";

export type QuarterLog = {
  slug: string;
  year: number;
  quarter: QuarterNumber;
  label: string;
  notes: QuarterNotes;
  status: QuarterStatus;
  updatedAt?: string;
};

const emptyNotes = (): QuarterNotes => ({
  building: "",
  learning: "",
  reading: "",
  tennis: "",
  thinking: "",
  listening: "",
  obsession: "",
});

export const seedQuarterNotes: QuarterNotes = {
  building: "Personal website admin/editor",
  learning: "Electrical Engineering at UC Santa Barbara",
  reading: "The Richest Man in Babylon · Steve Jobs · Start with Why",
  tennis: "Collegiate tennis at UCSB",
  thinking: "",
  listening: "",
  obsession: "",
};

export function isQuarterNumber(value: number): value is QuarterNumber {
  return value === 1 || value === 2 || value === 3 || value === 4;
}

export function parseQuarterSlug(value: string) {
  const match = /^(\d{4})-q([1-4])$/.exec(value.trim().toLowerCase());
  if (!match) return null;
  const year = Number(match[1]);
  const quarter = Number(match[2]);
  if (year < QUARTER_YEAR_MIN || year > QUARTER_YEAR_MAX || !isQuarterNumber(quarter)) return null;
  return { year, quarter };
}

export function quarterSlug(year: number, quarter: QuarterNumber) {
  return `${year}-q${quarter}`;
}

export function quarterLabel(year: number, quarter: QuarterNumber) {
  return `Q${quarter} ${year}`;
}

export function nextQuarter(year: number, quarter: QuarterNumber) {
  if (quarter === 4) return { year: year + 1, quarter: 1 as const };
  return { year, quarter: ((quarter + 1) as QuarterNumber) };
}

export function quarterFromDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "numeric",
    timeZone: PACIFIC_TIME_ZONE,
  }).formatToParts(now);
  const year = Number(parts.find((entry) => entry.type === "year")?.value);
  const month = Number(parts.find((entry) => entry.type === "month")?.value);
  const quarter = Math.ceil(month / 3);

  if (!Number.isInteger(year) || !isQuarterNumber(quarter)) {
    return { year: 2026, quarter: 3 as const };
  }

  return { year, quarter };
}

export function currentQuarterSlug(now = new Date()) {
  const current = quarterFromDate(now);
  return quarterSlug(current.year, current.quarter);
}

export function makeQuarterLog(
  year: number,
  quarter: QuarterNumber,
  notes: QuarterNotes = emptyNotes(),
  status: QuarterStatus = "local fallback",
): QuarterLog {
  return {
    slug: quarterSlug(year, quarter),
    year,
    quarter,
    label: quarterLabel(year, quarter),
    notes: { ...notes },
    status,
  };
}

export function fallbackQuarters(now = new Date()): QuarterLog[] {
  const current = quarterFromDate(now);
  return [makeQuarterLog(current.year, current.quarter, seedQuarterNotes)];
}

export function unionQuarters(...lists: QuarterLog[][]) {
  const bySlug = new Map<string, QuarterLog>();
  for (const list of lists) {
    for (const quarter of list) bySlug.set(quarter.slug, quarter);
  }
  return [...bySlug.values()].sort((a, b) => a.year - b.year || a.quarter - b.quarter);
}

export function currentQuarterIndex(quarters: QuarterLog[], now = new Date()) {
  const slug = currentQuarterSlug(now);
  const exact = quarters.findIndex((quarter) => quarter.slug === slug);
  if (exact >= 0) return exact;

  const current = quarterFromDate(now);
  const past = quarters
    .map((quarter, index) => ({ quarter, index }))
    .filter(({ quarter }) => quarter.year < current.year || (quarter.year === current.year && quarter.quarter <= current.quarter));
  return past.at(-1)?.index ?? Math.max(quarters.length - 1, 0);
}

export function suggestedNextQuarter(existing: Pick<QuarterLog, "year" | "quarter">[], now = new Date()) {
  if (existing.length === 0) {
    const current = quarterFromDate(now);
    return nextQuarter(current.year, current.quarter);
  }
  const latest = [...existing].sort((a, b) => a.year - b.year || a.quarter - b.quarter).at(-1)!;
  return nextQuarter(latest.year, latest.quarter);
}

function readNote(body: Record<string, unknown>, id: QuarterFieldId) {
  const value = body[id];
  return typeof value === "string" ? value.trim().slice(0, QUARTER_NOTE_MAX) : "";
}

export function notesFromBody(body: unknown): QuarterNotes {
  const record = body && typeof body === "object" ? body as Record<string, unknown> : {};
  const notes = emptyNotes();
  for (const field of quarterFields) notes[field.id] = readNote(record, field.id);
  return notes;
}

export function parseQuarterNotes(formData: FormData): QuarterNotes {
  const notes = emptyNotes();
  for (const field of quarterFields) {
    notes[field.id] = String(formData.get(field.id) || "").trim().slice(0, QUARTER_NOTE_MAX);
  }
  return notes;
}

export function parseQuarterSelection(formData: FormData) {
  const fromSlug = parseQuarterSlug(String(formData.get("slug") || ""));
  if (fromSlug) return fromSlug;

  const year = Number(String(formData.get("year") || "").trim());
  const quarter = Number(String(formData.get("quarter") || "").trim());
  if (!Number.isInteger(year) || year < QUARTER_YEAR_MIN || year > QUARTER_YEAR_MAX || !isQuarterNumber(quarter)) {
    return null;
  }
  return { year, quarter };
}

export function toQuarterLog(record: {
  slug: string;
  title?: string | null;
  body?: unknown;
  status?: string | null;
  updated_at?: string | null;
}): QuarterLog | null {
  const parsed = parseQuarterSlug(record.slug);
  if (!parsed) return null;
  const status = record.status === "published" || record.status === "draft" ? record.status : "draft";

  return {
    slug: record.slug,
    year: parsed.year,
    quarter: parsed.quarter,
    label: record.title?.trim() || quarterLabel(parsed.year, parsed.quarter),
    notes: notesFromBody(record.body),
    status,
    updatedAt: typeof record.updated_at === "string" ? record.updated_at : undefined,
  };
}

export function mergeQuarterLogs(published: QuarterLog[], drafts: QuarterLog[]) {
  return unionQuarters(published, drafts.map((quarter) => ({ ...quarter, status: "draft" as const })));
}

export async function getPublishedQuarters(now = new Date()) {
  const current = fallbackQuarters(now);
  if (!hasSupabaseConfig()) return current;

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("content_items")
    .select("slug,title,body,status,updated_at")
    .eq("kind", QUARTER_KIND)
    .eq("status", "published")
    .order("slug", { ascending: true });

  if (error) {
    console.error("Published quarter query failed", error.message);
    return current;
  }

  const published = (data || [])
    .map(toQuarterLog)
    .filter((quarter): quarter is QuarterLog => Boolean(quarter));

  return unionQuarters(current, published);
}

export async function getPresentState(now = new Date()) {
  const current = quarterFromDate(now);
  return {
    quarters: await getPublishedQuarters(now),
    currentSlug: quarterSlug(current.year, current.quarter),
    serverNow: now.toISOString(),
    timeZone: PACIFIC_TIME_ZONE,
  };
}
