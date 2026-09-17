"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

export function Reveal({
  children,
  delayMs = 0,
}: {
  children: ReactNode;
  delayMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    let observer: IntersectionObserver | null = null;
    const show = () => {
      setVisible(true);
      observer?.disconnect();
    };
    const isNearViewport = () => node.getBoundingClientRect().top < window.innerHeight * 0.92;

    if (isNearViewport()) {
      const outer = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(show);
      });
      return () => window.cancelAnimationFrame(outer);
    }

    const revealOnViewportChange = () => {
      if (isNearViewport()) show();
    };

    observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        show();
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);
    // IntersectionObserver is the primary path. The scroll check is a small
    // native fallback for embedded/local browser contexts where it can miss a callback.
    window.addEventListener("scroll", revealOnViewportChange, { passive: true });
    window.addEventListener("resize", revealOnViewportChange);

    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", revealOnViewportChange);
      window.removeEventListener("resize", revealOnViewportChange);
    };
  }, []);

  const style: CSSProperties | undefined = delayMs ? { transitionDelay: `${delayMs}ms` } : undefined;

  return (
    <div ref={ref} className="reveal" data-visible={visible ? "true" : "false"} style={style}>
      {children}
    </div>
  );
}
