import { describe, expect, it } from "vitest";
import {
  curatedLibraryBooks,
  getPublishedBooks,
  isValidGoodreadsUrl,
  isValidIsbn13,
  normalizeIsbn13,
  parseBookForm,
  shelfFromSlug,
  toLibraryBook,
} from "@/lib/books";
import { formDataFrom } from "../helpers";

describe("book validation", () => {
  it("normalizes formatted ISBN input and validates its checksum", () => {
    expect(normalizeIsbn13("978-1-84794-183-1")).toBe("9781847941831");
    expect(isValidIsbn13("9781847941831")).toBe(true);
    expect(isValidIsbn13("9781847941832")).toBe(false);
  });

  it("accepts only HTTPS Goodreads hosts without embedded credentials", () => {
    expect(isValidGoodreadsUrl("https://www.goodreads.com/book/show/40121378")).toBe(true);
    expect(isValidGoodreadsUrl("http://www.goodreads.com/book/show/40121378")).toBe(false);
    expect(isValidGoodreadsUrl("https://goodreads.com.evil.test/book/show/40121378")).toBe(false);
    expect(isValidGoodreadsUrl("https://user:pass@goodreads.com/book/show/40121378")).toBe(false);
  });

  it("parses bounded editorial fields without trusting shelf or order input", () => {
    const parsed = parseBookForm(formDataFrom({
      id: "book-1",
      title: "Atomic Habits",
      author: "James Clear",
      isbn13: "978-1-84794-183-1",
      goodreadsUrl: "https://www.goodreads.com/book/show/40121378",
      shelf: "currently_reading",
      note: "Small changes compound.",
      coverAlt: "Atomic Habits cover",
      sortOrder: "999999",
      status: "published",
    }));

    expect(parsed).toMatchObject({
      valid: true,
      isbn13: "9781847941831",
      shelf: "currently_reading",
      sortOrder: 100000,
      status: "published",
    });
  });

  it("falls back invalid shelf query values to currently reading", () => {
    expect(shelfFromSlug("reading-next")).toBe("reading_next");
    expect(shelfFromSlug("not-a-shelf")).toBe("currently_reading");
  });
});

describe("cached provider row mapping", () => {
  it("ships the verified owner shelf as a migration-safe local fallback", async () => {
    const books = await getPublishedBooks();

    expect(books).toHaveLength(7);
    expect(books.filter((book) => book.shelf === "currently_reading")).toHaveLength(3);
    expect(books.filter((book) => book.shelf === "read")).toHaveLength(2);
    expect(books.filter((book) => book.shelf === "reading_next")).toHaveLength(2);
    expect(curatedLibraryBooks.map((book) => book.goodreadsUrl)).toEqual([
      "https://www.goodreads.com/book/show/43097201",
      "https://www.goodreads.com/book/show/11084145-steve-jobs?ref=nav_sb_ss_1_10",
      "https://www.goodreads.com/book/show/7108725-start-with-why?ref=nav_sb_ss_1_14",
      "https://www.goodreads.com/book/show/40121378",
      "https://www.goodreads.com/book/show/28257707-the-subtle-art-of-not-giving-a-f-ck?ref=nav_sb_ss_1_10",
      "https://www.goodreads.com/book/show/10127019-the-lean-startup?ref=nav_sb_ss_1_16",
      "https://www.goodreads.com/book/show/76865.Good_to_Great?ref=nav_sb_ss_1_13",
    ]);
    expect(books.every((book) => book.note === "" && book.averageRating === null)).toBe(true);
  });

  it("maps Supabase values without making a live provider request", () => {
    const book = toLibraryBook({
      id: "book-1",
      title: "Atomic Habits",
      author: "James Clear",
      isbn13: "9781847941831",
      goodreads_url: "https://www.goodreads.com/book/show/40121378",
      shelf: "currently_reading",
      cover_url: "https://covers.openlibrary.org/b/id/15247577-L.jpg",
      cover_source: "open_library",
      cover_source_url: "https://openlibrary.org/books/OL57360656M/Atomic_Habits",
      cover_alt: "Cover of Atomic Habits by James Clear",
      metadata_provider: "open_library",
      provider_id: "OL57360656M",
      description: "A framework for improving every day.",
      published_date: "October 18, 2018",
      average_rating: "3.97",
      ratings_count: 1410,
      note: "",
      status: "published",
      sort_order: 0,
      updated_at: "2026-09-12T00:00:00.000Z",
    });

    expect(book.averageRating).toBe(3.97);
    expect(book.coverSource).toBe("open_library");
    expect(book.goodreadsUrl).toContain("/40121378");
  });
});
