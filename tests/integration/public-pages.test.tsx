import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HomePage from "@/app/page";
import AboutPage from "@/app/about/page";
import WritingPage from "@/app/writing/page";
import ReadingPage from "@/app/reading/page";
import NowPage from "@/app/now/page";
import ContactPage from "@/app/contact/page";
import { inventedCopyPatterns } from "../helpers";

describe("public App Router pages", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  });

  it("renders only the identity map on the homepage", () => {
    render(<HomePage />);

    expect(screen.getByRole("heading", { level: 1, name: /One life, seen through its connections/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Engineering" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tennis" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reading" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cars & bikes" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Content creation" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Travels" })).toBeInTheDocument();
    expect(screen.queryByText(/ORIGIN \/ ADAPTATION/)).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /A life in progress/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "admin" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Edit" })).not.toBeInTheDocument();
  });

  it("renders Story as a factual trajectory", async () => {
    render(await AboutPage());

    expect(screen.getByText("STORY / TWO COORDINATES")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Some distances are measured");
    expect(screen.getByText(/route begins in Ho Chi Minh City/)).toBeInTheDocument();
    expect(screen.getByText("Ho Chi Minh City")).toBeInTheDocument();
    expect(screen.getByText("United States")).toBeInTheDocument();
    expect(screen.getByText("UC Santa Barbara")).toBeInTheDocument();
    expect(screen.getByText(/Curiosity, repetition/)).toBeInTheDocument();
  });

  it("renders the reading shelf and permanently redirects the old writing route", async () => {
    render(await ReadingPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("My Shelf.");
    expect(screen.getByRole("navigation", { name: "Reading shelves" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "The Richest Man in Babylon" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Steve Jobs" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Start with Why" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /View on Goodreads/ })[0]).toHaveAttribute(
      "href",
      "https://www.goodreads.com/book/show/43097201",
    );
    expect(() => WritingPage()).toThrow("NEXT_REDIRECT:/reading");
  });

  it("renders Now in the present tense", async () => {
    render(await NowPage());

    expect(screen.getByText("NOW / PRESENT TENSE")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "In motion, not a summary." })).toBeInTheDocument();
    expect(screen.getByText("Last updated when this page is published from the editor.")).toBeInTheDocument();
    expect(screen.getByText(/Electrical engineering at UC Santa Barbara/)).toBeInTheDocument();
  });

  it("renders Contact with the public email and GitHub", async () => {
    render(await ContactPage());

    expect(screen.getByRole("heading", { level: 1, name: "Direct, when you want to reach me." })).toBeInTheDocument();
    const email = screen.getByRole("link", { name: "dominichuyn@gmail.com" });
    expect(email).toHaveAttribute("href", "mailto:dominichuyn@gmail.com");
    expect(document.querySelector('a[href="https://github.com/huynguyen9999"]')).not.toBeNull();
  });

  it("does not invent biography on the public fallbacks", async () => {
    render(<HomePage />);
    const text = document.body.textContent || "";
    for (const pattern of inventedCopyPatterns) {
      expect(text).not.toMatch(pattern);
    }
  });
});
