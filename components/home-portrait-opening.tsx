"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import mountainPortrait from "@/public/images/home/huy-in-the-mountains.jpg";

const PARALLAX_SETTINGS = {
  desktop: { imageTravel: -300, imageScale: 1.16, imageScaleAtExit: 1.04, titleTravel: -96 },
  compact: { imageTravel: -180, imageScale: 1.2, imageScaleAtExit: 1.06, titleTravel: -48 },
} as const;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

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
      const settings = window.innerWidth <= 980 ? PARALLAX_SETTINGS.compact : PARALLAX_SETTINGS.desktop;
      const scrollRange = Math.max(window.innerHeight, opening.offsetHeight * 0.85);
      const progress = clamp(-top / scrollRange, 0, 1);
      const imageOffset = settings.imageTravel * progress;
      const imageScale = settings.imageScale + (settings.imageScaleAtExit - settings.imageScale) * progress;

      opening.style.setProperty("--portrait-progress", progress.toFixed(3));
      opening.style.setProperty("--portrait-scroll-offset", `${imageOffset.toFixed(1)}px`);
      opening.style.setProperty("--portrait-title-offset", `${(settings.titleTravel * progress).toFixed(1)}px`);
      opening.style.setProperty("--portrait-image-scale", imageScale.toFixed(3));
      opening.style.setProperty("--portrait-wash-opacity", (0.9 + progress * 0.1).toFixed(3));
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
          src={mountainPortrait}
          alt="Huy Nguyen looking across a mountain landscape."
          fill
          priority
          sizes="100vw"
          className="home-portrait-opening__image"
        />
      </div>
      <div className="home-portrait-opening__wash" aria-hidden="true" />
      <h1 id="home-portrait-title"><span>HUY NGUYEN</span></h1>
    </section>
  );
}
