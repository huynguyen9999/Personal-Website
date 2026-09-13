import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchBookMetadata } from "@/lib/book-providers";

function jsonResponse(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("book provider enrichment", () => {
  it("fetches fixed Open Library endpoints and normalizes cached metadata", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo) => {
      const url = String(input);
      if (url.includes("/api/books")) {
        return jsonResponse({
          "ISBN:9781847941831": {
            key: "/books/OL57360656M",
            url: "http://openlibrary.org/books/OL57360656M/Atomic_Habits",
            title: "Atomic Habits",
            publish_date: "October 18, 2018",
            cover: { large: "https://covers.openlibrary.org/b/id/15247577-L.jpg" },
          },
        });
      }
      if (url.includes("/search.json")) {
        return jsonResponse({
          docs: [{
            key: "/works/OL17930368W",
            title: "Atomic Habits",
            author_name: ["James Clear"],
            ratings_average: 3.974,
            ratings_count: 1410,
          }],
        });
      }
      if (url.includes("/works/OL17930368W.json")) {
        return jsonResponse({ description: { value: "Small changes compound." } });
      }
      throw new Error(`Unexpected provider URL: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchBookMetadata("9781847941831");

    expect(result).toMatchObject({
      title: "Atomic Habits",
      author: "James Clear",
      isbn13: "9781847941831",
      providerId: "OL57360656M",
      metadataProvider: "open_library",
      averageRating: 3.974,
      ratingsCount: 1410,
      description: "Small changes compound.",
    });
    expect(result.coverSourceUrl).toMatch(/^https:/);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("falls back to Google Books without fetching a user-provided URL", async () => {
    vi.stubEnv("GOOGLE_BOOKS_API_KEY", "test-key");
    const requested: string[] = [];
    vi.stubGlobal("fetch", vi.fn(async (input: URL | RequestInfo) => {
      const url = String(input);
      requested.push(url);
      if (url.startsWith("https://openlibrary.org/")) throw new Error("Open Library unavailable");
      return jsonResponse({
        items: [{
          id: "provider-id",
          volumeInfo: {
            title: "Atomic Habits",
            authors: ["James Clear"],
            infoLink: "http://books.google.com/books?id=provider-id",
            imageLinks: { thumbnail: "http://books.google.com/books/content?id=provider-id" },
          },
        }],
      });
    }));

    const result = await fetchBookMetadata("9781847941831");

    expect(result.metadataProvider).toBe("google_books");
    expect(result.coverUrl).toMatch(/^https:/);
    expect(requested.every((url) =>
      url.startsWith("https://openlibrary.org/") ||
      url.startsWith("https://www.googleapis.com/books/v1/volumes"),
    )).toBe(true);
    expect(requested.some((url) => url.includes("key=test-key"))).toBe(true);
  });

  it("rejects invalid ISBNs before any network request", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchBookMetadata("9781847941832")).rejects.toThrow("valid ISBN-13");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
