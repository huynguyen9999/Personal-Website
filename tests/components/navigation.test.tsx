import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Navigation } from "@/components/navigation";
import { installMatchMedia } from "../helpers";

let scrollY = 0;

function setScrollY(value: number) {
  scrollY = value;
}

afterEach(() => {
  scrollY = 0;
  vi.restoreAllMocks();
});

describe("Navigation", () => {
  it("renders the compact four-part archive and hides owner access", () => {
    vi.spyOn(window, "scrollY", "get").mockImplementation(() => scrollY);
    installMatchMedia();
    render(<Navigation />);

    expect(screen.getByRole("link", { name: "Huy Nguyen, home" })).toHaveAttribute("href", "/");
    const mark = document.querySelector("a.site-mark");
    expect(mark?.querySelectorAll("span")[0]).toHaveTextContent("Huy");
    expect(mark?.querySelectorAll("span")[1]).toHaveTextContent("Nguyen");
    expect(mark?.textContent).not.toMatch(/\b01\b/);
    expect(screen.getByRole("navigation", { name: "Primary navigation" })).toBeInTheDocument();
    expect(document.querySelector("a.nav-item[href='/']")).not.toBeNull();
    expect(document.querySelector("a.nav-item[href='/about']")).not.toBeNull();
    expect(document.querySelector("a.nav-item[href='/#making']")).not.toBeNull();
    expect(document.querySelector("a.nav-item[href='/#life']")).not.toBeNull();
    expect(document.querySelectorAll("a.nav-item")).toHaveLength(4);
    expect(document.querySelector("a.nav-item[href='/admin']")).toBeNull();
    expect(screen.queryByRole("link", { name: /^admin$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /^Work$/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /^Now$/ })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Currently reading/ })).toHaveAttribute("href", "/reading?shelf=currently-reading");
  });

  it("collapses on scroll down and returns on scroll up", () => {
    vi.spyOn(window, "scrollY", "get").mockImplementation(() => scrollY);
    installMatchMedia();
    setScrollY(0);
    render(<Navigation />);
    const header = document.querySelector("header.site-header");
    expect(header).toHaveAttribute("data-collapsed", "false");

    act(() => {
      setScrollY(120);
      window.dispatchEvent(new Event("scroll"));
    });
    expect(header).toHaveAttribute("data-collapsed", "true");

    act(() => {
      setScrollY(40);
      window.dispatchEvent(new Event("scroll"));
    });
    expect(header).toHaveAttribute("data-collapsed", "false");
  });

  it("stays expanded near the top of the page", () => {
    vi.spyOn(window, "scrollY", "get").mockImplementation(() => scrollY);
    installMatchMedia();
    setScrollY(0);
    render(<Navigation />);

    act(() => {
      setScrollY(16);
      window.dispatchEvent(new Event("scroll"));
    });
    expect(document.querySelector("header.site-header")).toHaveAttribute("data-collapsed", "false");
  });

  it("opens the mobile explore menu", async () => {
    installMatchMedia();
    const user = userEvent.setup();
    render(<Navigation />);

    const toggle = screen.getByRole("button", { name: "Explore" });
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("navigation", { name: "Primary navigation" })).toHaveAttribute("data-open", "true");
  });
});
