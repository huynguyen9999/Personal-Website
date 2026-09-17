"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export type Testimonial = {
  id: string;
  quote: string;
  author: string;
  role: string;
  sourceUrl?: string;
};

export function Testimonials({ testimonials }: { testimonials: readonly Testimonial[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const timerRef = useRef<number | null>(null);
  const active = testimonials[activeIndex] || testimonials[0];

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  if (!active) return null;

  function select(index: number) {
    if (index === activeIndex || isAnimating) return;
    setIsAnimating(true);
    timerRef.current = window.setTimeout(() => {
      setActiveIndex(index);
      setIsAnimating(false);
    }, 220);
  }

  return (
    <div className="testimonial-selector">
      <div className="testimonial-selector__quote" aria-live="polite">
        <span aria-hidden="true">“</span>
        <blockquote className={cn(isAnimating && "testimonial-selector__quote--changing")}>{active.quote}</blockquote>
      </div>
      <div className={cn("testimonial-selector__attribution", isAnimating && "testimonial-selector__attribution--changing")}>
        <p>{active.role}</p>
        {active.sourceUrl ? <a href={active.sourceUrl} target="_blank" rel="noreferrer">View recommendation ↗</a> : null}
      </div>
      <div className="testimonial-selector__people" aria-label="Select a testimonial">
        {testimonials.map((testimonial, index) => {
          const isActive = index === activeIndex;
          const initials = testimonial.author.split(" ").map((part) => part[0]).join("");
          return (
            <button
              key={testimonial.id}
              type="button"
              className={cn("testimonial-selector__person", isActive && "testimonial-selector__person--active")}
              aria-pressed={isActive}
              onClick={() => select(index)}
            >
              <span aria-hidden="true">{initials}</span>
              <strong>{testimonial.author}</strong>
            </button>
          );
        })}
      </div>
    </div>
  );
}
