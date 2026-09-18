"use client";

import { useEffect, useRef } from "react";
import { Map, Marker, NavigationControl, setWorkerUrl } from "maplibre-gl";
import type { GeoJSONSource } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  greatCircleCoordinates,
  HOME,
  originView,
  type GeoPoint,
  type OriginFrame,
} from "@/lib/places";

const LIGHT_STYLE = "https://tiles.openfreemap.org/styles/positron";
const DARK_STYLE = "https://tiles.openfreemap.org/styles/fiord";

export function OriginGlobe({ visitor, frame }: { visitor: GeoPoint | null; frame: OriginFrame }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const homeMarkerRef = useRef<Marker | null>(null);
  const visitorMarkerRef = useRef<Marker | null>(null);
  const visitorRef = useRef(visitor);
  const frameRef = useRef(frame);
  visitorRef.current = visitor;
  frameRef.current = frame;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    setWorkerUrl(new URL("/maplibre/maplibre-gl-worker.mjs", window.location.origin).href);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const map = new Map({
      container: host,
      style: styleForTheme(),
      center: [HOME.lon, HOME.lat],
      zoom: 3.6,
      attributionControl: { compact: true },
      cooperativeGestures: true,
      canvasContextAttributes: { antialias: true },
      fadeDuration: reduce ? 0 : 300,
    });
    mapRef.current = map;
    map.addControl(new NavigationControl({ showCompass: false }), "bottom-right");

    const onStyle = () => {
      if (!map.getSource("distance-arc")) {
        map.addSource("distance-arc", { type: "geojson", data: emptyLine() });
        map.addLayer({
          id: "distance-arc",
          type: "line",
          source: "distance-arc",
          paint: {
            "line-color": "#c47a2c",
            "line-width": 2.4,
            "line-dasharray": [1.6, 1.2],
          },
        });
      }
      homeMarkerRef.current?.remove();
      homeMarkerRef.current = new Marker({
        element: markerElement("home", HOME.label),
        anchor: "bottom",
      })
        .setLngLat([HOME.lon, HOME.lat])
        .addTo(map);
      paintVisitor(map, visitorRef.current, visitorMarkerRef);
      applyCamera(map, visitorRef.current, frameRef.current, reduce);
    };

    map.on("style.load", onStyle);

    const themeObserver = new MutationObserver(() => {
      map.setStyle(styleForTheme());
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      themeObserver.disconnect();
      homeMarkerRef.current?.remove();
      visitorMarkerRef.current?.remove();
      homeMarkerRef.current = null;
      visitorMarkerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sync = () => {
      paintVisitor(map, visitor, visitorMarkerRef);
      applyCamera(map, visitor, frame, reduce);
    };
    if (map.isStyleLoaded()) {
      sync();
      return;
    }
    map.once("load", sync);
    return () => {
      map.off("load", sync);
    };
  }, [visitor, frame]);

  return (
    <div
      ref={hostRef}
      className="origin-map__globe"
      role="img"
      aria-label="Map of Santa Barbara, California and your approximate location from an IP reading"
    />
  );
}

function applyCamera(map: Map, visitor: GeoPoint | null, frame: OriginFrame, reduce: boolean) {
  const view = originView(visitor, frame);
  const duration = reduce ? 0 : 900;
  map.setProjection({ type: view.projection });
  if ("zoom" in view) {
    map.easeTo({ center: view.center, zoom: view.zoom, pitch: 0, bearing: 0, duration });
    return;
  }
  map.fitBounds(view.bounds, { padding: view.padding, maxZoom: view.maxZoom, duration, pitch: 0, bearing: 0 });
}

function styleForTheme() {
  return document.documentElement.dataset.theme === "dark" ? DARK_STYLE : LIGHT_STYLE;
}

function emptyLine() {
  return {
    type: "Feature" as const,
    properties: {},
    geometry: { type: "LineString" as const, coordinates: [] as [number, number][] },
  };
}

function markerElement(kind: "home" | "you", label: string) {
  const root = document.createElement("div");
  root.className = "origin-map__marker";
  root.dataset.kind = kind;
  const dot = document.createElement("i");
  const text = document.createElement("span");
  text.textContent = label;
  root.append(dot, text);
  return root;
}

function paintVisitor(
  map: Map,
  visitor: GeoPoint | null,
  markerRef: { current: Marker | null },
) {
  markerRef.current?.remove();
  markerRef.current = null;
  const source = map.getSource("distance-arc") as GeoJSONSource | undefined;
  if (!visitor) {
    source?.setData(emptyLine());
    return;
  }

  markerRef.current = new Marker({
    element: markerElement("you", visitor.label || "You"),
    anchor: "bottom",
  })
    .setLngLat([visitor.lon, visitor.lat])
    .addTo(map);

  source?.setData({
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: greatCircleCoordinates(HOME, visitor),
    },
  });
}
