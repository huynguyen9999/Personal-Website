import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { IdentityMap } from "@/components/identity-map";

describe("IdentityMap", () => {
  it("reveals factual context with mouse, click, and keyboard focus", async () => {
    const user = userEvent.setup();
    render(<IdentityMap />);

    const vietnam = screen.getByRole("button", { name: "Vietnam" });
    await user.hover(vietnam);
    expect(screen.getByText(/Grew up in Ho Chi Minh City/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Engineering" }));
    expect(screen.getByText(/Studies Electrical Engineering/)).toBeInTheDocument();

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: "Internet" })).toHaveFocus();
  });
});
