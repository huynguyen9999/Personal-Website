import { beforeEach, describe, expect, it, vi } from "vitest";
import { importBook } from "@/app/admin/book-actions";
import { fetchBookMetadata } from "@/lib/book-providers";
import { createClient } from "@/lib/supabase/server";
import { formDataFrom } from "../helpers";

vi.mock("@/lib/book-providers", () => ({
  fetchBookMetadata: vi.fn(),
}));

describe("admin book import", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv("ADMIN_USER_ID", "1c9b420d-c7f9-4d65-a22a-1c98b25e42e8");
    vi.mocked(createClient).mockReset();
    vi.mocked(fetchBookMetadata).mockReset();
  });

  it("validates ISBN and Goodreads URL before any provider or database work", async () => {
    await expect(importBook(formDataFrom({
      isbn13: "9781847941832",
      goodreadsUrl: "https://evil.test/book",
    }))).rejects.toThrow("NEXT_REDIRECT:/admin?error=book-isbn");

    expect(createClient).not.toHaveBeenCalled();
    expect(fetchBookMetadata).not.toHaveBeenCalled();
  });

  it("authenticates the owner before fetching provider metadata", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getClaims: vi.fn().mockResolvedValue({
          data: { claims: { sub: "intruder", email: "intruder@example.com" } },
        }),
      },
    } as never);

    await expect(importBook(formDataFrom({
      isbn13: "9781847941831",
      goodreadsUrl: "https://www.goodreads.com/book/show/40121378",
      shelf: "currently_reading",
    }))).rejects.toThrow("NEXT_REDIRECT:/admin?error=unauthorized");

    expect(fetchBookMetadata).not.toHaveBeenCalled();
  });

  it("stores normalized provider data as a draft and never fetches Goodreads", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getClaims: vi.fn().mockResolvedValue({
          data: { claims: { sub: "1c9b420d-c7f9-4d65-a22a-1c98b25e42e8", email: "dominichuyn@gmail.com" } },
        }),
      },
      from: vi.fn(() => ({ insert })),
    } as never);
    vi.mocked(fetchBookMetadata).mockResolvedValue({
      title: "Atomic Habits",
      author: "James Clear",
      isbn13: "9781847941831",
      coverUrl: "https://covers.openlibrary.org/b/id/15247577-L.jpg",
      coverSource: "open_library",
      coverSourceUrl: "https://openlibrary.org/books/OL57360656M/Atomic_Habits",
      coverAlt: "Cover of Atomic Habits by James Clear",
      metadataProvider: "open_library",
      providerId: "OL57360656M",
      description: "A framework for improving every day.",
      publishedDate: "October 18, 2018",
      averageRating: null,
      ratingsCount: null,
    });

    await expect(importBook(formDataFrom({
      isbn13: "978-1-84794-183-1",
      goodreadsUrl: "https://www.goodreads.com/book/show/40121378",
      shelf: "currently_reading",
    }))).rejects.toThrow("NEXT_REDIRECT:/admin?saved=book-imported");

    expect(fetchBookMetadata).toHaveBeenCalledWith("9781847941831");
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({
      owner_id: "1c9b420d-c7f9-4d65-a22a-1c98b25e42e8",
      isbn13: "9781847941831",
      goodreads_url: "https://www.goodreads.com/book/show/40121378",
      status: "draft",
      metadata_provider: "open_library",
      cover_source: "open_library",
    }));
  });
});
