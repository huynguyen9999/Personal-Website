"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import homePortrait from "@/public/images/home/huy-at-dusk.jpg";

const PORTRAIT_SCROLL_FACTOR = 0.42;
const PORTRAIT_MAX_OFFSET = -240;

export function HomePortraitOpening() {
  const openingRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const opening = openingRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!opening || reducedMotion.matches) return;

    let animationFrame = 0;
    const updatePosition = () => {
      animationFrame = 0;
      const { top } = opening.getBoundingClientRect();
      const offset = Math.max(PORTRAIT_MAX_OFFSET, Math.min(0, top * PORTRAIT_SCROLL_FACTOR));
      opening.style.setProperty("--portrait-scroll-offset", `${offset}px`);
    };
    const onScroll = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(updatePosition);
    };

    updatePosition();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <section className="home-portrait-opening" ref={openingRef} aria-labelledby="home-portrait-title">
      <div className="home-portrait-opening__media">
        <Image
          src={homePortrait}
          alt="Huy Nguyen standing on a beach at dusk."
          fill
          priority
          sizes="100vw"
          className="home-portrait-opening__image"
        />
      </div>
      <div className="home-portrait-opening__wash" aria-hidden="true" />
      <h1 id="home-portrait-title">huy nguyen.</h1>
    </section>
  );
}
