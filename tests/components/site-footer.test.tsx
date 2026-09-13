import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteFooter } from "@/components/site-footer";

describe("SiteFooter", () => {
  it("keeps the archive unfinished and points to Now, Contact, and GitHub", () => {
    render(<SiteFooter />);

    expect(screen.getByText("This archive is being assembled.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Now" })).toHaveAttribute("href", "/now");
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/contact");
    expect(screen.getByRole("link", { name: /GitHub/ })).toHaveAttribute(
      "href",
      "https://github.com/huynguyen9999/Personal-Website",
    );
  });

  it("hides admin as a quiet line under the unfinished note, not in the footer nav", () => {
    render(<SiteFooter />);

    const assembled = screen.getByText("This archive is being assembled.");
    const admin = screen.getByRole("link", { name: "admin" });
    expect(admin).toHaveAttribute("href", "/admin");
    expect(admin).toHaveClass("admin-whisper");
    expect(assembled.compareDocumentPosition(admin) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "Footer" }).contains(admin)).toBe(false);
  });
});
