import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { InteractiveBookCover } from "@/components/interactive-book-cover";

function media(matches: boolean, query: string): MediaQueryList {
  return {
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };
}

afterEach(() => vi.restoreAllMocks());

describe("InteractiveBookCover", () => {
  it("uses a keyboard-focusable CSS prism on a precise pointer", async () => {
    vi.spyOn(window, "matchMedia").mockImplementation((query) =>
      media(query.includes("hover: hover"), query),
    );

    render(
      <InteractiveBookCover
        title="Atomic Habits"
        coverUrl="https://covers.openlibrary.org/b/id/15247577-L.jpg"
        coverAlt="Cover of Atomic Habits"
      />,
    );

    await waitFor(() => expect(screen.getByRole("img", { name: "Interactive cover of Atomic Habits" })).toBeInTheDocument());
    expect(screen.getByRole("img", { name: "Interactive cover of Atomic Habits" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByText("Interactive cover")).toBeInTheDocument();
    expect(document.querySelector(".book-prism__back")).toBeInTheDocument();
    expect(document.querySelector(".book-prism__pages")).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/360/);
  });

  it("renders only the static real cover on coarse pointers", () => {
    vi.spyOn(window, "matchMedia").mockImplementation((query) => media(false, query));

    render(
      <InteractiveBookCover
        title="Atomic Habits"
        coverUrl="https://covers.openlibrary.org/b/id/15247577-L.jpg"
        coverAlt="Cover of Atomic Habits"
      />,
    );

    expect(screen.getByRole("img", { name: "Cover of Atomic Habits" })).toBeInTheDocument();
    expect(screen.queryByText("Interactive cover")).not.toBeInTheDocument();
    expect(document.querySelector(".book-prism")).not.toBeInTheDocument();
  });

  it("keeps reduced-motion users on the static cover even with a mouse", () => {
    vi.spyOn(window, "matchMedia").mockImplementation((query) =>
      media(query.includes("prefers-reduced-motion"), query),
    );

    render(
      <InteractiveBookCover
        title="Atomic Habits"
        coverUrl="https://covers.openlibrary.org/b/id/15247577-L.jpg"
        coverAlt="Cover of Atomic Habits"
      />,
    );

    expect(screen.getByRole("img", { name: "Cover of Atomic Habits" })).toBeInTheDocument();
    expect(document.querySelector(".book-prism")).not.toBeInTheDocument();
  });
});
