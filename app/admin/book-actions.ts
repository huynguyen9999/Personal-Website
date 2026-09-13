"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isOwnerEmail, normalizeAdminEmail } from "@/lib/admin";
import {
  isBookShelf,
  isValidGoodreadsUrl,
  isValidIsbn13,
  normalizeIsbn13,
  parseBookForm,
} from "@/lib/books";
import { fetchBookMetadata } from "@/lib/book-providers";
import { createClient } from "@/lib/supabase/server";

async function requireBookOwner() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const ownerId = typeof claims?.sub === "string" ? claims.sub : "";
  const email = typeof claims?.email === "string" ? normalizeAdminEmail(claims.email) : "";

  if (!ownerId || !isOwnerEmail(email)) redirect("/admin?error=unauthorized");
  return { supabase, ownerId };
}

function revalidateLibrary() {
  revalidatePath("/");
  revalidatePath("/reading");
  revalidatePath("/admin");
}

export async function saveBook(formData: FormData) {
  const book = parseBookForm(formData);
  if (!book.valid || !book.shelf) redirect("/admin?error=book-invalid#reading-library");

  const { supabase, ownerId } = await requireBookOwner();
  const now = new Date().toISOString();
  const values = {
    owner_id: ownerId,
    title: book.title,
    author: book.author,
    isbn13: book.isbn13 || null,
    goodreads_url: book.goodreadsUrl,
    shelf: book.shelf,
    cover_alt: book.coverAlt,
    note: book.note,
    sort_order: book.sortOrder,
    status: book.status,
    published_at: book.status === "published" ? now : null,
    updated_at: now,
  };

  const result = book.id
    ? await supabase
        .from("library_books")
        .update(values)
        .eq("id", book.id)
        .eq("owner_id", ownerId)
    : await supabase.from("library_books").insert(values);

  if (result.error) redirect("/admin?error=book-save#reading-library");
  revalidateLibrary();
  redirect(`/admin?saved=book-${book.status}#reading-library`);
}

export async function importBook(formData: FormData) {
  const id = String(formData.get("id") || "").trim();
  const isbn13 = normalizeIsbn13(formData.get("isbn13"));
  const goodreadsInput = String(formData.get("goodreadsUrl") || "").trim().slice(0, 500);
  const shelfInput = String(formData.get("shelf") || "");
  const shelf = isBookShelf(shelfInput) ? shelfInput : "reading_next";
  if (!isValidIsbn13(isbn13)) redirect("/admin?error=book-isbn#reading-library");
  if (goodreadsInput && !isValidGoodreadsUrl(goodreadsInput)) {
    redirect("/admin?error=book-goodreads#reading-library");
  }

  const { supabase, ownerId } = await requireBookOwner();
  let metadata;
  try {
    metadata = await fetchBookMetadata(isbn13);
  } catch {
    redirect("/admin?error=book-provider#reading-library");
  }

  const now = new Date().toISOString();
  const values = {
    owner_id: ownerId,
    title: metadata.title,
    author: metadata.author,
    isbn13,
    goodreads_url: goodreadsInput || `https://www.goodreads.com/book/isbn/${isbn13}`,
    shelf,
    cover_url: metadata.coverUrl || null,
    cover_source: metadata.coverSource,
    cover_source_url: metadata.coverSourceUrl,
    cover_alt: metadata.coverAlt,
    metadata_provider: metadata.metadataProvider,
    provider_id: metadata.providerId,
    description: metadata.description,
    published_date: metadata.publishedDate,
    average_rating: metadata.averageRating,
    ratings_count: metadata.ratingsCount,
    metadata_fetched_at: now,
    updated_at: now,
  };

  const result = id
    ? await supabase
        .from("library_books")
        .update(values)
        .eq("id", id)
        .eq("owner_id", ownerId)
    : await supabase.from("library_books").insert({
        ...values,
        note: "",
        status: "draft",
        sort_order: 0,
      });

  if (result.error) redirect("/admin?error=book-import#reading-library");
  revalidateLibrary();
  redirect("/admin?saved=book-imported#reading-library");
}

export async function deleteBook(formData: FormData) {
  const id = String(formData.get("id") || "").trim();
  if (!id) redirect("/admin?error=book-delete#reading-library");

  const { supabase, ownerId } = await requireBookOwner();
  const { error } = await supabase
    .from("library_books")
    .delete()
    .eq("id", id)
    .eq("owner_id", ownerId);

  if (error) redirect("/admin?error=book-delete#reading-library");
  revalidateLibrary();
  redirect("/admin?saved=book-removed#reading-library");
}
