import { isHomeFaqSlug, type HomeFaqSlug } from "@/lib/faq";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createPublicClient } from "@/lib/supabase/public";

export type EditableSection = {
  slug:
    | "home-opening"
    | "home-proof"
    | "home-now-teaser"
    | "home-manifesto"
    | HomeFaqSlug
    | "about-opening"
    | "now-current"
    | "contact-opening";
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
    slug: "home-proof",
    label: "Homepage current focus",
    eyebrow: "CURRENT FOCUS",
    title: "Electrical engineering at UC Santa Barbara.",
    summary: "",
    body: "Studying signals, hardware, and software by following a system closely enough to understand how its pieces hold together.",
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
    title: "I tend to start with the part that is hidden.",
    summary: "",
    body: "A car, a circuit, a game, or a piece of software: I want to know what makes it work before deciding what to make with it.",
  },
  {
    slug: "home-faq-english",
    label: "Home FAQ · English",
    eyebrow: "HOME / FAQ",
    title: "How did you learn English?",
    summary: "",
    body: "",
  },
  {
    slug: "home-faq-siblings",
    label: "Home FAQ · Siblings",
    eyebrow: "HOME / FAQ",
    title: "How many siblings do you have?",
    summary: "",
    body: "",
  },
  {
    slug: "home-faq-free-time",
    label: "Home FAQ · Free time",
    eyebrow: "HOME / FAQ",
    title: "How do you spend your free time?",
    summary: "",
    body: "",
  },
  {
    slug: "home-faq-ucsb",
    label: "Home FAQ · UCSB",
    eyebrow: "HOME / FAQ",
    title: "What's your favorite memory at UCSB?",
    summary: "",
    body: "",
  },
  {
    slug: "home-faq-vietnam",
    label: "Home FAQ · Vietnam",
    eyebrow: "HOME / FAQ",
    title: "What do you miss most in Vietnam?",
    summary: "",
    body: "",
  },
  {
    slug: "about-opening",
    label: "Story opening",
    eyebrow: "STORY / TWO COORDINATES",
    title: "Some distances are measured in language, routines, and what you miss.",
    summary: "",
    body: "The route begins in Ho Chi Minh City and continues in California. Tennis, engineering, and curiosity run through both places.",
  },
  {
    slug: "now-current",
    label: "Now page",
    eyebrow: "NOW / PRESENT TENSE",
    title: "In motion, not a summary.",
    summary: "",
    body: "Electrical engineering at UC Santa Barbara. Collegiate tennis. Making, reading, and sharing work in public.",
  },
  {
    slug: "contact-opening",
    label: "Contact page",
    eyebrow: "CONTACT",
    title: "let's get in touch.",
    summary: "",
    body: "",
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
      title: isHomeFaqSlug(fallback.slug) ? fallback.title : record.title || fallback.title,
      accentTitle: typeof body.accentTitle === "string" ? body.accentTitle : fallback.accentTitle,
      summary: record.summary || "",
      body: typeof body.copy === "string" ? body.copy : "",
      updatedAt: typeof record.updated_at === "string" ? record.updated_at : fallback.updatedAt,
    };
  });
}
