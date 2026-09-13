import type { Metadata } from "next";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { isOwnerEmail, normalizeAdminEmail } from "@/lib/admin";
import { editableSections } from "@/lib/content";
import { mediaSelect, toPlacedPhoto } from "@/lib/media";
import { libraryBookSelect, toLibraryBook } from "@/lib/books";
import { AdminSubmit } from "@/components/admin-submit";
import { MediaUploader } from "@/components/media-uploader";
import { BookLibraryAdmin } from "@/components/book-library-admin";
import { QuarterLogAdmin } from "@/components/quarter-log-admin";
import { fallbackQuarters, mergeQuarterLogs, QUARTER_KIND, toQuarterLog, unionQuarters, type QuarterLog } from "@/lib/quarters";
import { saveSection, signIn, signOut, signUp } from "./actions";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string; saved?: string }>;
}) {
  const { error, notice, saved } = await searchParams;

  if (!hasSupabaseConfig()) {
    return (
      <section className="admin-page">
        <div className="admin-status"><span /> SETUP REQUIRED</div>
        <h1>Your control room is ready to connect.</h1>
        <p>The editor UI is installed. Add the Supabase project URL, publishable key, and owner email to Vercel to turn on secure sign-in, drafts, and one-click publishing.</p>
        <div className="admin-grid">
          {editableSections.map((item) => (
            <div className="admin-module" key={item.slug}><span>{item.label}</span><small>Editor installed</small></div>
          ))}
          <div className="admin-module"><span>Quarter memory log</span><small>Editor installed</small></div>
        </div>
      </section>
    );
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const signedInEmail = typeof data?.claims?.email === "string" ? data.claims.email : null;
  const isOwner = Boolean(signedInEmail && isOwnerEmail(normalizeAdminEmail(signedInEmail)));

  if (!isOwner) {
    return (
      <section className="admin-page admin-login">
        <div className="login-overlay">
          <div className="login-panel" role="dialog" aria-modal="true" aria-labelledby="login-title">
            <h1 id="login-title">Sign in</h1>
            {notice === "check-email" && <p className="form-success">Check your email, then return here to sign in.</p>}
            {error === "limited" && <p className="form-error">Try again later.</p>}
            {error === "password" && <p className="form-error">Use at least eight characters.</p>}
            {error && error !== "limited" && error !== "password" && (
              <p className="form-error">Sign in failed.</p>
            )}
            <form action={signIn}>
              <div className="hp-field" aria-hidden="true" inert>
                <label>
                  Website
                  <input
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    defaultValue=""
                  />
                </label>
              </div>
              <label>Email<input name="email" type="email" autoComplete="username" required maxLength={254} /></label>
              <label>Password<input name="password" type="password" autoComplete="current-password" required maxLength={256} /></label>
              <div className="login-actions">
                <button type="submit">Sign in</button>
                <button className="text-button" type="submit" formAction={signUp}>Create account</button>
              </div>
            </form>
            {signedInEmail && <form action={signOut}><button className="text-button" type="submit">Sign out</button></form>}
            <a className="text-button" href="/">Back</a>
          </div>
        </div>
      </section>
    );
  }

  const [publishedResult, draftResult, quarterResult, quarterDraftResult, mediaResult, booksResult] = await Promise.all([
    supabase.from("content_items").select("slug,title,summary,body,status,updated_at").eq("kind", "page"),
    supabase.from("content_drafts").select("slug,title,summary,body,updated_at").eq("kind", "page"),
    supabase.from("content_items").select("slug,title,body,status,updated_at").eq("kind", QUARTER_KIND),
    supabase.from("content_drafts").select("slug,title,body,updated_at").eq("kind", QUARTER_KIND),
    supabase.from("media_assets").select(mediaSelect).order("created_at", { ascending: false }),
    supabase.from("library_books").select(libraryBookSelect).order("sort_order", { ascending: true }),
  ]);

  const existingMedia = (mediaResult.data || []).map(toPlacedPhoto);
  const existingBooks = (booksResult.data || []).map(toLibraryBook);
  const publishedQuarters = (quarterResult.data || [])
    .map(toQuarterLog)
    .filter((quarter): quarter is QuarterLog => Boolean(quarter));
  const draftQuarters = (quarterDraftResult.data || [])
    .map((item) => toQuarterLog({ ...item, status: "draft" }))
    .filter((quarter): quarter is QuarterLog => Boolean(quarter));
  const editorQuarters = unionQuarters(
    fallbackQuarters(),
    mergeQuarterLogs(publishedQuarters, draftQuarters),
  );

  const sections = editableSections.map((fallback) => {
    const stored = publishedResult.data?.find((item) => item.slug === fallback.slug);
    const draft = draftResult.data?.find((item) => item.slug === fallback.slug);
    const contentBody = draft?.body || stored?.body;
    const body = contentBody && typeof contentBody === "object" ? contentBody as Record<string, unknown> : {};
    return {
      ...fallback,
      title: draft?.title || stored?.title || fallback.title,
      summary: (draft ? draft.summary : stored?.summary) ?? fallback.summary,
      eyebrow: typeof body.eyebrow === "string" ? body.eyebrow : fallback.eyebrow,
      accentTitle: typeof body.accentTitle === "string" ? body.accentTitle : fallback.accentTitle,
      body: typeof body.copy === "string" ? body.copy : fallback.body,
      status: draft ? "draft changes" : stored?.status || "local fallback",
      updatedAt: (draft?.updated_at || stored?.updated_at) as string | undefined,
    };
  });

  const savedMessages: Record<string, string> = {
    published: "Section published live.",
    draft: "Section saved as a draft.",
    placed: "Photo placement saved. The public page will show it in that location.",
    removed: "Photo removed from the library and the public site.",
    "book-draft": "Book saved as a private draft.",
    "book-published": "Book published to Reading.",
    "book-imported": "Verified book metadata imported and cached.",
    "book-removed": "Book removed from the reading library.",
    "quarter-draft": "Quarter saved as a draft.",
    "quarter-published": "Quarter published to the memory log.",
    "quarter-added": "Quarter opened. Fill it in, then publish when it should be public.",
    "quarter-removed": "Quarter removed from the memory log.",
  };
  const savedCopy = saved ? savedMessages[saved] : undefined;

  return (
    <section className="admin-page">
      <div className="admin-status"><span /> OWNER VERIFIED</div>
      <h1>Editorial control room.</h1>
      <p>Edit copy, upload photos from your Mac, and place each image on a page location. Visitors never see this screen without the owner email and password.</p>
      {savedCopy && <p className="form-success">{savedCopy}</p>}
      {mediaResult.error && <p className="form-error">Photo library is not connected yet. Run the media_assets migration in Supabase, then refresh.</p>}
      {booksResult.error && <p className="form-error">Reading library is not connected yet. Run the library_books migration in Supabase, then refresh.</p>}
      {error === "media" && <p className="form-error">The photo change could not be saved. Check the page and location, then try again.</p>}
      {error?.startsWith("book-") && <p className="form-error">The book change could not be completed. Check the ISBN, Goodreads URL, and provider availability.</p>}
      {error === "quarter-exists" && <p className="form-error">That quarter is already in the log.</p>}
      {error === "quarter-invalid" && <p className="form-error">Choose a year and a quarter from Q1 to Q4.</p>}
      {error?.startsWith("quarter-") && error !== "quarter-exists" && error !== "quarter-invalid" && (
        <p className="form-error">The quarter change could not be saved.</p>
      )}
      {error && error !== "media" && !error.startsWith("book-") && !error.startsWith("quarter-") && <p className="form-error">The change could not be saved. Check the required fields and try again.</p>}
      <div className="editor-list" id="page-editor">
        {sections.map((section) => (
          <form className="editor-card" id={section.slug} action={saveSection} key={section.slug}>
            <input type="hidden" name="slug" value={section.slug} />
            <header>
              <div>
                <p className="eyebrow">{section.label}</p>
                <h2>{section.title} {section.accentTitle}</h2>
              </div>
              <p className="editor-state"><span>{section.status}</span>{section.updatedAt ? `Updated ${new Date(section.updatedAt).toLocaleDateString("en-US")}` : "Using local copy"}</p>
            </header>
            <label>Small heading<input name="eyebrow" defaultValue={section.eyebrow} maxLength={100} required /></label>
            <label>Main heading<input name="title" defaultValue={section.title} maxLength={240} required /></label>
            {section.slug === "home-opening" && <label>Accent heading line<input name="accentTitle" defaultValue={section.accentTitle} maxLength={240} /></label>}
            {section.slug === "home-opening" && <label>Short introduction<input name="summary" defaultValue={section.summary} maxLength={500} /></label>}
            {section.slug !== "home-opening" && <label>Body copy<textarea name="body" defaultValue={section.body} rows={5} maxLength={5000} /></label>}
            <AdminSubmit />
          </form>
        ))}
      </div>
      <QuarterLogAdmin quarters={editorQuarters} />
      <BookLibraryAdmin books={existingBooks} />
      <MediaUploader initialMedia={existingMedia} />
      <form action={signOut}><button className="text-button" type="submit">Sign out</button></form>
    </section>
  );
}
