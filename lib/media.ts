import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createPublicClient } from "@/lib/supabase/public";

export const MEDIA_BUCKET = "site-media";

export const mediaPages = [
  { id: "home", label: "Index (homepage)", href: "/" },
  { id: "about", label: "Story", href: "/about" },
  { id: "writing", label: "Writing", href: "/writing" },
  { id: "now", label: "Now", href: "/now" },
  { id: "contact", label: "Contact", href: "/contact" },
] as const;

export const mediaSlots = [
  { page: "home", id: "opening", label: "Opening / hero" },
  { page: "home", id: "manifesto", label: "Field note" },
  { page: "home", id: "thread-origin", label: "Trajectory · Ho Chi Minh City" },
  { page: "home", id: "thread-study", label: "Trajectory · UCSB" },
  { page: "home", id: "thread-practice", label: "Trajectory · tennis" },
  { page: "home", id: "thread-public", label: "Trajectory · writing and creating" },
  { page: "home", id: "route", label: "Continue band" },
  { page: "about", id: "header", label: "Story opening" },
  { page: "about", id: "moment-hcmc", label: "Ho Chi Minh City" },
  { page: "about", id: "moment-us", label: "United States" },
  { page: "about", id: "moment-ucsb", label: "UC Santa Barbara" },
  { page: "writing", id: "archive", label: "Writing archive" },
  { page: "now", id: "now-present", label: "Now page" },
  { page: "contact", id: "contact", label: "Contact page" },
] as const;

export type MediaPageId = (typeof mediaPages)[number]["id"];
export type MediaSlotId = (typeof mediaSlots)[number]["id"];

export type PlacedPhoto = {
  id: string;
  storagePath: string;
  url: string;
  page: MediaPageId | null;
  slot: MediaSlotId | null;
  alt: string;
  caption: string;
  sortOrder: number;
  createdAt: string;
};

const pageIds = new Set<string>(mediaPages.map((page) => page.id));
const slotIds = new Set<string>(mediaSlots.map((slot) => slot.id));

export function slotsForPage(page: string) {
  return mediaSlots.filter((slot) => slot.page === page);
}

export function isMediaPage(value: string): value is MediaPageId {
  return pageIds.has(value);
}

export function isMediaSlot(value: string): value is MediaSlotId {
  return slotIds.has(value);
}

export function photosForSlot(photos: PlacedPhoto[], slot: MediaSlotId) {
  return photos.filter((photo) => photo.slot === slot);
}

export const mediaSelect =
  "id,storage_path,page,slot,alt,caption,sort_order,created_at";

type MediaRow = {
  id: string;
  storage_path: string;
  page: string | null;
  slot: string | null;
  alt: string | null;
  caption: string | null;
  sort_order: number | null;
  created_at: string;
};

function publicUrlFor(storagePath: string) {
  const supabase = createPublicClient();
  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(storagePath).data.publicUrl;
}

export function toPlacedPhoto(row: MediaRow): PlacedPhoto {
  return {
    id: row.id,
    storagePath: row.storage_path,
    url: publicUrlFor(row.storage_path),
    page: row.page && isMediaPage(row.page) ? row.page : null,
    slot: row.slot && isMediaSlot(row.slot) ? row.slot : null,
    alt: row.alt || "",
    caption: row.caption || "",
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at,
  };
}

export async function getPlacedPhotos(page: MediaPageId) {
  if (!hasSupabaseConfig()) return [];

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("media_assets")
    .select(mediaSelect)
    .eq("page", page)
    .not("slot", "is", null)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Placed photos query failed", error?.message);
    return [];
  }

  return data.map(toPlacedPhoto);
}
