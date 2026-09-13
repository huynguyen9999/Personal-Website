import type { Metadata } from "next";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { editableSections } from "@/lib/content";
import { mediaSelect, toPlacedPhoto } from "@/lib/media";
import { AdminSubmit } from "@/components/admin-submit";
import { MediaUploader } from "@/components/media-uploader";
import { saveSection, signIn, signOut, signUp } from "./actions";

export const metadata: Metadata = {
  title: "Editor",
  robots: { index: false, follow: false },
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
        </div>
      </section>
    );
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const signedInEmail = typeof data?.claims?.email === "string" ? data.claims.email : null;
  const allowedEmail = process.env.ADMIN_EMAIL;
  const isOwner = Boolean(signedInEmail && allowedEmail && signedInEmail.toLowerCase() === allowedEmail.toLowerCase());

  if (!isOwner) {
    return (
      <section className="admin-page admin-login">
        <div className="login-overlay">
          <div className="login-panel" role="dialog" aria-modal="true" aria-labelledby="login-title">
            <p className="eyebrow">OWNER ACCESS</p>
            <h1 id="login-title">Sign in to edit.</h1>
            <p>Only the owner account can change copy or place photos. Everyone else stays on the public site.</p>
            {signedInEmail && <p className="form-error">This account is not authorized as the site owner.</p>}
            {notice === "check-email" && <p className="form-success">Check your email to confirm the owner account, then return here to sign in.</p>}
            {error === "signin" && <p className="form-error">That email and password did not match.</p>}
            {error === "unauthorized" && <p className="form-error">Use the authorized owner email for this website.</p>}
            {error === "password" && <p className="form-error">Choose a password with at least eight characters.</p>}
            {error === "signup" && <p className="form-error">The owner account could not be created. It may already exist; try signing in.</p>}
            <form action={signIn}>
              <label>Email<input name="email" type="email" autoComplete="email" required /></label>
              <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
              <div className="login-actions">
                <button type="submit">Sign in</button>
                <button className="text-button" type="submit" formAction={signUp}>Create owner account</button>
              </div>
            </form>
            {signedInEmail && <form action={signOut}><button className="text-button" type="submit">Sign out of this account</button></form>}
            <a className="text-button" href="/">Back to the site</a>
          </div>
        </div>
      </section>
    );
  }

  const [publishedResult, draftResult, mediaResult] = await Promise.all([
    supabase.from("content_items").select("slug,title,summary,body,status,updated_at").eq("kind", "page"),
    supabase.from("content_drafts").select("slug,title,summary,body,updated_at").eq("kind", "page"),
    supabase.from("media_assets").select(mediaSelect).order("created_at", { ascending: false }),
  ]);

  const existingMedia = (mediaResult.data || []).map(toPlacedPhoto);

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
  };
  const savedCopy = saved ? savedMessages[saved] : undefined;

  return (
    <section className="admin-page">
      <div className="admin-status"><span /> OWNER VERIFIED</div>
      <h1>Editorial control room.</h1>
      <p>Edit copy, upload photos from your Mac, and place each image on a page location. Visitors never see this screen without the owner email and password.</p>
      {savedCopy && <p className="form-success">{savedCopy}</p>}
      {mediaResult.error && <p className="form-error">Photo library is not connected yet. Run the media_assets migration in Supabase, then refresh.</p>}
      {error === "media" && <p className="form-error">The photo change could not be saved. Check the page and location, then try again.</p>}
      {error && error !== "media" && <p className="form-error">The change could not be saved. Check the required fields and try again.</p>}
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
      <MediaUploader initialMedia={existingMedia} />
      <form action={signOut}><button className="text-button" type="submit">Sign out</button></form>
    </section>
  );
}
