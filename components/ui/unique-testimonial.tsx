"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export type Testimonial = {
  id: string;
  quote: string;
  author: string;
  role: string;
  sourceUrl?: string;
  profileUrl?: string;
  avatarSrc?: string;
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
        <span className="testimonial-selector__quote-close" aria-hidden="true">”</span>
      </div>
      <div className={cn("testimonial-selector__attribution", isAnimating && "testimonial-selector__attribution--changing")}>
        <p>{active.role}</p>
        {active.sourceUrl ? <a href={active.sourceUrl} target="_blank" rel="noreferrer">View recommendation</a> : null}
      </div>
      <div className="testimonial-selector__people" aria-label="Select a recommendation">
        {testimonials.map((testimonial, index) => {
          const isActive = index === activeIndex;
          const initials = testimonial.author.split(" ").map((part) => part[0]).join("");
          return (
            <div key={testimonial.id} className={cn("testimonial-selector__person", isActive && "testimonial-selector__person--active")}>
              {testimonial.profileUrl ? (
                <a
                  className="testimonial-selector__avatar"
                  href={testimonial.profileUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${testimonial.author} on LinkedIn`}
                >
                  {testimonial.avatarSrc ? (
                    <Image src={testimonial.avatarSrc} alt="" width={40} height={40} />
                  ) : <span aria-hidden="true">{initials}</span>}
                </a>
              ) : <span className="testimonial-selector__avatar" aria-hidden="true">{initials}</span>}
              <button type="button" aria-pressed={isActive} onClick={() => select(index)}>
                <strong>{testimonial.author}</strong>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
