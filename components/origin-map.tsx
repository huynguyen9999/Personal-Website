"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  GLOBE_MILES,
  haversineMiles,
  HOME,
  visitorDistanceCopy,
  visitorFromPayload,
  type GeoPoint,
  type OriginFrame,
  type VisitorLocationSource,
} from "@/lib/places";

const OriginGlobe = dynamic(
  () => import("@/components/origin-globe").then((module) => module.OriginGlobe),
  {
    ssr: false,
    loading: () => <div className="origin-map__globe" aria-hidden="true" />,
  },
);

type PlaceResult = GeoPoint & { label: string };

const PLACE_STORAGE_KEY = "origin-place";

export function OriginMap() {
  const [visitor, setVisitor] = useState<GeoPoint | null>(null);
  const [source, setSource] = useState<VisitorLocationSource>("network");
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState("");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [frame, setFrame] = useState<OriginFrame>("near");
  const [canUseDevice, setCanUseDevice] = useState(false);
  const miles = useMemo(() => (visitor ? haversineMiles(HOME, visitor) : null), [visitor]);
  const wider = frame === "region";
  const widerLabel = miles != null && miles >= GLOBE_MILES ? "See the world" : "See the region";
  const sourceRef = useRef(source);
  sourceRef.current = source;

  useEffect(() => {
    setCanUseDevice(Boolean(navigator.geolocation));
    try {
      const saved = visitorFromPayload(JSON.parse(localStorage.getItem(PLACE_STORAGE_KEY) || "null"));
      if (saved) {
        setVisitor(saved);
        sourceRef.current = "provided";
        setSource("provided");
        setSearchMessage(`Using saved place: ${saved.label}. Stored only in this browser.`);
      }
    } catch {
      localStorage.removeItem(PLACE_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/geo", { cache: "no-store", signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        const next = visitorFromPayload(payload);
        if (next && sourceRef.current === "network") {
          setVisitor(next);
          setSource("network");
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  function useDeviceLocation() {
    if (!navigator.geolocation) {
      setLocationMessage("This browser does not provide device location. Enter a city or postal code instead.");
      return;
    }
    setLocating(true);
    setLocationMessage("Requesting this device’s location…");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = visitorFromPayload({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          city: "You",
        });
        if (next) {
          setVisitor(next);
          sourceRef.current = "device";
          setSource("device");
          setFrame("near");
          localStorage.removeItem(PLACE_STORAGE_KEY);
          const accuracyMiles = position.coords.accuracy / 1609.344;
          setLocationMessage(
            Number.isFinite(accuracyMiles)
              ? `Device location updated. Browser-reported accuracy is within about ${Math.max(0.1, accuracyMiles).toFixed(1)} miles.`
              : "Device location updated.",
          );
        } else {
          setLocationMessage("This device returned an unusable location. Enter a city or postal code below.");
        }
        setLocating(false);
      },
      (error) => {
        const messages: Record<number, string> = {
          1: "Location permission was denied. Allow it for this site, or enter a city or postal code below.",
          2: "This device could not determine its location. Enter a city or postal code below.",
          3: "The location request timed out. Try again, or enter a city or postal code below.",
        };
        setLocationMessage(messages[error.code] || "This device could not determine its location.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60_000 },
    );
  }

  async function searchPlacesForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const place = query.trim();
    if (place.length < 2) {
      setSearchMessage("Enter at least two characters.");
      return;
    }
    setSearching(true);
    setSearchMessage("Searching…");
    setResults([]);
    try {
      const response = await fetch("/api/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: place }),
      });
      const payload = (await response.json()) as {
        results?: unknown[];
        error?: string;
      };
      if (!response.ok) throw new Error(payload.error || "Location search failed.");
      const nextResults = (payload.results ?? []).flatMap((candidate) => {
        const point = visitorFromPayload(candidate);
        return point?.label ? [{ ...point, label: point.label }] : [];
      });
      setResults(nextResults);
      setSearchMessage(
        nextResults.length
          ? "Choose the matching place."
          : "No matching place found. Try a city and country, or a postal code.",
      );
    } catch (error) {
      setSearchMessage(error instanceof Error ? error.message : "Location search failed.");
    } finally {
      setSearching(false);
    }
  }

  function choosePlace(place: PlaceResult) {
    setVisitor(place);
    sourceRef.current = "provided";
    setSource("provided");
    setFrame("near");
    setResults([]);
    setLocationMessage("");
    setSearchMessage(`Using ${place.label}. Saved only in this browser.`);
    localStorage.setItem(PLACE_STORAGE_KEY, JSON.stringify(place));
  }

  function clearSavedPlace() {
    localStorage.removeItem(PLACE_STORAGE_KEY);
    sourceRef.current = "network";
    setSource("network");
    setResults([]);
    setSearchMessage("Saved place cleared. Using the network estimate again.");
    fetch("/api/geo", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        const next = visitorFromPayload(payload);
        if (next && sourceRef.current === "network") setVisitor(next);
      })
      .catch(() => setVisitor(null));
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
            disabled={locating}
          >
            {locating ? "Locating…" : source === "device" ? "Refresh device location" : "Use this device’s location"}
          </button>
        ) : null}
        {source === "provided" ? (
          <button type="button" className="origin-map__toggle" onClick={clearSavedPlace}>
            Clear saved place
          </button>
        ) : null}
      </div>
      {locationMessage ? <p className="origin-map__status" aria-live="polite">{locationMessage}</p> : null}
      <form className="origin-map__place-form" onSubmit={searchPlacesForm}>
        <label htmlFor="origin-place">Or enter where you are now</label>
        <div>
          <input
            id="origin-place"
            name="place"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="City or postal code"
            maxLength={100}
            autoComplete="postal-code"
          />
          <button type="submit" disabled={searching}>{searching ? "Searching…" : "Search"}</button>
        </div>
      </form>
      {searchMessage ? <p className="origin-map__status" aria-live="polite">{searchMessage}</p> : null}
      {results.length > 0 ? (
        <ul className="origin-map__results" aria-label="Matching places">
          {results.map((place) => (
            <li key={`${place.label}:${place.lat}:${place.lon}`}>
              <button type="button" onClick={() => choosePlace(place)}>{place.label}</button>
            </li>
          ))}
        </ul>
      ) : null}
      <figcaption>{visitorDistanceCopy(miles, source, visitor?.label)}</figcaption>
      <p className="origin-map__privacy">
        Network location is an ISP estimate and can be a distant metro. Device location stays on this device; a place you select is stored only in this browser.
      </p>
    </figure>
  );
}
