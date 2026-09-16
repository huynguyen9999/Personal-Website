import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PracticeStack } from "@/components/practice-stack";

describe("PracticeStack", () => {
  it("renders sticky stack cards for each practice", () => {
    const { container } = render(
      <PracticeStack
        practices={[
          {
            id: "engineer",
            number: "01",
            title: "Engineer",
            body: "Signals and systems.",
            photos: [],
          },
          {
            id: "creator",
            number: "02",
            title: "Creator",
            body: "Making in public.",
            photos: [],
          },
          {
            id: "student",
            number: "03",
            title: "Student",
            body: "Study and tennis.",
            photos: [],
          },
        ]}
      />,
    );

    expect(screen.getByRole("heading", { name: "Engineer" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Creator" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Student" })).toBeInTheDocument();
    expect(container.querySelectorAll("section")).toHaveLength(3);
    expect(container.querySelector('section[style*="--stack-index: 0"]')).not.toBeNull();
    expect(container.querySelector('section[style*="--stack-index: 2"]')).not.toBeNull();
  });
});
