import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReadingShelf } from "@/components/reading-shelf";
import type { LibraryBook } from "@/lib/books";

const atomicHabits: LibraryBook = {
  id: "book-1",
  title: "Atomic Habits",
  author: "James Clear",
  isbn13: "9781847941831",
  goodreadsUrl: "https://www.goodreads.com/book/show/40121378",
  shelf: "currently_reading",
  coverUrl: "https://covers.openlibrary.org/b/id/15247577-L.jpg",
  coverSource: "open_library",
  coverSourceUrl: "https://openlibrary.org/books/OL57360656M/Atomic_Habits",
  coverAlt: "Cover of Atomic Habits by James Clear",
  metadataProvider: "open_library",
  providerId: "OL57360656M",
  description: "A framework for improving every day.",
  publishedDate: "October 18, 2018",
  averageRating: 3.97,
  ratingsCount: 1410,
  note: "Small changes compound.",
  status: "published",
  sortOrder: 0,
  updatedAt: "2026-09-12T00:00:00.000Z",
};

describe("ReadingShelf", () => {
  it("renders cached metadata with separate Goodreads and provider attribution links", () => {
    render(<ReadingShelf books={[atomicHabits]} activeShelf="currently_reading" />);

    expect(screen.getByRole("heading", { name: "Atomic Habits" })).toBeInTheDocument();
    expect(screen.getByText("James Clear")).toBeInTheDocument();
    expect(screen.getByText(/3.97 \/ 5/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /View on Goodreads/ })).toHaveAttribute(
      "href",
      "https://www.goodreads.com/book/show/40121378",
    );
    expect(screen.getByRole("link", { name: /Metadata \+ cover: open library/ })).toHaveAttribute(
      "href",
      atomicHabits.coverSourceUrl,
    );
  });

  it("shows an honest empty state for shelves with no cached books", () => {
    render(<ReadingShelf books={[atomicHabits]} activeShelf="read" />);

    expect(screen.getByRole("status")).toHaveTextContent("No books on this shelf yet.");
    expect(screen.queryByRole("heading", { name: "Atomic Habits" })).not.toBeInTheDocument();
  });
});
