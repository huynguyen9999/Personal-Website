import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import FAQ2 from "@/components/ui/8bit-faq2";

const sampleItems = [
  {
    question: "How did you learn English?",
    answer: "School, repetition, and speaking in public.",
  },
  {
    question: "How many siblings do you have?",
    answer: "",
  },
] as const;

describe("FAQ2", () => {
  it("expands one answer at a time with smooth toggle state", async () => {
    const user = userEvent.setup();
    render(<FAQ2 items={[...sampleItems]} title="Test FAQ" titleId="test-faq" />);

    const english = screen.getByRole("button", { name: /How did you learn English/i });
    const siblings = screen.getByRole("button", { name: /How many siblings/i });

    expect(english).toHaveAttribute("aria-expanded", "false");
    await user.click(english);
    expect(english).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/School, repetition/i)).toBeInTheDocument();

    await user.click(siblings);
    expect(siblings).toHaveAttribute("aria-expanded", "true");
    expect(english).toHaveAttribute("aria-expanded", "false");
  });
});
