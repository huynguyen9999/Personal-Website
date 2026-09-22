import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getPlacedPhotos,
  isMediaPage,
  isMediaSlot,
  isValidMediaPlacement,
  mediaPages,
  parseMediaPlacement,
  photosForSlot,
  slotsForPage,
  toPlacedPhoto,
} from "@/lib/media";
import { createPublicClient } from "@/lib/supabase/public";
import { formDataFrom, samplePhoto } from "../helpers";

describe("media page and slot validators", () => {
  it("accepts the public archive pages and rejects retired routes", () => {
    expect(mediaPages.map((page) => page.id)).toEqual([
      "home",
      "about",
      "what-i-do",
      "who-i-am",
      "reading",
      "now",
      "contact",
    ]);
    const hrefs = mediaPages.map((page) => page.href) as string[];
    expect(hrefs).not.toContain("/work");
    expect(hrefs).not.toContain("/life");
    expect(isMediaPage("home")).toBe(true);
    expect(isMediaPage("work")).toBe(false);
    expect(isMediaPage("life")).toBe(false);
  });

  it("lists only slots that belong to a page", () => {
    expect(slotsForPage("home").map((slot) => slot.id)).toContain("opening");
    expect(slotsForPage("about").every((slot) => slot.page === "about")).toBe(true);
    expect(slotsForPage("reading").map((slot) => slot.id)).toEqual(["shelf"]);
    expect(slotsForPage("what-i-do").map((slot) => slot.id)).toEqual([
      "doing-engineer",
      "doing-creator",
      "doing-student",
    ]);
    expect(slotsForPage("who-i-am").map((slot) => slot.id)).toEqual([
      "being-drive",
      "being-cubes",
      "being-setup",
      "being-adventures",
      "being-tennis",
    ]);
  });

  it("rejects a slot that does not belong to the given page", () => {
    expect(isValidMediaPlacement("home", "opening")).toBe(true);
    expect(isValidMediaPlacement("about", "opening")).toBe(false);
    expect(isValidMediaPlacement("writing", "header")).toBe(false);
    expect(isValidMediaPlacement("contact", "contact")).toBe(true);
    expect(isValidMediaPlacement("what-i-do", "doing-engineer")).toBe(true);
    expect(isValidMediaPlacement("who-i-am", "being-setup")).toBe(true);
    expect(isValidMediaPlacement("who-i-am", "opening")).toBe(false);
    expect(isMediaSlot("opening")).toBe(true);
    expect(isMediaSlot("hero")).toBe(false);
  });

  it("filters photos by slot", () => {
    const photos = [
      samplePhoto({ id: "1", slot: "opening" }),
      samplePhoto({ id: "2", slot: "manifesto", page: "home" }),
    ];
    expect(photosForSlot(photos, "opening")).toHaveLength(1);
    expect(photosForSlot(photos, "route")).toEqual([]);
  });
});

describe("parseMediaPlacement", () => {
  it("accepts a matching page and slot", () => {
    expect(
      parseMediaPlacement(
        formDataFrom({
          page: "home",
          slot: "opening",
          alt: "Court",
          caption: "Dusk",
        }),
      ),
    ).toEqual({
      page: "home",
      slot: "opening",
      alt: "Court",
      caption: "Dusk",
    });
  });

  it("infers the page from a known slot when page is omitted", () => {
    expect(parseMediaPlacement(formDataFrom({ slot: "now-present" }))).toMatchObject({
      page: "now",
      slot: "now-present",
    });
  });

  it("rejects a page/slot mismatch by clearing both", () => {
    expect(
      parseMediaPlacement(
        formDataFrom({
          page: "about",
          slot: "opening",
        }),
      ),
    ).toEqual({
      page: null,
      slot: null,
      alt: "",
      caption: "",
    });
  });

  it("does not create an unplaced media record from empty placement fields", () => {
    expect(parseMediaPlacement(formDataFrom({ alt: "Unplaced" }))).toMatchObject({
      page: null,
      slot: null,
    });
  });

  it("truncates alt and caption", () => {
    const placement = parseMediaPlacement(
      formDataFrom({
        page: "contact",
        slot: "contact",
        alt: "a".repeat(240),
        caption: "b".repeat(300),
      }),
    );
    expect(placement.alt).toHaveLength(200);
    expect(placement.caption).toHaveLength(240);
  });
});

describe("placed photo mapping and queries", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    vi.mocked(createPublicClient).mockReset();
  });

  it("maps rows and drops unknown page or slot values", () => {
    vi.mocked(createPublicClient).mockReturnValue({
      storage: {
        from: () => ({
          getPublicUrl: (storagePath: string) => ({
            data: { publicUrl: `https://media.test/${storagePath}` },
          }),
        }),
      },
    } as never);

    const photo = toPlacedPhoto({
      id: "row-1",
      storage_path: "owner/file.jpg",
      page: "work",
      slot: "hero",
      alt: "Alt",
      caption: null,
      sort_order: 2,
      created_at: "2026-09-12T00:00:00.000Z",
    });

    expect(photo.page).toBeNull();
    expect(photo.slot).toBeNull();
    expect(photo.url).toBe("https://media.test/owner/file.jpg");
    expect(photo.caption).toBe("");
    expect(photo.sortOrder).toBe(2);
  });

  it("returns an empty library when Supabase is not configured", async () => {
    await expect(getPlacedPhotos("home")).resolves.toEqual([]);
    expect(createPublicClient).not.toHaveBeenCalled();
  });

  it("returns an empty library when the mocked media table is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test_not_a_secret");
    vi.mocked(createPublicClient).mockReturnValue({
      from: () => ({
        select: () => ({
          eq: () => ({
            not: () => ({
              order: () => ({
                order: async () => ({ data: null, error: { message: "relation media_assets does not exist" } }),
              }),
            }),
          }),
        }),
      }),
    } as never);

    await expect(getPlacedPhotos("home")).resolves.toEqual([]);
  });
});
