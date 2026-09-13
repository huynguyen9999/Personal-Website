import type { Metadata } from "next";
import { getPublishedSection } from "@/lib/content";
import { getPlacedPhotos, photosForSlot } from "@/lib/media";
import { PlacedPhotos } from "@/components/placed-photos";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Contact",
  description: "How to reach Huy Nguyen.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const opening = await getPublishedSection("contact-opening");
  const photos = photosForSlot(await getPlacedPhotos("contact"), "contact");

  return (
    <>
      <article className="quiet-page contact-page">
        <p className="eyebrow">{opening.eyebrow}</p>
        <h1>{opening.title}</h1>
        <p className="quiet-intro">{opening.body}</p>
        <PlacedPhotos photos={photos} layout="figure" />
        <p className="contact-channels">
          <a href="mailto:dominichuyn@gmail.com">dominichuyn@gmail.com</a>
          <a href="https://github.com/huynguyen9999" target="_blank" rel="noreferrer">
            GitHub <span aria-hidden="true">↗</span>
          </a>
        </p>
      </article>
      <SiteFooter />
    </>
  );
}
