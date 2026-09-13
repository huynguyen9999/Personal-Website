"use client";

import { useEffect, useRef, useState } from "react";
import { formatPacificClock, PACIFIC_TIME_ZONE, pacificOffsetMs } from "@/lib/dates";

type PacificClockProps = {
  initialIso: string;
};

async function readServerTime() {
  const response = await fetch("/api/time", { cache: "no-store" });
  if (!response.ok) throw new Error("time unavailable");
  const payload = await response.json() as { iso?: string; timeZone?: string };
  if (typeof payload.iso !== "string" || Number.isNaN(new Date(payload.iso).getTime())) {
    throw new Error("time unavailable");
  }
  return payload.iso;
}

export function PacificClock({ initialIso }: PacificClockProps) {
  const offsetRef = useRef(pacificOffsetMs(initialIso));
  const [nowMs, setNowMs] = useState(() => new Date(initialIso).getTime());

  useEffect(() => {
    let cancelled = false;

    function tick() {
      setNowMs(Date.now() + offsetRef.current);
    }

    async function resync() {
      try {
        const iso = await readServerTime();
        if (cancelled) return;
        offsetRef.current = pacificOffsetMs(iso);
        tick();
      } catch {
        tick();
      }
    }

    tick();
    const pulse = window.setInterval(tick, 1000);
    const sync = window.setInterval(resync, 10 * 60 * 1000);
    const onVisible = () => {
      if (document.visibilityState === "visible") void resync();
    };
    document.addEventListener("visibilitychange", onVisible);
    void resync();

    return () => {
      cancelled = true;
      window.clearInterval(pulse);
      window.clearInterval(sync);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [initialIso]);

  const clock = formatPacificClock(new Date(nowMs));

  return (
    <p className="present-clock">
      <time
        dateTime={clock.iso}
        aria-label={`Santa Barbara time, ${clock.date}, ${clock.time} ${clock.zone}, ${PACIFIC_TIME_ZONE.replace("_", " ")}`}
      >
        {clock.date}
        <span aria-hidden="true"> · </span>
        <span className="present-clock__time">{clock.time}</span>
        {" "}
        <span className="present-clock__zone">{clock.zone}</span>
      </time>
    </p>
  );
}
