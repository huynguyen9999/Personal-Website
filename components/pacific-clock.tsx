"use client";

import { useEffect, useState } from "react";
import { formatPacificClock, PACIFIC_TIME_ZONE } from "@/lib/dates";

type PacificClockProps = {
  initialIso: string;
};

export function PacificClock({ initialIso }: PacificClockProps) {
  const [nowMs, setNowMs] = useState(() => new Date(initialIso).getTime());

  useEffect(() => {
    function tick() {
      setNowMs(Date.now());
    }

    const pulse = window.setInterval(tick, 1000);

    return () => {
      window.clearInterval(pulse);
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
