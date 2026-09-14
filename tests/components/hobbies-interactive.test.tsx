import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { HobbiesInteractive } from "@/components/hobbies-interactive";
import { samplePhoto } from "../helpers";

const categories = [
  { id: "adventures" as const, label: "Adventures", photos: [] },
  {
    id: "machines" as const,
    label: "Machines",
    photos: [
      samplePhoto({ id: "one", alt: "First machine", caption: "First frame" }),
      samplePhoto({ id: "two", url: "https://media.test/two.jpg", alt: "Second machine", caption: "Second frame" }),
    ],
  },
  { id: "rubiks-cubes" as const, label: "Cubes", photos: [] },
  { id: "work-setup" as const, label: "Work setup", photos: [] },
  { id: "tennis" as const, label: "Tennis", photos: [] },
];

describe("HobbiesInteractive", () => {
  it("expands a category and cycles photographs", async () => {
    const user = userEvent.setup();
    render(<HobbiesInteractive categories={categories} initialCategory="machines" />);

    expect(screen.getByRole("tab", { name: /Machines/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("First frame")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next photo" }));
    expect(screen.getByText("Second frame")).toBeInTheDocument();
    expect(screen.getByText("02 / 02")).toBeInTheDocument();
  });

  it("supports arrow-key category navigation on tabs", async () => {
    const user = userEvent.setup();
    render(<HobbiesInteractive categories={categories} initialCategory="adventures" />);

    const adventures = screen.getByRole("tab", { name: /Adventures/i });
    adventures.focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: /Machines/i })).toHaveAttribute("aria-selected", "true");
  });

  it("shows an empty note for categories without photos", () => {
    render(<HobbiesInteractive categories={categories} initialCategory="adventures" />);
    expect(screen.getByText(/No photographs published yet for adventures/i)).toBeInTheDocument();
  });

  it("opens on the first category with a published photograph", () => {
    render(<HobbiesInteractive categories={categories} />);
    expect(screen.getByRole("tab", { name: /Machines/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("First frame")).toBeInTheDocument();
  });

  it("labels cubes without a description paragraph", () => {
    render(<HobbiesInteractive categories={categories} initialCategory="rubiks-cubes" />);
    expect(screen.getByRole("tab", { name: /^Cubes$/i })).toBeInTheDocument();
    expect(screen.queryByText(/Rubik/i)).not.toBeInTheDocument();
  });
});
