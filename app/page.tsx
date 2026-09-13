import { getPublishedSection } from "@/lib/content";
import { getPlacedPhotos, photosForSlot } from "@/lib/media";
import { HomeNarrative } from "@/components/home-narrative";
import { PlacedPhotos } from "@/components/placed-photos";
import { SiteFooter } from "@/components/site-footer";

export default async function HomePage() {
  const opening = await getPublishedSection("home-opening");
  const photos = await getPlacedPhotos("home");
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

      <HomeNarrative />

      <SiteFooter />
    </>
  );
}
