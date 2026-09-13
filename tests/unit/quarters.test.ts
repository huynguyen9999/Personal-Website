import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  currentQuarterIndex,
  currentQuarterSlug,
  fallbackQuarters,
  getPublishedQuarters,
  mergeQuarterLogs,
  nextQuarter,
  parseQuarterSelection,
  parseQuarterSlug,
  quarterFromDate,
  quarterLabel,
  quarterSlug,
  seedQuarterNotes,
  suggestedNextQuarter,
  toQuarterLog,
  unionQuarters,
} from "@/lib/quarters";
import { createPublicClient } from "@/lib/supabase/public";
import { formDataFrom, inventedCopyPatterns } from "../helpers";

const september = new Date("2026-09-13T18:00:00.000Z");

describe("quarter identity", () => {
  it("locks labels to Qn YYYY", () => {
    expect(quarterSlug(2026, 4)).toBe("2026-q4");
    expect(quarterLabel(2026, 4)).toBe("Q4 2026");
    expect(parseQuarterSlug("2026-q4")).toEqual({ year: 2026, quarter: 4 });
    expect(parseQuarterSlug("2026-q5")).toBeNull();
    expect(parseQuarterSlug("now")).toBeNull();
  });

  it("advances to the next locked quarter", () => {
    expect(nextQuarter(2026, 4)).toEqual({ year: 2027, quarter: 1 });
    expect(nextQuarter(2027, 1)).toEqual({ year: 2027, quarter: 2 });
    expect(suggestedNextQuarter(fallbackQuarters(september), september)).toEqual({ year: 2026, quarter: 4 });
  });

  it("reads Santa Barbara calendar quarters", () => {
    expect(quarterFromDate(september)).toEqual({ year: 2026, quarter: 3 });
    expect(currentQuarterSlug(september)).toBe("2026-q3");
    expect(quarterFromDate(new Date("2026-10-02T18:00:00.000Z"))).toEqual({ year: 2026, quarter: 4 });
    expect(quarterFromDate(new Date("2027-01-05T18:00:00.000Z"))).toEqual({ year: 2027, quarter: 1 });
  });

  it("keeps the local current-quarter snapshot factual", () => {
    const copy = JSON.stringify(fallbackQuarters(september));
    expect(fallbackQuarters(september)[0]?.label).toBe("Q3 2026");
    expect(copy).toMatch(/Steve Jobs/);
    expect(copy).toMatch(seedQuarterNotes.building);
    expect(copy).not.toMatch(/RF systems/i);
    for (const pattern of inventedCopyPatterns) {
      expect(copy).not.toMatch(pattern);
    }
  });
});

describe("quarter records", () => {
  it("ignores unknown slugs and empty invented fields", () => {
    expect(toQuarterLog({ slug: "present" })).toBeNull();
    expect(toQuarterLog({
      slug: "2027-q1",
      title: "Q1 2027",
      body: { building: "  A later building note  ", extra: "ignore me" },
      status: "published",
    })).toMatchObject({
      slug: "2027-q1",
      label: "Q1 2027",
      notes: {
        building: "A later building note",
        learning: "",
        obsession: "",
      },
    });
  });

  it("lets a draft replace the published copy of the same quarter", () => {
    const published = toQuarterLog({
      slug: "2026-q4",
      body: { building: "Published building" },
      status: "published",
    })!;
    const draft = toQuarterLog({
      slug: "2026-q4",
      body: { building: "Draft building" },
      status: "draft",
    })!;

    expect(mergeQuarterLogs([published], [draft]).map((quarter) => quarter.notes.building)).toEqual([
      "Draft building",
    ]);
  });

  it("keeps the current calendar quarter when a later quarter is published", () => {
    const later = toQuarterLog({
      slug: "2027-q1",
      body: { building: "Published later" },
      status: "published",
    })!;
    const merged = unionQuarters(fallbackQuarters(september), [later]);
    expect(merged.map((quarter) => quarter.slug)).toEqual(["2026-q3", "2027-q1"]);
    expect(merged[0]?.notes.building).toBe(seedQuarterNotes.building);
    expect(currentQuarterIndex(merged, september)).toBe(0);
  });

  it("only accepts a year and Q1-Q4 from the editor", () => {
    expect(parseQuarterSelection(formDataFrom({ slug: "2026-q4" }))).toEqual({ year: 2026, quarter: 4 });
    expect(parseQuarterSelection(formDataFrom({ year: "2027", quarter: "1" }))).toEqual({ year: 2027, quarter: 1 });
    expect(parseQuarterSelection(formDataFrom({ year: "2027", quarter: "5" }))).toBeNull();
    expect(parseQuarterSelection(formDataFrom({ year: "1999", quarter: "1" }))).toBeNull();
  });
});

describe("getPublishedQuarters", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    vi.mocked(createPublicClient).mockReset();
  });

  it("returns the local log when Supabase is unset", async () => {
    expect(await getPublishedQuarters(september)).toEqual(fallbackQuarters(september));
    expect(createPublicClient).not.toHaveBeenCalled();
  });

  it("keeps the current quarter when later seasons are published", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test_not_a_secret");
    vi.mocked(createPublicClient).mockReturnValue({
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              order: async () => ({
                data: [
                  {
                    slug: "2027-q1",
                    title: "Q1 2027",
                    body: { building: "Published later" },
                    status: "published",
                    updated_at: "2027-01-12T00:00:00.000Z",
                  },
                  {
                    slug: "2026-q4",
                    title: "Q4 2026",
                    body: { building: "Published first" },
                    status: "published",
                    updated_at: "2026-10-01T00:00:00.000Z",
                  },
                ],
                error: null,
              }),
            }),
          }),
        }),
      }),
    } as never);

    const quarters = await getPublishedQuarters(september);
    expect(quarters.map((quarter) => quarter.slug)).toEqual(["2026-q3", "2026-q4", "2027-q1"]);
    expect(quarters[0]?.notes.building).toBe(seedQuarterNotes.building);
    expect(quarters[1]?.notes.building).toBe("Published first");
  });
});
