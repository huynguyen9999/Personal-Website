import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteFooter } from "@/components/site-footer";

describe("SiteFooter", () => {
  it("identifies Huy and points to Now, Contact, and GitHub", () => {
    render(<SiteFooter />);

    expect(screen.getByText("Huy Nguyen · Ho Chi Minh City → California")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Now" })).toHaveAttribute("href", "/now");
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/contact");
    expect(screen.getByRole("link", { name: /GitHub/ })).toHaveAttribute(
      "href",
      "https://github.com/huynguyen9999/Personal-Website",
    );
  });

  it("keeps owner access off the public footer", () => {
    render(<SiteFooter />);

    expect(screen.queryByRole("link", { name: "admin" })).not.toBeInTheDocument();
  });
});
