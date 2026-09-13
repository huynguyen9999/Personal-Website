"use client";

import Image from "next/image";
import type { PlacedPhoto } from "@/lib/media";

type Layout = "hero" | "strip" | "figure" | "stack";

export function PlacedPhotos({
  photos,
  layout = "strip",
}: {
  photos: PlacedPhoto[];
  layout?: Layout;
}) {
  if (!photos.length) return null;

  return (
    <ul className={`placed-photos placed-photos--${layout}`}>
      {photos.map((photo) => (
        <li key={photo.id}>
          <figure>
            <Image
              src={photo.url}
              alt={photo.alt || photo.caption || "Photograph from the archive"}
              width={1600}
              height={1200}
              unoptimized
            />
            {photo.caption && <figcaption>{photo.caption}</figcaption>}
          </figure>
        </li>
      ))}
    </ul>
  );
}
