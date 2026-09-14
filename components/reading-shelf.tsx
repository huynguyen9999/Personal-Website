import Link from "next/link";
import { bookShelves, shelfSlug, type BookShelf, type LibraryBook } from "@/lib/books";
import { InteractiveBookCover } from "@/components/interactive-book-cover";

export function ReadingShelf({
  books,
  activeShelf,
  hrefBase = "/reading",
}: {
  books: LibraryBook[];
  activeShelf: BookShelf;
  hrefBase?: string;
}) {
  const visibleBooks = books.filter((book) => book.shelf === activeShelf);
  const activeLabel = bookShelves.find((shelf) => shelf.id === activeShelf)?.label;

  return (
    <section className="reading-shelf" aria-labelledby="shelf-title">
      <div className="shelf-tabs" role="navigation" aria-label="Reading shelves">
        {bookShelves.map((shelf) => {
          const count = books.filter((book) => book.shelf === shelf.id).length;
          return (
            <Link
              key={shelf.id}
              href={`${hrefBase}?shelf=${shelf.slug}`}
              aria-current={activeShelf === shelf.id ? "page" : undefined}
              scroll={false}
            >
              <span>{shelf.label}</span>
              <span aria-label={`${count} books`}>{String(count).padStart(2, "0")}</span>
            </Link>
          );
        })}
      </div>

      <div className="shelf-heading">
        <p id="shelf-title">{activeLabel}</p>
        <p>{String(visibleBooks.length).padStart(3, "0")}</p>
      </div>

      {visibleBooks.length > 0 ? (
        <ol className="book-grid">
          {visibleBooks.map((book) => (
            <li className="book-card" key={book.id}>
              <InteractiveBookCover
                title={book.title}
                coverUrl={book.coverUrl}
                coverAlt={book.coverAlt}
              />
              <div className="book-card__copy">
                <p className="book-card__shelf">{shelfSlug(book.shelf).replaceAll("-", " ")}</p>
                <h2>{book.title}</h2>
                {book.author && <p className="book-card__author">{book.author}</p>}
                    {(book.publishedDate || book.averageRating != null) && (
                      <p className="book-card__facts">
                        {book.publishedDate}
                        {book.averageRating != null && book.ratingsCount != null
                          ? `${book.publishedDate ? " · " : ""}${book.averageRating.toFixed(2)} / 5 · ${book.ratingsCount.toLocaleString()} ratings`
                          : ""}
                      </p>
                    )}
                    {book.description && <p className="book-card__description">{book.description}</p>}
                {book.note && <p className="book-card__note">{book.note}</p>}
                    <div className="book-card__links">
                      <a
                        className="book-card__link"
                        href={book.goodreadsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View on Goodreads <span aria-hidden="true">↗</span>
                      </a>
                      <a
                        className="book-card__source"
                        href={book.coverSourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Metadata + cover: {book.coverSource.replace("_", " ")}
                      </a>
                    </div>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <div className="shelf-empty" role="status">
          <span>000</span>
          <p>No books on this shelf yet.</p>
          <small>The shelf changes when a real title is published from admin.</small>
        </div>
      )}
    </section>
  );
}
