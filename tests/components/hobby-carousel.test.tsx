import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { HobbyCarousel, type HobbyCategory } from "@/components/hobby-carousel";
import { samplePhoto } from "../helpers";

const categories: HobbyCategory[] = [
  { id: "adventures", label: "Adventures", description: "Places worth returning to.", photos: [] },
  {
    id: "machines",
    label: "Machines",
    description: "Cars and bikes.",
    photos: [
      samplePhoto({ id: "one", alt: "First machine", caption: "First frame" }),
      samplePhoto({ id: "two", url: "https://media.test/two.jpg", alt: "Second machine", caption: "Second frame" }),
    ],
  },
  { id: "rubiks-cubes", label: "Rubik’s cubes", description: "Patterns.", photos: [] },
  { id: "work-setup", label: "Work setup", description: "Tools and space.", photos: [] },
  { id: "tennis", label: "Tennis", description: "Practice.", photos: [] },
];

describe("HobbyCarousel", () => {
  it("switches categories and manually cycles photographs", async () => {
    const user = userEvent.setup();
    render(<HobbyCarousel categories={categories} initialCategory="adventures" />);

    expect(screen.getByRole("tab", { name: /Adventures/ })).toHaveAttribute("aria-selected", "true");
    await user.click(screen.getByRole("tab", { name: /Machines/ }));
    expect(screen.getByAltText("First machine")).toBeInTheDocument();
    expect(screen.getByText("First frame")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next photo" }));
    expect(screen.getByText("Second frame")).toBeInTheDocument();
    expect(screen.getByText("02 / 02")).toBeInTheDocument();
  });

  it("supports arrow-key category navigation", async () => {
    const user = userEvent.setup();
    render(<HobbyCarousel categories={categories} initialCategory="adventures" />);

    const adventures = screen.getByRole("tab", { name: /Adventures/ });
    adventures.focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: /Machines/ })).toHaveAttribute("aria-selected", "true");
  });

  it("keeps an empty category compact and hides irrelevant carousel controls", () => {
    render(<HobbyCarousel categories={categories} initialCategory="adventures" />);

    expect(screen.getByText("No photographs published yet.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Previous photo" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Next photo" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Choose photo")).not.toBeInTheDocument();
  });

  it("supports Home and End in the hobby index", async () => {
    const user = userEvent.setup();
    render(<HobbyCarousel categories={categories} initialCategory="adventures" />);

    const adventures = screen.getByRole("tab", { name: /Adventures/ });
    adventures.focus();
    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: /Tennis/ })).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: /Adventures/ })).toHaveAttribute("aria-selected", "true");
  });

  it("opens on the first category with a published photograph", () => {
    render(<HobbyCarousel categories={categories} />);

    expect(screen.getByRole("tab", { name: /Machines/ })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByAltText("First machine")).toBeInTheDocument();
  });

  it("cycles photographs with panel arrow keys and a swipe", () => {
    render(<HobbyCarousel categories={categories} />);
    const panel = screen.getByRole("tabpanel");

    fireEvent.keyDown(panel, { key: "ArrowRight" });
    expect(screen.getByText("Second frame")).toBeInTheDocument();

    fireEvent.touchStart(panel, { changedTouches: [{ clientX: 80 }] });
    fireEvent.touchEnd(panel, { changedTouches: [{ clientX: 170 }] });
    expect(screen.getByText("First frame")).toBeInTheDocument();
  });
});
