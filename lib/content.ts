import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createPublicClient } from "@/lib/supabase/public";

export type EditableSection = {
  slug: "home-opening" | "home-now-teaser" | "home-manifesto" | "about-opening" | "now-current" | "contact-opening";
  label: string;
  eyebrow: string;
  title: string;
  accentTitle?: string;
  summary: string;
  body: string;
  updatedAt?: string;
};

export const editableSections: EditableSection[] = [
  {
    slug: "home-opening",
    label: "Homepage opening",
    eyebrow: "HO CHI MINH CITY → CALIFORNIA",
    title: "A life in progress,",
    accentTitle: "measured in circuits and baselines.",
    summary: "Electrical engineering at UC Santa Barbara. Collegiate tennis. Writing, making, and sharing what I learn.",
    body: "",
  },
  {
    slug: "home-now-teaser",
    label: "Homepage Now teaser",
    eyebrow: "NOW / SNAPSHOT",
    title: "A short signal from the present.",
    summary: "",
    body: "Studying electrical engineering, competing in collegiate tennis, and building this archive one honest entry at a time.",
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
  {
    slug: "now-current",
    label: "Now page",
    eyebrow: "NOW / PRESENT TENSE",
    title: "In motion, not a summary.",
    summary: "",
    body: "Electrical engineering at UC Santa Barbara. Collegiate tennis. Making and sharing work in public. This archive is being assembled.",
  },
  {
    slug: "contact-opening",
    label: "Contact page",
    eyebrow: "CONTACT",
    title: "Direct, when you want to reach me.",
    summary: "",
    body: "GitHub is public. Email is the direct line; other channels will appear here when they are meant to be public.",
  },
];

export function getFallbackSection(slug: EditableSection["slug"]) {
  return editableSections.find((section) => section.slug === slug)!;
}

export async function getPublishedSection(slug: EditableSection["slug"]) {
  const [section] = await getPublishedSections([slug]);
  return section;
}

export async function getPublishedSections(slugs: EditableSection["slug"][]) {
  const fallbacks = slugs.map(getFallbackSection);
  if (!hasSupabaseConfig()) return fallbacks;

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("content_items")
    .select("slug,title,summary,body,updated_at")
    .eq("kind", "page")
    .eq("status", "published")
    .in("slug", slugs);

  if (error || !data) {
    console.error("Published content query failed", error?.message);
    return fallbacks;
  }

  return fallbacks.map((fallback) => {
    const record = data.find((item) => item.slug === fallback.slug);
    if (!record) return fallback;
    const body = record.body && typeof record.body === "object" ? record.body as Record<string, unknown> : {};

    return {
      ...fallback,
      eyebrow: typeof body.eyebrow === "string" ? body.eyebrow : fallback.eyebrow,
      title: record.title || fallback.title,
      accentTitle: typeof body.accentTitle === "string" ? body.accentTitle : fallback.accentTitle,
      summary: record.summary || "",
      body: typeof body.copy === "string" ? body.copy : "",
      updatedAt: typeof record.updated_at === "string" ? record.updated_at : fallback.updatedAt,
    };
  });
}
