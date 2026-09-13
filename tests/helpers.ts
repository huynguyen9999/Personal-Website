import type { PlacedPhoto } from "@/lib/media";

type MediaMatches = Record<string, boolean>;

export function installMatchMedia(matches: MediaMatches = {}) {
  const listeners = new Map<string, Set<(event: MediaQueryListEvent) => void>>();

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => {
      const mediaQueryList = {
        get matches() {
          return Boolean(matches[query]);
        },
        media: query,
        onchange: null,
        addEventListener(event: string, callback: (event: MediaQueryListEvent) => void) {
          if (event !== "change") return;
          const set = listeners.get(query) ?? new Set();
          set.add(callback);
          listeners.set(query, set);
        },
        removeEventListener(event: string, callback: (event: MediaQueryListEvent) => void) {
          listeners.get(query)?.delete(callback);
        },
        dispatchEvent() {
          return true;
        },
        addListener() {},
        removeListener() {},
      };

      return mediaQueryList;
    },
  });

  return {
    set(query: string, value: boolean) {
      matches[query] = value;
      const event = { matches: value, media: query } as MediaQueryListEvent;
      listeners.get(query)?.forEach((callback) => callback(event));
    },
  };
}

export function samplePhoto(overrides: Partial<PlacedPhoto> = {}): PlacedPhoto {
  return {
    id: "photo-1",
    storagePath: "owner/opening.jpg",
    url: "https://media.test/owner/opening.jpg",
    page: "home",
    slot: "opening",
    alt: "A court line at dusk",
    caption: "Practice light",
    sortOrder: 0,
    createdAt: "2026-09-12T00:00:00.000Z",
    ...overrides,
  };
}

export const inventedCopyPatterns = [
  /american dream/i,
  /against all odds/i,
  /internship/i,
  /\bintern\b/i,
  /world-class/i,
  /award-winning/i,
  /\bgpa\b/i,
  /ranking/i,
  /passionate engineer/i,
  /10x/i,
  /linkedin/i,
  /résumé grid/i,
];

export function formDataFrom(entries: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    formData.set(key, value);
  }
  return formData;
}
