"use client";

import Image from "next/image";
import { useState } from "react";
import type { PlacedPhoto } from "@/lib/media";
import styles from "./hobby-carousel.module.css";

export type HobbyId =
  | "adventures"
  | "machines"
  | "rubiks-cubes"
  | "work-setup"
  | "tennis";

export type HobbyCategory = {
  id: HobbyId;
  label: string;
  description: string;
  photos: PlacedPhoto[];
};

function formatPosition(position: number, total: number) {
  return `${String(position).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
}

export function HobbyCarousel({
  categories,
  initialCategory,
}: {
  categories: HobbyCategory[];
  initialCategory?: HobbyId;
}) {
  const [categoryIndex, setCategoryIndex] = useState(() => {
    const requestedIndex = categories.findIndex((category) => category.id === initialCategory);
    if (requestedIndex >= 0) return requestedIndex;

    const firstPublishedIndex = categories.findIndex((category) => category.photos.length > 0);
    return Math.max(firstPublishedIndex, 0);
  });
  const [photoIndex, setPhotoIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const category = categories[categoryIndex] ?? categories[0];

  if (!category) return null;

  const photos = category.photos;
  const activePhoto = photos[photoIndex];
  const hasMultiplePhotos = photos.length > 1;

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

  function moveCategory(nextIndex: number) {
    const wrappedIndex = (nextIndex + categories.length) % categories.length;
    chooseCategory(wrappedIndex);
    document.getElementById(`hobby-tab-${categories[wrappedIndex]?.id}`)?.focus();
  }

  function movePhoto(direction: -1 | 1) {
    if (!hasMultiplePhotos) return;
    setPhotoIndex((current) => (current + direction + photos.length) % photos.length);
  }

  return (
    <section id="hobbies" className={styles.section} aria-labelledby="hobbies-title">
      <header className={styles.header}>
        <h2 id="hobbies-title">Hobbies.</h2>
        <p>A few interests outside school and work.</p>
      </header>

      <div className={styles.tabs} role="tablist" aria-label="Hobbies">
        {categories.map((item, index) => {
          const selected = index === categoryIndex;

          return (
            <button
              key={item.id}
              id={`hobby-tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls="hobby-panel"
              tabIndex={selected ? 0 : -1}
              onClick={() => chooseCategory(index)}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight") {
                  event.preventDefault();
                  moveCategory(index + 1);
                } else if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  moveCategory(index - 1);
                } else if (event.key === "Home") {
                  event.preventDefault();
                  moveCategory(0);
                } else if (event.key === "End") {
                  event.preventDefault();
                  moveCategory(categories.length - 1);
                }
              }}
            >
              <span>{item.label}</span>
              {item.photos.length > 0 ? (
                <small aria-label={`${item.photos.length} published ${item.photos.length === 1 ? "photo" : "photos"}`}>
                  {String(item.photos.length).padStart(2, "0")}
                </small>
              ) : null}
            </button>
          );
        })}
      </div>

      <div
        id="hobby-panel"
        className={styles.panel}
        role="tabpanel"
        aria-labelledby={`hobby-tab-${category.id}`}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") movePhoto(-1);
          if (event.key === "ArrowRight") movePhoto(1);
        }}
        onTouchStart={(event) => setTouchStart(event.changedTouches[0]?.clientX ?? null)}
        onTouchEnd={(event) => {
          if (touchStart === null) return;
          const distance = (event.changedTouches[0]?.clientX ?? touchStart) - touchStart;
          if (Math.abs(distance) > 48) movePhoto(distance > 0 ? -1 : 1);
          setTouchStart(null);
        }}
      >
        {activePhoto ? (
          <div className={styles.photoEssay} key={`${category.id}-${activePhoto.id}`}>
            <figure className={styles.figure}>
              <div className={styles.media}>
                <Image
                  src={activePhoto.url}
                  alt={activePhoto.alt || activePhoto.caption || `${category.label} photograph`}
                  fill
                  priority={photoIndex === 0}
                  sizes="(max-width: 760px) 100vw, 68vw"
                />
              </div>
              {activePhoto.caption ? <figcaption>{activePhoto.caption}</figcaption> : null}
            </figure>

            <aside className={styles.details} aria-live="polite">
              <div>
                <p className={styles.categoryName}>{category.label}</p>
                <p className={styles.description}>{category.description}</p>
              </div>

              {hasMultiplePhotos ? (
                <div className={styles.controls}>
                  <span>{formatPosition(photoIndex + 1, photos.length)}</span>
                  <div>
                    <button type="button" onClick={() => movePhoto(-1)} aria-label="Previous photo">
                      <span aria-hidden="true">←</span>
                    </button>
                    <button type="button" onClick={() => movePhoto(1)} aria-label="Next photo">
                      <span aria-hidden="true">→</span>
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
                      aria-label={`Go to photo ${index + 1}`}
                      aria-current={index === photoIndex ? "true" : undefined}
                      onClick={() => setPhotoIndex(index)}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </button>
                  ))}
                </div>
              ) : null}
            </aside>
          </div>
        ) : (
          <div className={styles.emptyState} aria-live="polite">
            <p className={styles.categoryName}>{category.label}</p>
            <p>{category.description}</p>
            <small>No photographs published yet.</small>
          </div>
        )}
      </div>
    </section>
  );
}
