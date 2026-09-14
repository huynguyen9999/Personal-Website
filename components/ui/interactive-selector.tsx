"use client";

import { useEffect, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import styles from "./interactive-selector.module.css";

export type InteractiveSelectorOption = {
  id: string;
  title: string;
  image: string;
  icon: ReactNode;
};

export interface InteractiveSelectorProps {
  options: InteractiveSelectorOption[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  className?: string;
  frameClassName?: string;
  ariaLabel?: string;
}

export default function InteractiveSelector({
  options,
  activeIndex,
  onActiveIndexChange,
  className,
  frameClassName,
  ariaLabel = "Choose a category",
}: InteractiveSelectorProps) {
  const [revealed, setRevealed] = useState<number[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRevealed(options.map((_, index) => index));
      return;
    }

    const timers = options.map((_, index) =>
      window.setTimeout(() => {
        setRevealed((current) => (current.includes(index) ? current : [...current, index]));
      }, 160 * index),
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [options]);

  return (
    <div className={cn(styles.root, className)}>
      <div className={cn(styles.options, frameClassName)} role="tablist" aria-label={ariaLabel}>
        {options.map((option, index) => {
          const active = index === activeIndex;
          const visible = revealed.includes(index);
          const tabId = `hobby-tab-${option.id}`;
          const panelId = `hobby-panel-${option.id}`;

          return (
            <button
              key={option.id}
              type="button"
              id={tabId}
              role="tab"
              aria-selected={active}
              aria-controls={panelId}
              tabIndex={active ? 0 : -1}
              className={cn(
                styles.option,
                active ? styles.optionActive : styles.optionInactive,
                active ? styles.optionActiveBg : undefined,
                visible ? styles.optionVisible : styles.optionReveal,
              )}
              style={{ backgroundImage: `url("${option.image}")` }}
              onClick={() => {
                if (index !== activeIndex) onActiveIndexChange(index);
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight") {
                  event.preventDefault();
                  onActiveIndexChange((index + 1) % options.length);
                } else if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  onActiveIndexChange((index - 1 + options.length) % options.length);
                } else if (event.key === "Home") {
                  event.preventDefault();
                  onActiveIndexChange(0);
                } else if (event.key === "End") {
                  event.preventDefault();
                  onActiveIndexChange(options.length - 1);
                }
              }}
            >
              <span
                className={cn(styles.shadow, active ? styles.shadowActive : styles.shadowInactive)}
                aria-hidden="true"
              />
              <span className={styles.label}>
                <span className={styles.iconWrap} aria-hidden="true">
                  {option.icon}
                </span>
                <span className={styles.info}>
                  <span className={cn(styles.title, active ? styles.titleVisible : styles.titleHidden)}>
                    {option.title}
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
