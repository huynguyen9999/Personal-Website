export interface FAQItem {
  answer: string;
  question: string;
}

export const homeFaqSlugs = [
  "home-faq-english",
  "home-faq-siblings",
  "home-faq-free-time",
  "home-faq-ucsb",
  "home-faq-vietnam",
] as const;

export type HomeFaqSlug = (typeof homeFaqSlugs)[number];

export function isHomeFaqSlug(slug: string): slug is HomeFaqSlug {
  return (homeFaqSlugs as readonly string[]).includes(slug);
}

export function sectionsToFaqItems(
  sections: ReadonlyArray<{ title: string; body: string }>,
): FAQItem[] {
  return sections.map((section) => ({
    question: section.title,
    answer: section.body.trim(),
  }));
}
