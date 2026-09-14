"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
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
  const [source, setSource] = useState<"ip" | "device">("ip");
  const [locating, setLocating] = useState(false);
  const [frame, setFrame] = useState<OriginFrame>("near");
  const miles = useMemo(() => (visitor ? haversineMiles(HOME, visitor) : null), [visitor]);
  const wider = frame === "region";
  const widerLabel = miles != null && miles >= GLOBE_MILES ? "See the world" : "See the region";
  const [canUseDevice, setCanUseDevice] = useState(false);
  const sourceRef = useRef(source);
  sourceRef.current = source;

  useEffect(() => {
    setCanUseDevice(Boolean(navigator.geolocation));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/geo", { cache: "no-store", signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        const next = visitorFromPayload(payload);
        if (next && sourceRef.current !== "device") {
          setVisitor(next);
          setSource("ip");
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  function useDeviceLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = visitorFromPayload({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          city: "You",
        });
        if (next) {
          setVisitor(next);
          setSource("device");
        }
        setLocating(false);
      },
      () => {
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  }

  return (
    <figure className="origin-map">
      <OriginGlobe visitor={visitor} frame={frame} />
      <div className="origin-map__controls">
        <button
          type="button"
          className="origin-map__toggle"
          aria-pressed={wider}
          onClick={() => setFrame(wider ? "near" : "region")}
        >
          {wider ? "Closer view" : widerLabel}
        </button>
        {canUseDevice ? (
          <button
            type="button"
            className="origin-map__toggle"
            onClick={useDeviceLocation}
            disabled={locating || source === "device"}
          >
            {source === "device" ? "Using this device" : locating ? "Locating…" : "Use a precise location"}
          </button>
        ) : null}
      </div>
      <figcaption>{visitorDistanceCopy(miles, source)}</figcaption>
    </figure>
  );
}
