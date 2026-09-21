"use client";

import Link from "next/link";
import { useRef, useState, type KeyboardEvent } from "react";
import { PacificClock } from "@/components/pacific-clock";
import { quarterFields, type QuarterLog } from "@/lib/quarters";

type PresentSnapshotProps = {
  quarters: QuarterLog[];
  currentSlug: string;
  serverNow: string;
  eyebrow?: string;
  title?: string;
  embedded?: boolean;
};

export function PresentSnapshot({
  quarters,
  currentSlug,
  serverNow,
  eyebrow = "NOW / SNAPSHOT",
  title = "A short signal from the present.",
  embedded = false,
}: PresentSnapshotProps) {
  const currentIndex = quarters.findIndex((quarter) => quarter.slug === currentSlug);
  const initialIndex = currentIndex >= 0 ? currentIndex : Math.max(quarters.length - 1, 0);
  const [index, setIndex] = useState(initialIndex);
  const [active, setActive] = useState<string | null>(null);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const listRef = useRef<HTMLUListElement>(null);

  if (quarters.length === 0) return null;

  const selected = quarters[Math.min(index, quarters.length - 1)] ?? quarters[initialIndex];
  const isCurrent = selected.slug === currentSlug;

  function selectQuarter(nextIndex: number) {
    setIndex(nextIndex);
    setActive(null);
  }

  function moveFocus(event: KeyboardEvent<HTMLButtonElement>, channelIndex: number) {
    let nextIndex: number | undefined;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (channelIndex + 1) % quarterFields.length;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (channelIndex - 1 + quarterFields.length) % quarterFields.length;
    }
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = quarterFields.length - 1;
    if (event.key === "Escape") setActive(null);
    if (nextIndex !== undefined) {
      event.preventDefault();
      buttonRefs.current[nextIndex]?.focus();
    }
  }

  const log = (
    <>
      <p className="present-dispatch">
        {selected.label}
        {isCurrent ? <span> · now</span> : null}
      </p>
      <PacificClock initialIso={serverNow} />
      {quarters.length > 1 && (
        <div className="present-rail">
          <label className="present-slider-label" htmlFor="present-quarter-slider">
            Memory log
          </label>
          <input
            id="present-quarter-slider"
            className="present-slider"
            type="range"
            min={0}
            max={quarters.length - 1}
            step={1}
            value={Math.min(index, quarters.length - 1)}
            aria-valuetext={selected.label}
            onChange={(event) => selectQuarter(Number(event.target.value))}
          />
          <div className="present-ticks" role="group" aria-label="Published quarters">
            {quarters.map((quarter, tickIndex) => (
              <button
                key={quarter.slug}
                className="present-tick"
                type="button"
                aria-current={quarter.slug === selected.slug ? "true" : undefined}
                aria-label={`${quarter.label}${quarter.slug === currentSlug ? ", current quarter" : ""}`}
                onClick={() => selectQuarter(tickIndex)}
              >
                {quarter.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <ul
        ref={listRef}
        className="present-channels"
        aria-label={`Signals for ${selected.label}`}
        onMouseLeave={() => {
          if (!listRef.current?.contains(document.activeElement)) setActive(null);
        }}
      >
        {quarterFields.map((field, channelIndex) => {
          const note = selected.notes[field.id].trim();
          const pressed = active === field.id;
          return (
            <li key={field.id}>
              <button
                ref={(element) => {
                  buttonRefs.current[channelIndex] = element;
                }}
                className="present-channel"
                type="button"
                aria-pressed={pressed}
                aria-label={note ? `${field.label}. ${note}` : `${field.label}. Not recorded.`}
                data-muted={active && !pressed ? "true" : "false"}
                onClick={() => setActive(field.id)}
                onFocus={() => setActive(field.id)}
                onMouseEnter={() => setActive(field.id)}
                onKeyDown={(event) => moveFocus(event, channelIndex)}
              >
                <span className="present-channel__label">{field.label}</span>
                <span className="present-channel__note" data-empty={note ? "false" : "true"}>
                  {note || "—"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );

  if (embedded) {
    return <div className="present-embedded">{log}</div>;
  }

  return (
    <section className="present-section ruled-section" aria-labelledby="present-title">
      <p className="section-index">{eyebrow}</p>
      <div>
        <h2 id="present-title">{title}</h2>
        {log}
        <Link className="text-link" href="/now">
          The present tense
        </Link>
      </div>
    </section>
  );
}
