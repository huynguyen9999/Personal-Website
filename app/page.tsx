import Link from "next/link";
import { getPublishedSections } from "@/lib/content";
import { getPresentState } from "@/lib/quarters";
import { getPlacedPhotos, photosForSlot } from "@/lib/media";
import { IdentityMap } from "@/components/identity-map";
import { PlacedPhotos } from "@/components/placed-photos";
import { PresentSnapshot } from "@/components/present-snapshot";
import { Reveal } from "@/components/reveal";
import { HomeFaqSection } from "@/components/home-faq-section";
import { HomePortraitOpening } from "@/components/home-portrait-opening";
import { SiteFooter } from "@/components/site-footer";
import { homeFaqSlugs, sectionsToFaqItems } from "@/lib/faq";

export default async function HomePage() {
  const [opening, proof, manifesto, now, ...faqSections] = await getPublishedSections([
    "home-opening",
    "home-proof",
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
      <HomePortraitOpening />

      <Reveal>
        <section className="current-focus ruled-section" aria-labelledby="current-focus-title">
          <p className="section-index">{proof.eyebrow}</p>
          <div>
            <h2 id="current-focus-title">{proof.title}</h2>
            <p>{proof.body}</p>
            <Link className="text-link" href="/what-i-do">
              What I do
            </Link>
          </div>
        </section>
      </Reveal>

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
        <section className="route-section ruled-section" aria-labelledby="route-title">
          <p className="section-index">CONTINUE</p>
          <div>
            <h2 id="route-title">Keep following the thread.</h2>
            <p>Learn the story, see what I do, or start a conversation.</p>
            <div className="continue-links">
              <Link className="text-link" href="/about">
                Story
              </Link>
              <Link className="text-link" href="/what-i-do">
                What I do
              </Link>
              <Link className="text-link" href="/contact">
                Contact
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
