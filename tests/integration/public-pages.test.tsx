import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HomePage from "@/app/page";
import AboutPage from "@/app/about/page";
import WritingPage from "@/app/writing/page";
import ReadingPage from "@/app/reading/page";
import NowPage from "@/app/now/page";
import ContactPage from "@/app/contact/page";
import WhatIDoPage from "@/app/what-i-do/page";
import WhoIAmPage from "@/app/who-i-am/page";
import { inventedCopyPatterns } from "../helpers";

describe("public App Router pages", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  });

  it("renders the original homepage sequence plus the identity map", async () => {
    render(await HomePage());

    expect(screen.getByRole("heading", { level: 1, name: /A life in progress/ })).toBeInTheDocument();
    expect(screen.getByText("HO CHI MINH CITY → CALIFORNIA")).toBeInTheDocument();
    expect(screen.getByText("measured in circuits and baselines.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /A short signal from the present/ })).toBeInTheDocument();
    expect(screen.getByText(/Q3 2026/)).toBeInTheDocument();
    expect(screen.getByRole("time")).toHaveTextContent(/PDT|PST/);
    expect(screen.getByRole("button", { name: /Building\. Personal website admin\/editor/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Learning\. Electrical Engineering/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Reading\. .*Steve Jobs/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Tennis\. Collegiate tennis/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Thinking about/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /One life, seen through its connections/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Engineering" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cars & bikes" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /I’ve always wanted to see what happens behind the scenes/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Four practices/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Two places, without reducing either/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Quick answers" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /How did you learn English/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /The present tense/ })).toHaveAttribute("href", "/now");
    expect(screen.getByRole("link", { name: /Story/ })).toHaveAttribute("href", "/about");
    expect(screen.getByText("Huy Nguyen · Ho Chi Minh City → California")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "admin" })).toHaveAttribute("href", "/admin");
    expect(screen.queryByText(/ORIGIN \/ ADAPTATION/)).not.toBeInTheDocument();
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
    expect(screen.getByText(/Q3 2026/)).toBeInTheDocument();
    expect(screen.getByRole("time")).toHaveTextContent(/PDT|PST/);
    expect(screen.getByRole("button", { name: /Building\. Personal website admin\/editor/ })).toBeInTheDocument();
  });

  it("renders Contact with the public email and GitHub", async () => {
    render(await ContactPage());

    expect(screen.getByRole("heading", { level: 1, name: "Direct, when you want to reach me." })).toBeInTheDocument();
    const email = screen.getByRole("link", { name: "dominichuyn@gmail.com" });
    expect(email).toHaveAttribute("href", "mailto:dominichuyn@gmail.com");
    expect(document.querySelector('a[href="https://github.com/huynguyen9999"]')).not.toBeNull();
  });

  it("renders What I do as engineer, creator, and student", async () => {
    render(await WhatIDoPage());

    expect(screen.getByRole("heading", { level: 1, name: /Three practices/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Engineer" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Creator" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Student" })).toBeInTheDocument();
    expect(document.querySelector('a.text-link[href="https://github.com/huynguyen9999"]')).not.toBeNull();
    expect(screen.getByText("Resume PDF not published yet.")).toBeInTheDocument();
  });

  it("renders Who I am with origin, hobbies, and shelf", async () => {
    render(await WhoIAmPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("heading", { level: 1, name: "Huy Nguyen." })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /pronunciation of Huy Nguyen/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Book shelf." })).toBeInTheDocument();
    expect(screen.getByText(/I’m from Visalia, California/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Hobbies." })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Adventures/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Rubik’s cubes/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Tennis/ })).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: /Creating/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "What I drive." })).not.toBeInTheDocument();
  });

  it("does not invent biography on the public fallbacks", async () => {
    const pages = [
      await HomePage(),
      await WhatIDoPage(),
      await WhoIAmPage({ searchParams: Promise.resolve({}) }),
    ];
    for (const node of pages) {
      const { unmount } = render(node);
      const text = document.body.textContent || "";
      for (const pattern of inventedCopyPatterns) {
        expect(text).not.toMatch(pattern);
      }
      unmount();
    }
  });
});
