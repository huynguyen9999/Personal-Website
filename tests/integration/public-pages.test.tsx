import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HomePage from "@/app/page";
import AboutPage from "@/app/about/page";
import WritingPage from "@/app/writing/page";
import NowPage from "@/app/now/page";
import ContactPage from "@/app/contact/page";
import { inventedCopyPatterns } from "../helpers";

describe("public App Router pages", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  });

  it("renders the homepage sequence from local fallbacks", async () => {
    render(await HomePage());

    expect(screen.getByRole("heading", { level: 1, name: /A life in progress/ })).toBeInTheDocument();
    expect(screen.getByText("HO CHI MINH CITY → CALIFORNIA")).toBeInTheDocument();
    expect(screen.getByText("measured in circuits and baselines.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /In motion, not a summary/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /I’ve always wanted to see what happens behind the scenes/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Not separate identities/ })).toBeInTheDocument();
    expect(screen.getByText("Ho Chi Minh City, Vietnam")).toBeInTheDocument();
    expect(screen.getByText("Electrical engineering · UCSB")).toBeInTheDocument();
    expect(screen.getByText("Collegiate tennis")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Two places, without reducing either/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /The present tense/ })).toHaveAttribute("href", "/now");
    expect(screen.getByRole("link", { name: /Story/ })).toHaveAttribute("href", "/about");
    expect(screen.getByText("This archive is being assembled.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "admin" })).toHaveAttribute("href", "/admin");
    expect(screen.queryByRole("link", { name: "Edit" })).not.toBeInTheDocument();
  });

  it("renders Story as an incomplete outline", async () => {
    render(await AboutPage());

    expect(screen.getByText("STORY / FIRST PASS")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Some distances are measured");
    expect(screen.getByText(/intentionally incomplete/)).toBeInTheDocument();
    expect(screen.getByText("Ho Chi Minh City")).toBeInTheDocument();
    expect(screen.getByText("United States")).toBeInTheDocument();
    expect(screen.getByText("UC Santa Barbara")).toBeInTheDocument();
    expect(screen.getByText(/No dramatic arc has been invented/)).toBeInTheDocument();
  });

  it("keeps the writing shelf empty", async () => {
    render(await WritingPage());

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("The shelf is ready.");
    expect(screen.getByText(/The writing is not invented/)).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("000");
    expect(screen.getByText("Published pieces")).toBeInTheDocument();
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
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
    render(await HomePage());
    const text = document.body.textContent || "";
    for (const pattern of inventedCopyPatterns) {
      expect(text).not.toMatch(pattern);
    }
  });
});
