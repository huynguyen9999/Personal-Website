import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedBooks, shelfFromSlug } from "@/lib/books";
import { getPlacedPhotos, photosForSlot } from "@/lib/media";
import { NameSay } from "@/components/name-say";
import { OriginMap } from "@/components/origin-map";
import { MotionSection } from "@/components/motion-section";
import { PlacedPhotos } from "@/components/placed-photos";
import { ReadingShelf } from "@/components/reading-shelf";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Who I am",
  description: "Huy Nguyen’s name, origin, reading shelf, and the objects around daily life.",
  alternates: { canonical: "/who-i-am" },
};

export default async function WhoIAmPage({
  searchParams,
}: {
  searchParams: Promise<{ shelf?: string }>;
}) {
  const { shelf } = await searchParams;
  const activeShelf = shelfFromSlug(shelf);
  const [books, photos] = await Promise.all([
    getPublishedBooks(),
    getPlacedPhotos("who-i-am"),
  ]);
  const drivePhotos = photosForSlot(photos, "being-drive");
  const setupPhotos = photosForSlot(photos, "being-setup");

  return (
    <>
      <article className="person-page">
        <header className="person-header ruled-section">
          <p className="eyebrow">WHO I AM</p>
          <h1>Huy Nguyen.</h1>
          <NameSay />
        </header>

        <MotionSection className="person-band" aria-labelledby="origin-title">
          <p className="section-index">ORIGIN</p>
          <div>
            <h2 id="origin-title">Two coordinates, one route.</h2>
            <p>Ho Chi Minh City to California. The map holds the present coordinate in Visalia, and an approximate reading of where you are.</p>
            <OriginMap />
          </div>
        </MotionSection>

        <MotionSection className="person-band" id="shelf" aria-labelledby="shelf-heading">
          <p className="section-index">READING</p>
          <div>
            <h2 id="shelf-heading">Book shelf.</h2>
            <p>
              What is open now, what has been finished, and what is waiting. The full shelf also lives at{" "}
              <Link className="text-link" href="/reading">Reading</Link>.
            </p>
          </div>
        </MotionSection>
        <ReadingShelf books={books} activeShelf={activeShelf} hrefBase="/who-i-am" />

        <MotionSection className="person-band" id="drive" aria-labelledby="drive-title">
          <p className="section-index">MACHINES</p>
          <div>
            <h2 id="drive-title">What I drive.</h2>
            <p>Cars and bikes belong to the curiosity thread. Specific vehicles will appear here when their photos are placed from the editor.</p>
            {drivePhotos.length > 0 ? (
              <PlacedPhotos photos={drivePhotos} layout="strip" />
            ) : (
              <p className="empty-copy">No vehicle has been published yet.</p>
            )}
          </div>
        </MotionSection>

        <MotionSection className="person-band" id="setup" aria-labelledby="setup-title">
          <p className="section-index">DESK</p>
          <div>
            <h2 id="setup-title">Work setup.</h2>
            <p>The desk, tools, and room will sit here as a quiet record—not a product roundup—once photographs are placed.</p>
            {setupPhotos.length > 0 ? (
              <PlacedPhotos photos={setupPhotos} layout="stack" />
            ) : (
              <p className="empty-copy">No work setup has been published yet.</p>
            )}
          </div>
        </MotionSection>
      </article>
      <SiteFooter />
    </>
  );
}
