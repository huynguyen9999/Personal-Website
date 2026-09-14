"use client";

import { useMemo, useState } from "react";

import { hobbyCoverImage, hobbyIcon } from "@/lib/hobby-selector";
import type { HobbyCategory, HobbyId } from "@/lib/hobbies";
import { cn } from "@/lib/utils";
import InteractiveSelector from "@/components/ui/interactive-selector";
import styles from "./hobbies-interactive.module.css";

export type { HobbyCategory, HobbyId };

function formatPosition(position: number, total: number) {
  return `${String(position).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
}

function initialCategoryIndex(categories: HobbyCategory[], initialCategory?: HobbyId) {
  const requestedIndex = categories.findIndex((category) => category.id === initialCategory);
  if (requestedIndex >= 0) return requestedIndex;

  const firstPublishedIndex = categories.findIndex((category) => category.photos.length > 0);
  return Math.max(firstPublishedIndex, 0);
}

export function HobbiesInteractive({
  categories,
  initialCategory,
}: {
  categories: HobbyCategory[];
  initialCategory?: HobbyId;
}) {
  const [categoryIndex, setCategoryIndex] = useState(() =>
    initialCategoryIndex(categories, initialCategory),
  );
  const [photoIndex, setPhotoIndex] = useState(0);

  const category = categories[categoryIndex] ?? categories[0];
  if (!category) return null;

  const photos = category.photos;
  const hasMultiplePhotos = photos.length > 1;
  const activePhoto = photos[photoIndex];

  const options = useMemo(
    () =>
      categories.map((item, index) => {
        const Icon = hobbyIcon(item.id);
        const image =
          index === categoryIndex
            ? hobbyCoverImage(item, photoIndex)
            : hobbyCoverImage(item, 0);

        return {
          id: item.id,
          title: item.label,
          image,
          icon: <Icon size={20} strokeWidth={2} aria-hidden />,
        };
      }),
    [categories, categoryIndex, photoIndex],
  );

  function chooseCategory(nextIndex: number) {
    const nextCategory = categories[nextIndex];
    if (!nextCategory) return;

    setCategoryIndex(nextIndex);
    setPhotoIndex(0);

    const url = new URL(window.location.href);
    url.searchParams.set("hobby", nextCategory.id);
    url.hash = "hobbies";
    window.history.replaceState(null, "", url);
  }

  function movePhoto(direction: -1 | 1) {
    if (!hasMultiplePhotos) return;
    setPhotoIndex((current) => (current + direction + photos.length) % photos.length);
  }

  return (
    <section id="hobbies" className={styles.section} aria-labelledby="hobbies-title">
      <p className={`section-index ${styles.index}`}>HOBBIES</p>
      <div className={styles.stage}>
        <header className={styles.header}>
          <h2 id="hobbies-title">Life beyond the screens.</h2>
        </header>

        <InteractiveSelector
          options={options}
          activeIndex={categoryIndex}
          onActiveIndexChange={chooseCategory}
          ariaLabel="Hobbies"
          className={styles.carousel}
        />

        <div
          id={`hobby-panel-${category.id}`}
          className={styles.meta}
          role="tabpanel"
          aria-labelledby={`hobby-tab-${category.id}`}
        >
          {activePhoto?.caption ? (
            <p className={styles.caption}>{activePhoto.caption}</p>
          ) : category.photos.length === 0 ? (
            <p className={styles.empty}>No photographs published yet for {category.label.toLowerCase()}.</p>
          ) : null}

          {hasMultiplePhotos ? (
            <div className={styles.controls}>
              <span>{formatPosition(photoIndex + 1, photos.length)}</span>
              <div className={styles.controlButtons}>
                <button type="button" onClick={() => movePhoto(-1)} aria-label="Previous photo">
                  ←
                </button>
                <button type="button" onClick={() => movePhoto(1)} aria-label="Next photo">
                  →
                </button>
              </div>
            </div>
          ) : null}

          {hasMultiplePhotos ? (
            <div className={styles.photoIndex} aria-label="Choose photo">
              {photos.map((photo, index) => (
                <button
                  key={photo.id}
                  type="button"
                  className={cn(index === photoIndex && styles.photoIndexActive)}
                  aria-label={`Go to photo ${index + 1}`}
                  aria-current={index === photoIndex ? "true" : undefined}
                  onClick={() => setPhotoIndex(index)}
                >
                  {String(index + 1).padStart(2, "0")}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
