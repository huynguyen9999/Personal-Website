import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type EditableSection = {
  slug: "home-opening" | "home-manifesto" | "about-opening";
  label: string;
  eyebrow: string;
  title: string;
  summary: string;
  body: string;
};

export const editableSections: EditableSection[] = [
  {
    slug: "home-opening",
    label: "Homepage opening",
    eyebrow: "HO CHI MINH CITY → CALIFORNIA",
    title: "A life in progress,|measured in circuits and baselines.",
    summary: "Electrical engineering at UC Santa Barbara. Collegiate tennis. Writing, making, and sharing what I learn.",
    body: "",
  },
  {
    slug: "home-manifesto",
    label: "Homepage field note",
    eyebrow: "FIELD NOTE / 01",
    title: "I’ve always wanted to see what happens behind the scenes.",
    summary: "",
    body: "As a child, that meant cars, multiplayer games, the internet, and the impulse to break—or “hack”—a system just to understand it. Electrical engineering gave that curiosity a place to become practice.",
  },
  {
    slug: "about-opening",
    label: "Story opening",
    eyebrow: "STORY / FIRST PASS",
    title: "Some distances are measured in language, routines, and what you miss.",
    summary: "",
    body: "This is an outline built only from details already shared. It is intentionally incomplete.",
  },
];

export function getFallbackSection(slug: EditableSection["slug"]) {
  return editableSections.find((section) => section.slug === slug)!;
}

export async function getPublishedSection(slug: EditableSection["slug"]) {
  const fallback = getFallbackSection(slug);
  if (!hasSupabaseConfig()) return fallback;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_items")
    .select("slug,title,summary,body")
    .eq("kind", "page")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) return fallback;
  const body = data.body && typeof data.body === "object" ? data.body as Record<string, unknown> : {};

  return {
    ...fallback,
    eyebrow: typeof body.eyebrow === "string" ? body.eyebrow : fallback.eyebrow,
    title: data.title || fallback.title,
    summary: data.summary || "",
    body: typeof body.copy === "string" ? body.copy : "",
  };
}
