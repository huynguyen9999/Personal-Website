import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createPublicClient } from "@/lib/supabase/public";

export const bookShelves = [
  { id: "currently_reading", slug: "currently-reading", label: "Currently reading" },
  { id: "read", slug: "read", label: "Read" },
  { id: "reading_next", slug: "reading-next", label: "Reading next" },
] as const;

export type BookShelf = (typeof bookShelves)[number]["id"];
export type BookShelfSlug = (typeof bookShelves)[number]["slug"];

export type LibraryBook = {
  id: string;
  title: string;
  author: string;
  isbn13: string;
  goodreadsUrl: string;
  shelf: BookShelf;
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
  note: string;
  status: "draft" | "published";
  sortOrder: number;
  updatedAt: string;
};

const curatedUpdatedAt = "2026-09-12T00:00:00.000Z";

export const curatedLibraryBooks: LibraryBook[] = [
  {
    id: "curated-richest-man-in-babylon",
    title: "The Richest Man in Babylon",
    author: "George S. Clason",
    isbn13: "",
    goodreadsUrl: "https://www.goodreads.com/book/show/43097201",
    shelf: "currently_reading",
    coverUrl: "https://covers.openlibrary.org/b/id/10491331-L.jpg",
    coverSource: "open_library",
    coverSourceUrl: "https://openlibrary.org/works/OL8165007W",
    coverAlt: "Cover of The Richest Man in Babylon by George S. Clason",
    metadataProvider: "open_library",
    providerId: "OL8165007W",
    description: "",
    publishedDate: "1926",
    averageRating: null,
    ratingsCount: null,
    note: "",
    status: "published",
    sortOrder: 0,
    updatedAt: curatedUpdatedAt,
  },
  {
    id: "curated-steve-jobs",
    title: "Steve Jobs",
    author: "Walter Isaacson",
    isbn13: "9781451648539",
    goodreadsUrl: "https://www.goodreads.com/book/show/11084145-steve-jobs?ref=nav_sb_ss_1_10",
    shelf: "currently_reading",
    coverUrl: "https://covers.openlibrary.org/b/id/12374726-L.jpg",
    coverSource: "open_library",
    coverSourceUrl: "https://openlibrary.org/works/OL16085155W",
    coverAlt: "Cover of Steve Jobs by Walter Isaacson",
    metadataProvider: "open_library",
    providerId: "OL16085155W",
    description: "",
    publishedDate: "2011",
    averageRating: null,
    ratingsCount: null,
    note: "",
    status: "published",
    sortOrder: 1,
    updatedAt: curatedUpdatedAt,
  },
  {
    id: "curated-start-with-why",
    title: "Start with Why",
    author: "Simon Sinek",
    isbn13: "9781591842804",
    goodreadsUrl: "https://www.goodreads.com/book/show/7108725-start-with-why?ref=nav_sb_ss_1_14",
    shelf: "currently_reading",
    coverUrl: "https://covers.openlibrary.org/b/id/6395237-L.jpg",
    coverSource: "open_library",
    coverSourceUrl: "https://openlibrary.org/works/OL13806374W",
    coverAlt: "Cover of Start with Why by Simon Sinek",
    metadataProvider: "open_library",
    providerId: "OL13806374W",
    description: "",
    publishedDate: "2009",
    averageRating: null,
    ratingsCount: null,
    note: "",
    status: "published",
    sortOrder: 2,
    updatedAt: curatedUpdatedAt,
  },
  {
    id: "curated-atomic-habits",
    title: "Atomic Habits",
    author: "James Clear",
    isbn13: "9781847941831",
    goodreadsUrl: "https://www.goodreads.com/book/show/40121378",
    shelf: "read",
    coverUrl: "https://covers.openlibrary.org/b/id/15247577-L.jpg",
    coverSource: "open_library",
    coverSourceUrl: "https://openlibrary.org/books/OL57360656M/Atomic_Habits",
    coverAlt: "Cover of Atomic Habits by James Clear",
    metadataProvider: "open_library",
    providerId: "OL57360656M",
    description: "",
    publishedDate: "2018",
    averageRating: null,
    ratingsCount: null,
    note: "",
    status: "published",
    sortOrder: 0,
    updatedAt: curatedUpdatedAt,
  },
  {
    id: "curated-subtle-art",
    title: "The Subtle Art of Not Giving a F*ck",
    author: "Mark Manson",
    isbn13: "9780062457714",
    goodreadsUrl: "https://www.goodreads.com/book/show/28257707-the-subtle-art-of-not-giving-a-f-ck?ref=nav_sb_ss_1_10",
    shelf: "read",
    coverUrl: "https://covers.openlibrary.org/b/id/8231990-L.jpg",
    coverSource: "open_library",
    coverSourceUrl: "https://openlibrary.org/works/OL17590212W",
    coverAlt: "Cover of The Subtle Art of Not Giving a F*ck by Mark Manson",
    metadataProvider: "open_library",
    providerId: "OL17590212W",
    description: "",
    publishedDate: "2016",
    averageRating: null,
    ratingsCount: null,
    note: "",
    status: "published",
    sortOrder: 1,
    updatedAt: curatedUpdatedAt,
  },
  {
    id: "curated-lean-startup",
    title: "The Lean Startup",
    author: "Eric Ries",
    isbn13: "9780307887894",
    goodreadsUrl: "https://www.goodreads.com/book/show/10127019-the-lean-startup?ref=nav_sb_ss_1_16",
    shelf: "reading_next",
    coverUrl: "https://covers.openlibrary.org/b/id/7104760-L.jpg",
    coverSource: "open_library",
    coverSourceUrl: "https://openlibrary.org/works/OL16086010W",
    coverAlt: "Cover of The Lean Startup by Eric Ries",
    metadataProvider: "open_library",
    providerId: "OL16086010W",
    description: "",
    publishedDate: "2011",
    averageRating: null,
    ratingsCount: null,
    note: "",
    status: "published",
    sortOrder: 0,
    updatedAt: curatedUpdatedAt,
  },
  {
    id: "curated-good-to-great",
    title: "Good to Great",
    author: "Jim Collins",
    isbn13: "9780066620992",
    goodreadsUrl: "https://www.goodreads.com/book/show/76865.Good_to_Great?ref=nav_sb_ss_1_13",
    shelf: "reading_next",
    coverUrl: "https://covers.openlibrary.org/b/id/7431270-L.jpg",
    coverSource: "open_library",
    coverSourceUrl: "https://openlibrary.org/works/OL3486275W",
    coverAlt: "Cover of Good to Great by Jim Collins",
    metadataProvider: "open_library",
    providerId: "OL3486275W",
    description: "",
    publishedDate: "2001",
    averageRating: null,
    ratingsCount: null,
    note: "",
    status: "published",
    sortOrder: 1,
    updatedAt: curatedUpdatedAt,
  },
];

export const libraryBookSelect =
  "id,title,author,isbn13,goodreads_url,shelf,cover_url,cover_source,cover_source_url,cover_alt,metadata_provider,provider_id,description,published_date,average_rating,ratings_count,note,status,sort_order,updated_at";

type BookRow = {
  id: string;
  title: string;
  author: string | null;
  isbn13: string | null;
  goodreads_url: string;
  shelf: string;
  cover_url: string | null;
  cover_source: "open_library" | "google_books";
  cover_source_url: string;
  cover_alt: string | null;
  metadata_provider: "open_library" | "google_books";
  provider_id: string;
  description: string | null;
  published_date: string | null;
  average_rating: number | string | null;
  ratings_count: number | null;
  note: string | null;
  status: "draft" | "published";
  sort_order: number | null;
  updated_at: string;
};

const shelfIds = new Set<string>(bookShelves.map((shelf) => shelf.id));

export function isBookShelf(value: string): value is BookShelf {
  return shelfIds.has(value);
}

export function shelfFromSlug(value?: string): BookShelf {
  return bookShelves.find((shelf) => shelf.slug === value)?.id ?? "currently_reading";
}

export function shelfSlug(shelf: BookShelf): BookShelfSlug {
  return bookShelves.find((item) => item.id === shelf)?.slug ?? "currently-reading";
}

export function normalizeIsbn13(value: unknown) {
  return String(value || "").replace(/[^0-9]/g, "").slice(0, 13);
}

export function isValidIsbn13(value: string) {
  if (!/^\d{13}$/.test(value)) return false;
  const sum = [...value.slice(0, 12)].reduce(
    (total, digit, index) => total + Number(digit) * (index % 2 === 0 ? 1 : 3),
    0,
  );
  return (10 - (sum % 10)) % 10 === Number(value[12]);
}

export function isValidGoodreadsUrl(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    return (
      url.protocol === "https:" &&
      (host === "goodreads.com" || host === "www.goodreads.com") &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

export function parseBookForm(formData: FormData) {
  const id = String(formData.get("id") || "").trim();
  const title = String(formData.get("title") || "").trim().slice(0, 240);
  const author = String(formData.get("author") || "").trim().slice(0, 180);
  const isbn13 = normalizeIsbn13(formData.get("isbn13"));
  const goodreadsUrl = String(formData.get("goodreadsUrl") || "").trim().slice(0, 500);
  const shelfValue = String(formData.get("shelf") || "");
  const note = String(formData.get("note") || "").trim().slice(0, 500);
  const coverAlt = String(formData.get("coverAlt") || "").trim().slice(0, 240);
  const sortOrderRaw = Number.parseInt(String(formData.get("sortOrder") || "0"), 10);
  const sortOrder = Number.isFinite(sortOrderRaw)
    ? Math.max(-100000, Math.min(100000, sortOrderRaw))
    : 0;
  const status = formData.get("status") === "published" ? "published" : "draft";

  return {
    id,
    title,
    author,
    isbn13,
    goodreadsUrl,
    shelf: isBookShelf(shelfValue) ? shelfValue : null,
    note,
    coverAlt,
    sortOrder,
    status,
    valid:
      Boolean(title && isValidGoodreadsUrl(goodreadsUrl) && isBookShelf(shelfValue)) &&
      (!isbn13 || isValidIsbn13(isbn13)),
  };
}

export function toLibraryBook(row: BookRow): LibraryBook {
  const shelf = isBookShelf(row.shelf) ? row.shelf : "currently_reading";
  return {
    id: row.id,
    title: row.title,
    author: row.author || "",
    isbn13: row.isbn13 || "",
    goodreadsUrl: row.goodreads_url,
    shelf,
    coverUrl: row.cover_url || "",
    coverSource: row.cover_source,
    coverSourceUrl: row.cover_source_url,
    coverAlt: row.cover_alt || "",
    metadataProvider: row.metadata_provider,
    providerId: row.provider_id,
    description: row.description || "",
    publishedDate: row.published_date || "",
    averageRating: row.average_rating == null ? null : Number(row.average_rating),
    ratingsCount: row.ratings_count,
    note: row.note || "",
    status: row.status,
    sortOrder: row.sort_order ?? 0,
    updatedAt: row.updated_at,
  };
}

export async function getPublishedBooks() {
  if (!hasSupabaseConfig()) return curatedLibraryBooks;

  const supabase = createPublicClient();
  const { data: books, error } = await supabase
    .from("library_books")
    .select(libraryBookSelect)
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false });

  if (error || !books) {
    console.error("Published books query failed", error?.message);
    return curatedLibraryBooks;
  }

  const remoteBooks = (books as BookRow[]).map(toLibraryBook);
  const remoteKeys = new Set(remoteBooks.map((book) => book.providerId));
  return [
    ...remoteBooks,
    ...curatedLibraryBooks.filter((book) => !remoteKeys.has(book.providerId)),
  ].sort((a, b) =>
    a.shelf.localeCompare(b.shelf) ||
    a.sortOrder - b.sortOrder,
  );
}
