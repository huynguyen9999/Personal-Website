"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function InteractiveBookCover({
  title,
  coverUrl,
  coverAlt,
}: {
  title: string;
  coverUrl: string;
  coverAlt: string;
}) {
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    const precise = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setInteractive(precise.matches && !reduced.matches);
    sync();
    precise.addEventListener("change", sync);
    reduced.addEventListener("change", sync);
    return () => {
      precise.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
    };
  }, []);

  if (!coverUrl) {
    return (
      <div className="book-cover book-cover--missing" aria-label={`No cover uploaded for ${title}`}>
        <span>{title}</span>
      </div>
    );
  }

  if (!interactive) {
    return (
      <div className="book-cover">
        <Image
          src={coverUrl}
          alt={coverAlt || `Cover of ${title}`}
          fill
          sizes="(max-width: 640px) 82vw, (max-width: 1024px) 42vw, 23vw"
        />
      </div>
    );
  }

  return (
    <div className="book-preview">
      <div
        className="book-prism"
        tabIndex={0}
        role="img"
        aria-label={`Interactive cover of ${title}`}
      >
        <span className="book-prism__back" aria-hidden="true" />
        <span className="book-prism__pages" aria-hidden="true" />
        <span className="book-prism__spine" aria-hidden="true" />
        <span className="book-prism__front">
          <Image
            src={coverUrl}
            alt={coverAlt || `Cover of ${title}`}
            fill
            sizes="(max-width: 640px) 82vw, (max-width: 1024px) 42vw, 23vw"
          />
        </span>
      </div>
      <span className="book-preview__hint">Interactive cover</span>
    </div>
  );
}
