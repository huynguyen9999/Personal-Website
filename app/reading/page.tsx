import type { Metadata } from "next";
import { getPublishedBooks, shelfFromSlug } from "@/lib/books";
import { getPlacedPhotos, photosForSlot } from "@/lib/media";
import { PlacedPhotos } from "@/components/placed-photos";
import { ReadingShelf } from "@/components/reading-shelf";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Reading",
  description: "Huy Nguyen’s current reading, finished books, and what is next on the shelf.",
  alternates: { canonical: "/reading" },
};

export default async function ReadingPage({
  searchParams,
}: {
  searchParams: Promise<{ shelf?: string }>;
}) {
  const { shelf } = await searchParams;
  const activeShelf = shelfFromSlug(shelf);
  const [books, photos] = await Promise.all([
    getPublishedBooks(),
    getPlacedPhotos("reading"),
  ]);

  return (
    <>
      <header className="reading-header">
        <p className="eyebrow">READING / PERSONAL LIBRARY</p>
        <h1>My Shelf.</h1>
        <p>
          What I am reading now, what has stayed with me, and what I plan to open next.
          The notes are mine; book details lead outward to Goodreads.
        </p>
        <PlacedPhotos photos={photosForSlot(photos, "shelf")} layout="strip" />
      </header>
      <ReadingShelf books={books} activeShelf={activeShelf} />
      <SiteFooter />
    </>
  );
}
