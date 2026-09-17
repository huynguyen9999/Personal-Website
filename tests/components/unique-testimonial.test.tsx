import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Testimonials } from "@/components/ui/unique-testimonial";

describe("Testimonials", () => {
  it("renders an attributed recommendation with an initials fallback avatar", () => {
    render(
      <Testimonials
        testimonials={[{
          id: "peter",
          quote: "He showed meticulous attention to detail.",
          author: "Peter Sutherland",
          role: "Engineering Leader",
          sourceUrl: "https://www.linkedin.com/in/sutherlandpb/",
          profileUrl: "https://www.linkedin.com/in/sutherlandpb/",
          avatarSrc: "/images/peter-sutherland.png",
        }]}
      />,
    );

    expect(screen.getByText("He showed meticulous attention to detail.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Peter Sutherland/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("link", { name: "Peter Sutherland on LinkedIn" })).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/sutherlandpb/",
    );
    expect(screen.getByRole("link", { name: /View recommendation/ })).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/sutherlandpb/",
    );
  });

  it("switches between real recommendations only when the visitor selects one", async () => {
    const user = userEvent.setup();
    render(
      <Testimonials
        testimonials={[
          {
            id: "peter",
            quote: "Peter's recommendation.",
            author: "Peter Sutherland",
            role: "Engineering Leader",
            profileUrl: "https://www.linkedin.com/in/sutherlandpb/",
          },
          {
            id: "harshit",
            quote: "Harshit's recommendation.",
            author: "Harshit Sharma",
            role: "Senior SDE · Amazon",
            sourceUrl: "https://www.linkedin.com/in/hsharma369/",
            profileUrl: "https://www.linkedin.com/in/hsharma369/",
            avatarSrc: "/images/harshit-sharma.jpg",
          },
        ]}
      />,
    );

    expect(screen.getByText("Peter's recommendation.")).toBeInTheDocument();
    const harshit = screen.getByRole("button", { name: "Harshit Sharma" });
    expect(screen.getByRole("link", { name: "Harshit Sharma on LinkedIn" })).toBeInTheDocument();
    expect(screen.getByRole("presentation")).toHaveAttribute("src", expect.stringContaining("harshit-sharma.jpg"));
    await user.click(harshit);
    expect(await screen.findByText("Harshit's recommendation.")).toBeInTheDocument();
    expect(harshit).toHaveAttribute("aria-pressed", "true");
  });
});
