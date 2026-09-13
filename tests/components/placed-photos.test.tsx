import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PlacedPhotos } from "@/components/placed-photos";
import { samplePhoto } from "../helpers";

describe("PlacedPhotos", () => {
  it("renders nothing when the library is empty", () => {
    const { container } = render(<PlacedPhotos photos={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders placed photos with alt text and captions", () => {
    render(
      <PlacedPhotos
        photos={[
          samplePhoto(),
          samplePhoto({
            id: "photo-2",
            url: "https://media.test/owner/two.jpg",
            alt: "",
            caption: "Second frame",
          }),
        ]}
        layout="stack"
      />,
    );

    expect(document.querySelector(".placed-photos--stack")).not.toBeNull();
    expect(screen.getByAltText("A court line at dusk")).toHaveAttribute(
      "src",
      "https://media.test/owner/opening.jpg",
    );
    expect(screen.getByText("Practice light")).toBeInTheDocument();
    expect(screen.getByAltText("Second frame")).toBeInTheDocument();
    expect(screen.getByText("Second frame")).toBeInTheDocument();
  });
});
