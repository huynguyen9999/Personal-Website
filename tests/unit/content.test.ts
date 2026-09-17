import { beforeEach, describe, expect, it, vi } from "vitest";
import { editableSections, getFallbackSection, getPublishedSections } from "@/lib/content";
import { createPublicClient } from "@/lib/supabase/public";
import { inventedCopyPatterns } from "../helpers";

describe("content fallbacks", () => {
  it("keeps only the blueprint-backed public sections", () => {
    expect(editableSections.map((section) => section.slug)).toEqual([
      "home-opening",
      "home-proof",
      "home-now-teaser",
      "home-manifesto",
      "home-faq-english",
      "home-faq-siblings",
      "home-faq-free-time",
      "home-faq-ucsb",
      "home-faq-vietnam",
      "about-opening",
      "now-current",
      "contact-opening",
    ]);
  });

  it("does not invent a writing fallback or biography filler", () => {
    const copy = editableSections
      .map((section) => [section.eyebrow, section.title, section.accentTitle, section.summary, section.body].join("\n"))
      .join("\n");

    expect(copy).not.toMatch(/writing-opening|published pieces|essay title/i);
    for (const pattern of inventedCopyPatterns) {
      expect(copy).not.toMatch(pattern);
    }
  });

  it("returns the known local copy for each slug", () => {
    const opening = getFallbackSection("home-opening");
    expect(opening.eyebrow).toBe("HO CHI MINH CITY → CALIFORNIA");
    expect(opening.title).toBe("A life in progress,");
    expect(opening.accentTitle).toBe("measured in circuits and baselines.");
    expect(opening.summary).toMatch(/Electrical engineering at UC Santa Barbara/);
    expect(opening.summary).toMatch(/Collegiate tennis/);

    const proof = getFallbackSection("home-proof");
    expect(proof.eyebrow).toBe("CURRENT FOCUS");
    expect(proof.title).toMatch(/Electrical engineering at UC Santa Barbara/);
    expect(proof.body).toMatch(/signals, hardware, and software/);

    const about = getFallbackSection("about-opening");
    expect(about.body).toMatch(/Ho Chi Minh City/);

    const now = getFallbackSection("now-current");
    expect(now.body).toMatch(/Electrical engineering at UC Santa Barbara/);

    const contact = getFallbackSection("contact-opening");
    expect(contact.title).toBe("let's get in touch.");
    expect(contact.body).toBe("");
  });
});

describe("getPublishedSections", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    vi.mocked(createPublicClient).mockReset();
  });

  it("returns local fallbacks when Supabase config is missing", async () => {
    const [opening] = await getPublishedSections(["home-opening"]);
    expect(opening.title).toBe("A life in progress,");
    expect(createPublicClient).not.toHaveBeenCalled();
  });

  it("returns fallbacks when the mocked query fails", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test_not_a_secret");
    vi.mocked(createPublicClient).mockReturnValue({
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              in: async () => ({ data: null, error: { message: "relation missing" } }),
            }),
          }),
        }),
      }),
    } as never);

    const [opening] = await getPublishedSections(["home-opening"]);
    expect(opening.title).toBe("A life in progress,");
  });

  it("merges published fields without inventing missing copy", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test_not_a_secret");
    vi.mocked(createPublicClient).mockReturnValue({
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              in: async () => ({
                data: [
                  {
                    slug: "home-opening",
                    title: "Published opening",
                    summary: "A real published summary.",
                    body: { eyebrow: "PUBLISHED EYEBROW", copy: "Published body." },
                    updated_at: "2026-09-12T00:00:00.000Z",
                  },
                ],
                error: null,
              }),
            }),
          }),
        }),
      }),
    } as never);

    const [opening] = await getPublishedSections(["home-opening"]);
    expect(opening.title).toBe("Published opening");
    expect(opening.eyebrow).toBe("PUBLISHED EYEBROW");
    expect(opening.body).toBe("Published body.");
    expect(opening.summary).toBe("A real published summary.");
    expect(opening.accentTitle).toBe("measured in circuits and baselines.");
  });
});
