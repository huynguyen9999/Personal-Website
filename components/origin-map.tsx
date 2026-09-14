"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import {
  GLOBE_MILES,
  haversineMiles,
  HOME,
  visitorDistanceCopy,
  visitorFromPayload,
  type GeoPoint,
  type OriginFrame,
} from "@/lib/places";

const OriginGlobe = dynamic(
  () => import("@/components/origin-globe").then((module) => module.OriginGlobe),
  {
    ssr: false,
    loading: () => <div className="origin-map__globe" aria-hidden="true" />,
  },
);

export function OriginMap() {
  const [visitor, setVisitor] = useState<GeoPoint | null>(null);
  const [frame, setFrame] = useState<OriginFrame>("near");
  const miles = useMemo(() => (visitor ? haversineMiles(HOME, visitor) : null), [visitor]);
  const wider = frame === "region";
  const widerLabel = miles != null && miles >= GLOBE_MILES ? "See the world" : "See the region";

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/geo", { cache: "no-store", signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        const next = visitorFromPayload(payload);
        if (next) setVisitor(next);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  return (
    <figure className="origin-map">
      <OriginGlobe visitor={visitor} frame={frame} />
      <button
        type="button"
        className="origin-map__toggle"
        aria-pressed={wider}
        onClick={() => setFrame(wider ? "near" : "region")}
      >
        {wider ? "Closer view" : widerLabel}
      </button>
      <figcaption>{visitorDistanceCopy(miles)}</figcaption>
    </figure>
  );
}
