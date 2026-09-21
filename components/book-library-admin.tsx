import Image from "next/image";
import { bookShelves, type LibraryBook } from "@/lib/books";
import { deleteBook, importBook, saveBook } from "@/app/admin/book-actions";
import { AdminSubmit } from "@/components/admin-submit";

export function BookLibraryAdmin({ books }: { books: LibraryBook[] }) {
  return (
    <section className="book-admin" id="reading-library" aria-labelledby="reading-library-title">
      <header className="media-uploader__header">
        <div>
          <p className="eyebrow">READING / LIBRARY</p>
          <h2 id="reading-library-title">Import by ISBN, then make the shelf yours.</h2>
        </div>
        <p>
          Metadata is fetched once from Open Library, with Google Books as a fallback, and
          cached here. Goodreads is only the outbound reading link.
        </p>
      </header>

      <form className="book-import-form" action={importBook}>
        <label>
          ISBN-13
          <input name="isbn13" inputMode="numeric" pattern="[0-9 -]{13,17}" required maxLength={17} />
        </label>
        <label>
          Goodreads URL
          <input
            name="goodreadsUrl"
            type="url"
            placeholder="Optional; defaults to the ISBN page"
            maxLength={500}
          />
        </label>
        <label>
          Shelf
          <select name="shelf" defaultValue="reading_next">
            {bookShelves.map((shelf) => (
              <option key={shelf.id} value={shelf.id}>{shelf.label}</option>
            ))}
          </select>
        </label>
        <button className="publish-button" type="submit">Import verified metadata</button>
      </form>

      {books.length > 0 && (
        <div className="book-admin__list">
          {books.map((book) => (
            <form className="editor-card book-admin__card" action={saveBook} key={book.id}>
              <input type="hidden" name="id" value={book.id} />
              <header>
                <div>
                  <p className="eyebrow">{book.metadataProvider.replace("_", " ")}</p>
                  <h2>{book.title}</h2>
                </div>
                <p className="editor-state">
                  <span>{book.status}</span>
                  Metadata cached {new Date(book.updatedAt).toLocaleDateString("en-US")}
                </p>
              </header>

              <div className="book-admin__metadata">
                {book.coverUrl ? (
                  <Image
                    src={book.coverUrl}
                    alt={book.coverAlt || `Cover of ${book.title}`}
                    width={240}
                    height={360}
                  />
                ) : (
                  <div className="book-admin__cover-missing">No provider cover</div>
                )}
                <div>
                  <p>{book.description || "No provider description."}</p>
                  <p>
                    {book.publishedDate || "Date unavailable"}
                    {book.averageRating != null && book.ratingsCount != null
                      ? ` · ${book.averageRating.toFixed(2)} from ${book.ratingsCount.toLocaleString()} provider ratings`
                      : ""}
                  </p>
                  <a href={book.coverSourceUrl} target="_blank" rel="noopener noreferrer">
                    Source: {book.coverSource.replace("_", " ")}
                  </a>
                </div>
              </div>

              <label>Title<input name="title" defaultValue={book.title} maxLength={240} required /></label>
              <label>Author<input name="author" defaultValue={book.author} maxLength={180} /></label>
              <label>ISBN-13<input name="isbn13" defaultValue={book.isbn13} inputMode="numeric" maxLength={17} /></label>
              <label>Goodreads URL<input name="goodreadsUrl" type="url" defaultValue={book.goodreadsUrl} maxLength={500} required /></label>
              <label>
                Shelf
                <select name="shelf" defaultValue={book.shelf}>
                  {bookShelves.map((shelf) => (
                    <option key={shelf.id} value={shelf.id}>{shelf.label}</option>
                  ))}
                </select>
              </label>
              <label>Personal note<textarea name="note" defaultValue={book.note} rows={3} maxLength={500} /></label>
              <label>Cover alt text<input name="coverAlt" defaultValue={book.coverAlt} maxLength={240} /></label>
              <label>Order<input name="sortOrder" type="number" defaultValue={book.sortOrder} min={-100000} max={100000} /></label>
              <AdminSubmit />
              <div className="book-admin__secondary-actions">
                <button type="submit" formAction={importBook}>Refresh provider metadata</button>
                <button type="submit" formAction={deleteBook}>Delete book</button>
              </div>
            </form>
          ))}
        </div>
      )}
    </section>
  );
}
