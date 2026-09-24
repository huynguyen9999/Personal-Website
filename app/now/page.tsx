import type { Metadata } from "next";
import { getPublishedSection } from "@/lib/content";
import { getPresentState } from "@/lib/quarters";
import { getPlacedPhotos, photosForSlot } from "@/lib/media";
import { PlacedPhotos } from "@/components/placed-photos";
import { PresentSnapshot } from "@/components/present-snapshot";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Now",
  description: "What Huy Nguyen is studying, competing in, making, and assembling right now.",
  alternates: { canonical: "/now" },
};

export default async function NowPage() {
  const [opening, present] = await Promise.all([
    getPublishedSection("now-current"),
    getPresentState(),
  ]);
  const photos = photosForSlot(await getPlacedPhotos("now"), "now-present");

  return (
    <>
      <article className="quiet-page now-page">
        <header className="now-page__header">
          <p className="eyebrow">{opening.eyebrow}</p>
          <h1>{opening.title}</h1>
          <p className="quiet-intro">{opening.body}</p>
        </header>
        <PresentSnapshot
          quarters={present.quarters}
          currentSlug={present.currentSlug}
          serverNow={present.serverNow}
          embedded
        />
        <PlacedPhotos photos={photos} layout="stack" />
      </article>
      <SiteFooter />
    </>
  );
}
