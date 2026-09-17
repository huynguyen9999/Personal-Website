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
  it("renders the compact archive with a direct contact route and hides owner access", () => {
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
    expect(document.querySelector("a.nav-item[href='/what-i-do']")).not.toBeNull();
    expect(document.querySelector("a.nav-item[href='/who-i-am']")).not.toBeNull();
    expect(document.querySelector("a.nav-item[href='/contact']")).not.toBeNull();
    expect(document.querySelectorAll("a.nav-item")).toHaveLength(5);
    expect(document.querySelector("a.nav-item[href='/admin']")).toBeNull();
    expect(document.querySelectorAll(".nav-corners")).toHaveLength(5);
    expect(document.querySelectorAll(".nav-corner")).toHaveLength(20);
    expect(screen.queryByRole("link", { name: /^admin$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /^Work$/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /^Now$/ })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^GitHub/ })).toHaveAttribute("href", "https://github.com/huynguyen9999");
    expect(screen.getByRole("link", { name: /Book shelf/ })).toHaveAttribute("href", "/who-i-am#shelf");
    expect(screen.getByRole("link", { name: /^Hobbies/ })).toHaveAttribute("href", "/who-i-am#hobbies");
    expect(screen.queryByRole("link", { name: /^Adventures/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /^Machines/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /^Tennis/ })).not.toBeInTheDocument();
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

  it("activates the desktop hover state for a navigation cell", async () => {
    vi.spyOn(window, "scrollY", "get").mockImplementation(() => scrollY);
    installMatchMedia();
    const user = userEvent.setup();
    render(<Navigation />);

    const whoIAm = document.querySelector<HTMLAnchorElement>("a.nav-item[href='/who-i-am']");
    expect(whoIAm).not.toBeNull();
    await user.hover(whoIAm!);

    expect(document.querySelector("header.site-header")).toHaveAttribute("data-nav-active", "true");
    expect(whoIAm).toHaveAttribute("data-focused", "true");
  });
});
