import type { Metadata } from "next";
import { getPlacedPhotos, photosForSlot } from "@/lib/media";
import { PlacedPhotos } from "@/components/placed-photos";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Writing",
  description: "Writing and notes, ready for the first real piece.",
  alternates: { canonical: "/writing" },
};

export default async function WritingPage() {
  const photos = photosForSlot(await getPlacedPhotos("writing"), "archive");

  return (
    <>
      <section className="quiet-page">
        <p className="eyebrow">WRITING / ARCHIVE</p>
        <h1>The shelf is ready.<br />The writing is not invented.</h1>
        <p className="quiet-intro">This page will hold essays, technical explanations, observations, and honest changes of mind. It remains empty until there is real work in the owner’s voice.</p>
        <PlacedPhotos photos={photos} layout="stack" />
        <div className="empty-ledger" id="first-note" role="status">
          <span>000</span>
          <p>Published pieces</p>
          <small>Pieces appear here when they are written and published.</small>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
