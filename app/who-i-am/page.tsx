import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedBooks, shelfFromSlug } from "@/lib/books";
import { machinePhotoArchive } from "@/lib/hobby-photos";
import { getPlacedPhotos, photosForSlot } from "@/lib/media";
import { NameSay } from "@/components/name-say";
import { OriginMap } from "@/components/origin-map";
import { MotionSection } from "@/components/motion-section";
import { HobbyCarousel, type HobbyCategory, type HobbyId } from "@/components/hobby-carousel";
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
  searchParams: Promise<{ shelf?: string; hobby?: string }>;
}) {
  const { shelf, hobby } = await searchParams;
  const activeShelf = shelfFromSlug(shelf);
  const [books, photos] = await Promise.all([
    getPublishedBooks(),
    getPlacedPhotos("who-i-am"),
  ]);
  const drivePhotos = photosForSlot(photos, "being-drive");
  const setupPhotos = photosForSlot(photos, "being-setup");
  const hobbies: HobbyCategory[] = [
    { id: "adventures", label: "Adventures", description: "Places I have explored, close to home and farther away.", photos: [] },
    { id: "machines", label: "Machines", description: "Cars and bikes, and the engineering decisions behind them.", photos: [...machinePhotoArchive, ...drivePhotos] },
    { id: "rubiks-cubes", label: "Rubik’s cubes", description: "A puzzle I return to for pattern, speed, and repetition.", photos: [] },
    { id: "work-setup", label: "Work setup", description: "The desk and tools I use to study and make things.", photos: setupPhotos },
    { id: "tennis", label: "Tennis", description: "The practice I carried into collegiate competition at UC Santa Barbara.", photos: [] },
  ];
  const initialHobby = hobbies.some((category) => category.id === hobby) ? hobby as HobbyId : undefined;

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
            <p>Ho Chi Minh City to California. The map holds Visalia, and an estimate of where you are now. Network location can be a distant metro; you can refine it with this device or a city/postal code.</p>
            <OriginMap />
          </div>
        </MotionSection>

        <HobbyCarousel categories={hobbies} initialCategory={initialHobby} />

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
      </article>
      <SiteFooter />
    </>
  );
}
