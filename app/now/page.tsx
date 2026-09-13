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

function formatUpdated(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" }).format(date);
}

export default async function NowPage() {
  const [opening, present] = await Promise.all([
    getPublishedSection("now-current"),
    getPresentState(),
  ]);
  const photos = photosForSlot(await getPlacedPhotos("now"), "now-present");
  const updated = formatUpdated(opening.updatedAt);

  return (
    <>
      <article className="quiet-page now-page">
        <p className="eyebrow">{opening.eyebrow}</p>
        <h1>{opening.title}</h1>
        {updated ? (
          <p className="now-updated">Last updated {updated}</p>
        ) : (
          <p className="now-updated">Last updated when this page is published from the editor.</p>
        )}
        <p className="quiet-intro">{opening.body}</p>
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
