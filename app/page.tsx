import Link from "next/link";
import { getPublishedSections } from "@/lib/content";
import { getPresentState } from "@/lib/quarters";
import { getPlacedPhotos, photosForSlot } from "@/lib/media";
import { IdentityMap } from "@/components/identity-map";
import { PlacedPhotos } from "@/components/placed-photos";
import { PresentSnapshot } from "@/components/present-snapshot";
import { Reveal } from "@/components/reveal";
import { HomeFaqSection } from "@/components/home-faq-section";
import { SiteFooter } from "@/components/site-footer";
import { homeFaqSlugs, sectionsToFaqItems } from "@/lib/faq";

const threads = [
  ["01", "Engineering", "Systems, signals, hardware, software, and the questions behind an interface."],
  ["02", "Tennis", "Competition as a practice of observation, adjustment, and repetition."],
  ["03", "Reading", "A public shelf for books in progress, finished, and waiting next."],
  ["04", "Making", "Turning ideas and experiments into a durable archive with context."],
] as const;

const threadSlots = ["thread-origin", "thread-study", "thread-practice", "thread-public"] as const;

export default async function HomePage() {
  const [opening, manifesto, now, ...faqSections] = await getPublishedSections([
    "home-opening",
    "home-manifesto",
    "home-now-teaser",
    ...homeFaqSlugs,
  ]);
  const faqItems = sectionsToFaqItems(faqSections);
  const [photos, present] = await Promise.all([
    getPlacedPhotos("home"),
    getPresentState(),
  ]);
  const openingPhotos = photosForSlot(photos, "opening");

  return (
    <>
      <section className="opening ruled-section" aria-labelledby="opening-title">
        <p className="eyebrow">{opening.eyebrow}</p>
        <h1 id="opening-title">
          {opening.title}
          {opening.accentTitle && <span>{opening.accentTitle}</span>}
        </h1>
        <div className="opening-meta">
          <p>{opening.summary}</p>
          <p className="coordinate">34.4140° N<br />119.8489° W</p>
        </div>
        {openingPhotos.length > 0 ? (
          <div className="opening-media">
            <PlacedPhotos photos={openingPhotos} layout="hero" />
          </div>
        ) : (
          <div className="court-line" aria-hidden="true"><span /></div>
        )}
      </section>

      <Reveal>
        <PresentSnapshot
          eyebrow={now.eyebrow}
          title={now.title}
          quarters={present.quarters}
          currentSlug={present.currentSlug}
          serverNow={present.serverNow}
        />
      </Reveal>

      <Reveal>
        <IdentityMap />
      </Reveal>

      <Reveal>
        <section className="manifesto ruled-section" aria-labelledby="manifesto-title">
          <p className="section-index">{manifesto.eyebrow}</p>
          <div>
            <h2 id="manifesto-title">{manifesto.title}</h2>
            <p>{manifesto.body}</p>
            <PlacedPhotos photos={photosForSlot(photos, "manifesto")} layout="strip" />
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="threads" aria-labelledby="threads-title">
          <header className="section-heading">
            <p className="eyebrow">ONE TRAJECTORY</p>
            <h2 id="threads-title">Four practices.<br />One current rhythm.</h2>
          </header>
          <div className="thread-list">
            {threads.map(([number, title, copy], index) => (
              <article className="thread" key={number}>
                <p className="thread-number">{number}</p>
                <h3>{title}</h3>
                <p>{copy}</p>
                <PlacedPhotos photos={photosForSlot(photos, threadSlots[index])} layout="figure" />
              </article>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="route-section ruled-section" aria-labelledby="route-title">
          <p className="section-index">CONTINUE</p>
          <div>
            <h2 id="route-title">Two places, without reducing either to a chapter heading.</h2>
            <p>Story holds the biographical route. Reading holds the shelf. Now is the dated, changeable present.</p>
            <div className="continue-links">
              <Link className="text-link" href="/about">
                Story <span aria-hidden="true">↗</span>
              </Link>
              <Link className="text-link" href="/reading">
                Reading <span aria-hidden="true">↗</span>
              </Link>
              <Link className="text-link" href="/contact">
                Contact <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <PlacedPhotos photos={photosForSlot(photos, "route")} layout="strip" />
          </div>
        </section>
      </Reveal>

      <Reveal>
        <HomeFaqSection items={faqItems} />
      </Reveal>

      <SiteFooter />
    </>
  );
}
