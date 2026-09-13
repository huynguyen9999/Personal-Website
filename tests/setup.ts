import "@testing-library/jest-dom/vitest";
import { type ReactNode } from "react";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.removeAttribute("data-theme-preference");
  document.documentElement.style.colorScheme = "";
});

class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

Object.defineProperty(window, "matchMedia", {
  writable: true,
  configurable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return false;
    },
    addListener() {},
    removeListener() {},
  }),
});

vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
  return setTimeout(() => callback(0), 0) as unknown as number;
});

vi.stubGlobal("cancelAnimationFrame", (id: number) => {
  clearTimeout(id);
});

Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
  configurable: true,
  value: vi.fn(() => ({
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    lineCap: "round",
    lineJoin: "round",
    strokeStyle: "",
    shadowColor: "",
    lineWidth: 1,
    globalAlpha: 1,
  })),
});

vi.mock("next/link", async () => {
  const { createElement } = await import("react");
  return {
    default({ href, children, ...props }: { href: string; children: ReactNode }) {
      return createElement("a", { href: typeof href === "string" ? href : "/", ...props }, children);
    },
  };
});

vi.mock("next/image", async () => {
  const { createElement } = await import("react");
  return {
    default({ src, alt }: { src: string; alt: string }) {
      return createElement("img", { src, alt });
    },
  };
});

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  redirect: (url: string) => {
    const error = new Error(`NEXT_REDIRECT:${url}`);
    error.name = "NEXT_REDIRECT";
    throw error;
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers({ "x-forwarded-for": "127.0.0.1" })),
}));

vi.mock("@/lib/supabase/public", () => ({
  createPublicClient: vi.fn(() => {
    throw new Error("createPublicClient is mocked; tests must not hit production Supabase");
  }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => {
    throw new Error("createClient is mocked; tests must not hit production Supabase");
  }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => {
    throw new Error("browser createClient is mocked; tests must not hit production Supabase");
  }),
}));
