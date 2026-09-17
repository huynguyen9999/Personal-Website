import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Testimonials } from "@/components/ui/unique-testimonial";

describe("Testimonials", () => {
  it("renders an attributed recommendation without requiring an avatar", () => {
    render(
      <Testimonials
        testimonials={[{
          id: "peter",
          quote: "He showed meticulous attention to detail.",
          author: "Peter Sutherland",
          role: "Engineering Leader",
          sourceUrl: "https://www.linkedin.com/in/huynguyen06",
        }]}
      />,
    );

    expect(screen.getByText("He showed meticulous attention to detail.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Peter Sutherland/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("link", { name: /View recommendation/ })).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/huynguyen06",
    );
  });
});
