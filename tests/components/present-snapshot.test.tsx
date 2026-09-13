import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PresentSnapshot } from "@/components/present-snapshot";
import { fallbackQuarters, type QuarterLog } from "@/lib/quarters";

const now = new Date("2026-09-13T18:00:00.000Z");
const current = fallbackQuarters(now)[0];
const serverNow = now.toISOString();

const laterQuarter: QuarterLog = {
  slug: "2027-q1",
  year: 2027,
  quarter: 1,
  label: "Q1 2027",
  notes: {
    building: "A later building note",
    learning: "A later learning note",
    reading: "A later reading note",
    tennis: "A later tennis note",
    thinking: "A later thinking note",
    listening: "A later listening note",
    obsession: "A later obsession note",
  },
  status: "published",
};

describe("PresentSnapshot", () => {
  it("shows the current quarter, Pacific clock, and the seven log rows", () => {
    render(
      <PresentSnapshot
        eyebrow="NOW / SNAPSHOT"
        title="A short signal from the present."
        quarters={fallbackQuarters(now)}
        currentSlug={current.slug}
        serverNow={serverNow}
      />,
    );

    expect(screen.getByText("NOW / SNAPSHOT")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /A short signal from the present/ })).toBeInTheDocument();
    expect(screen.getByText(/Q3 2026/)).toBeInTheDocument();
    expect(screen.getByText(/· now/)).toBeInTheDocument();
    expect(screen.getByRole("time")).toHaveTextContent(/Sunday, September 13, 2026/);
    expect(screen.getByRole("time")).toHaveTextContent(/PDT/);
    expect(screen.queryByRole("slider")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Building\. Personal website admin\/editor/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Learning\. Electrical Engineering/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Reading\. .*Steve Jobs/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Tennis\. Collegiate tennis/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Thinking about\. Not recorded/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Listening to\. Not recorded/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Current obsession\. Not recorded/ })).toBeInTheDocument();
    expect(screen.queryByText(/RF systems/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /The present tense/ })).toHaveAttribute("href", "/now");
  });

  it("blurs neighboring rows on hover and moves with the keyboard", async () => {
    const user = userEvent.setup();
    render(
      <PresentSnapshot
        eyebrow="NOW / SNAPSHOT"
        title="A short signal from the present."
        quarters={fallbackQuarters(now)}
        currentSlug={current.slug}
        serverNow={serverNow}
      />,
    );

    const building = screen.getByRole("button", { name: /Building\./ });
    const learning = screen.getByRole("button", { name: /Learning\./ });
    const tennis = screen.getByRole("button", { name: /Tennis\./ });

    await user.hover(building);
    expect(building).toHaveAttribute("aria-pressed", "true");
    expect(learning).toHaveAttribute("data-muted", "true");
    expect(tennis).toHaveAttribute("data-muted", "true");

    learning.focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("button", { name: /Reading\./ })).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(screen.getByRole("button", { name: /Reading\./ })).toHaveAttribute("aria-pressed", "false");
    expect(building).toHaveAttribute("data-muted", "false");
  });

  it("keeps the calendar current quarter when a later season is added", async () => {
    const user = userEvent.setup();
    render(
      <PresentSnapshot
        quarters={[current, laterQuarter]}
        currentSlug={current.slug}
        serverNow={serverNow}
      />,
    );

    const slider = screen.getByRole("slider", { name: "Memory log" });
    expect(slider).toHaveAttribute("aria-valuetext", "Q3 2026");
    expect(screen.getByRole("button", { name: /Building\. Personal website admin\/editor/ })).toBeInTheDocument();
    expect(screen.getByText(/· now/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Q1 2027" }));
    expect(screen.getByRole("button", { name: /Current obsession\. A later obsession note/ })).toBeInTheDocument();
    expect(screen.queryByText(/· now/)).not.toBeInTheDocument();
    expect(screen.getByRole("time")).toHaveTextContent(/PDT/);

    fireEvent.change(slider, { target: { value: "0" } });
    expect(screen.getByRole("button", { name: /Building\. Personal website admin\/editor/ })).toBeInTheDocument();
    expect(screen.getByText(/· now/)).toBeInTheDocument();
  });
});
