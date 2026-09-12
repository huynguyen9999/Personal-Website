import type { Metadata } from "next";

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
  },
  {
    place: "United States",
    title: "A different environment",
    body: "I moved at approximately eleven. Weather, food, people, language, and community all felt different. The language barrier was significant; I was determined to learn English, adapt, and succeed.",
  },
  {
    place: "UC Santa Barbara",
    title: "The present coordinate",
    body: "Today, I study electrical engineering and compete in collegiate tennis. The fuller story—specific projects, matches, failures, and ambitions—will be written from real source material as this archive grows.",
  },
] as const;

export default function AboutPage() {
  return (
    <article className="story-page">
      <header className="story-header ruled-section">
        <p className="eyebrow">STORY / FIRST PASS</p>
        <h1>Some distances are measured in language, routines, and what you miss.</h1>
        <p>This is an outline built only from details already shared. It is intentionally incomplete.</p>
      </header>

      <div className="trajectory" aria-label="Personal trajectory">
        <div className="trajectory-line" aria-hidden="true" />
        {moments.map((moment, index) => (
          <section className="moment" key={moment.place}>
            <div className="moment-marker" aria-hidden="true"><span>{index + 1}</span></div>
            <p className="moment-place">{moment.place}</p>
            <h2>{moment.title}</h2>
            <p>{moment.body}</p>
          </section>
        ))}
      </div>

      <aside className="story-note">
        <p className="section-index">EDITORIAL NOTE</p>
        <p>The next version needs the owner’s own stories and language. No dramatic arc has been invented to fill the gaps.</p>
      </aside>
    </article>
  );
}
