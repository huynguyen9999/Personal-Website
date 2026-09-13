import { isValidIsbn13 } from "@/lib/books";

export type EnrichedBookMetadata = {
  title: string;
  author: string;
  isbn13: string;
  coverUrl: string;
  coverSource: "open_library" | "google_books";
  coverSourceUrl: string;
  coverAlt: string;
  metadataProvider: "open_library" | "google_books";
  providerId: string;
  description: string;
  publishedDate: string;
  averageRating: number | null;
  ratingsCount: number | null;
};

const REQUEST_HEADERS = {
  Accept: "application/json",
  "User-Agent": "HuyNguyenPersonalArchive/1.0 (dominichuyn@gmail.com)",
};

async function getJson(url: URL) {
  const response = await fetch(url, {
    headers: REQUEST_HEADERS,
    signal: AbortSignal.timeout(8000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Provider returned ${response.status}`);
  return response.json() as Promise<unknown>;
}

function textDescription(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "value" in value) {
    const nested = (value as { value?: unknown }).value;
    return typeof nested === "string" ? nested : "";
  }
  return "";
}

async function fromOpenLibrary(isbn13: string): Promise<EnrichedBookMetadata | null> {
  const editionUrl = new URL("https://openlibrary.org/api/books");
  editionUrl.searchParams.set("bibkeys", `ISBN:${isbn13}`);
  editionUrl.searchParams.set("jscmd", "data");
  editionUrl.searchParams.set("format", "json");

  const searchUrl = new URL("https://openlibrary.org/search.json");
  searchUrl.searchParams.set("isbn", isbn13);
  searchUrl.searchParams.set(
    "fields",
    "key,title,author_name,first_publish_year,ratings_average,ratings_count,cover_i",
  );
  searchUrl.searchParams.set("limit", "5");

  const [editionUnknown, searchUnknown] = await Promise.all([
    getJson(editionUrl),
    getJson(searchUrl),
  ]);
  const editionMap = editionUnknown as Record<string, {
    key?: string;
    url?: string;
    title?: string;
    publish_date?: string;
    cover?: { large?: string; medium?: string };
  }>;
  const edition = editionMap[`ISBN:${isbn13}`];
  const docs = (searchUnknown as { docs?: Array<{
    key?: string;
    title?: string;
    author_name?: string[];
    first_publish_year?: number;
    ratings_average?: number;
    ratings_count?: number;
    cover_i?: number;
  }> }).docs || [];
  const work = docs.find((item) => item.author_name?.length) || docs[0];

  if (!edition?.title && !work?.title) return null;
  const workKey = work?.key && /^\/works\/OL[0-9A-Z]+W$/.test(work.key)
    ? work.key
    : "";
  let description = "";
  if (workKey) {
    try {
      const workUrl = new URL(`${workKey}.json`, "https://openlibrary.org");
      const workRecord = await getJson(workUrl) as { description?: unknown };
      description = textDescription(workRecord.description);
    } catch {
      // Description is optional; the verified edition still imports.
    }
  }

  const coverUrl =
    edition?.cover?.large ||
    edition?.cover?.medium ||
    (work?.cover_i ? `https://covers.openlibrary.org/b/id/${work.cover_i}-L.jpg` : "");
  const providerId = edition?.key?.split("/").at(-1) || workKey.split("/").at(-1) || isbn13;
  const sourceUrl = edition?.url?.replace(/^http:/, "https:") ||
    (edition?.key ? `https://openlibrary.org${edition.key}` : `https://openlibrary.org/isbn/${isbn13}`);
  const title = edition?.title || work?.title || "";

  return {
    title,
    author: work?.author_name?.join(", ") || "",
    isbn13,
    coverUrl,
    coverSource: "open_library",
    coverSourceUrl: sourceUrl,
    coverAlt: `Cover of ${title}${work?.author_name?.[0] ? ` by ${work.author_name[0]}` : ""}`,
    metadataProvider: "open_library",
    providerId,
    description: description.slice(0, 5000),
    publishedDate: edition?.publish_date || String(work?.first_publish_year || ""),
    averageRating: typeof work?.ratings_average === "number" ? work.ratings_average : null,
    ratingsCount: typeof work?.ratings_count === "number" ? work.ratings_count : null,
  };
}

async function fromGoogleBooks(isbn13: string): Promise<EnrichedBookMetadata | null> {
  const url = new URL("https://www.googleapis.com/books/v1/volumes");
  url.searchParams.set("q", `isbn:${isbn13}`);
  url.searchParams.set("maxResults", "1");
  if (process.env.GOOGLE_BOOKS_API_KEY) {
    url.searchParams.set("key", process.env.GOOGLE_BOOKS_API_KEY);
  }

  const payload = await getJson(url) as {
    items?: Array<{
      id?: string;
      volumeInfo?: {
        title?: string;
        authors?: string[];
        description?: string;
        publishedDate?: string;
        averageRating?: number;
        ratingsCount?: number;
        infoLink?: string;
        imageLinks?: { extraLarge?: string; large?: string; medium?: string; thumbnail?: string };
      };
    }>;
  };
  const item = payload.items?.[0];
  const info = item?.volumeInfo;
  if (!item?.id || !info?.title) return null;
  const providerCover = (
    info.imageLinks?.extraLarge ||
    info.imageLinks?.large ||
    info.imageLinks?.medium ||
    info.imageLinks?.thumbnail ||
    ""
  );
  const coverUrl = providerCover
    ? `https://books.google.com/books/content?id=${encodeURIComponent(item.id)}&printsec=frontcover&img=1&zoom=2&source=gbs_api`
    : "";
  const sourceUrl = info.infoLink?.replace(/^http:/, "https:") ||
    `https://books.google.com/books?id=${encodeURIComponent(item.id)}`;

  return {
    title: info.title,
    author: info.authors?.join(", ") || "",
    isbn13,
    coverUrl,
    coverSource: "google_books",
    coverSourceUrl: sourceUrl,
    coverAlt: `Cover of ${info.title}${info.authors?.[0] ? ` by ${info.authors[0]}` : ""}`,
    metadataProvider: "google_books",
    providerId: item.id,
    description: (info.description || "").slice(0, 5000),
    publishedDate: info.publishedDate || "",
    averageRating: typeof info.averageRating === "number" ? info.averageRating : null,
    ratingsCount: typeof info.ratingsCount === "number" ? info.ratingsCount : null,
  };
}

export async function fetchBookMetadata(isbn13: string) {
  if (!isValidIsbn13(isbn13)) throw new Error("Use a valid ISBN-13.");

  try {
    const openLibrary = await fromOpenLibrary(isbn13);
    if (openLibrary) return openLibrary;
  } catch {
    // Google Books is the bounded fallback when Open Library is unavailable.
  }

  try {
    const google = await fromGoogleBooks(isbn13);
    if (google) return google;
  } catch {
    // Return one generic error; provider internals should not leak into admin UI.
  }

  throw new Error("No verified metadata was found for that ISBN-13.");
}
