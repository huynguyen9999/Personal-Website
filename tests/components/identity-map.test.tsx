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
    expect(screen.getByText(/Ho Chi Minh City holds family/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Engineering" }));
    expect(screen.getByText(/Electrical Engineering gives a formal direction/)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Cars & bikes" }).length).toBeGreaterThan(0);

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: "Tennis" })).toHaveFocus();
  });

  it("filters threads and lets visitors continue through related nodes", async () => {
    const user = userEvent.setup();
    render(<IdentityMap />);

    const creative = screen.getByRole("button", { name: "Creative work" });
    await user.click(creative);
    expect(creative).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: "Content creation" }));
    expect(screen.getByText(/private curiosity into public communication/)).toBeInTheDocument();
    await user.click(screen.getAllByRole("button", { name: "Making" })[1]);
    expect(screen.getByText(/engineering, writing, design/)).toBeInTheDocument();
  });
});
