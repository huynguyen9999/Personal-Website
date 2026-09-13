import type { Metadata } from "next";
import { getPublishedSection } from "@/lib/content";
import { getPlacedPhotos, photosForSlot } from "@/lib/media";
import { PlacedPhotos } from "@/components/placed-photos";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Story",
  description: "A first, factual outline of a story from Ho Chi Minh City to California.",
  alternates: { canonical: "/about" },
};

const moments = [
  {
    place: "Ho Chi Minh City",
    title: "The remembered routine",
    body: "Neighborhood bike rides. Long school days and after-school lessons. Significant time on tennis courts. Dinner at a specific place after tennis with my father and sister.",
    slot: "moment-hcmc",
  },
  {
    place: "United States",
    title: "A different environment",
    body: "I moved at approximately eleven. Weather, food, people, language, and community all felt different. The language barrier was significant; I was determined to learn English, adapt, and succeed.",
    slot: "moment-us",
  },
  {
    place: "UC Santa Barbara",
    title: "The present coordinate",
    body: "Today, I study electrical engineering and compete in collegiate tennis. The fuller story—specific projects, matches, failures, and ambitions—will be written from real source material as this archive grows.",
    slot: "moment-ucsb",
  },
] as const;

export default async function AboutPage() {
  const opening = await getPublishedSection("about-opening");
  const photos = await getPlacedPhotos("about");

  return (
    <>
      <article className="story-page">
        <header className="story-header ruled-section">
          <p className="eyebrow">{opening.eyebrow}</p>
          <h1>{opening.title}</h1>
          <p>{opening.body}</p>
          <PlacedPhotos photos={photosForSlot(photos, "header")} layout="strip" />
        </header>

        <div className="trajectory" id="trajectory" aria-label="Personal trajectory">
          <div className="trajectory-line" aria-hidden="true" />
          {moments.map((moment, index) => (
            <Reveal key={moment.place} delayMs={index * 60}>
              <section className="moment">
                <div className="moment-marker" aria-hidden="true"><span>{index + 1}</span></div>
                <p className="moment-place">{moment.place}</p>
                <div>
                  <h2>{moment.title}</h2>
                  <p>{moment.body}</p>
                  <PlacedPhotos photos={photosForSlot(photos, moment.slot)} layout="figure" />
                </div>
              </section>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <aside className="story-note">
            <p className="section-index">EDITORIAL NOTE</p>
            <p>The next version needs the owner’s own stories and language. No dramatic arc has been invented to fill the gaps.</p>
          </aside>
        </Reveal>
      </article>
      <SiteFooter />
    </>
  );
}
