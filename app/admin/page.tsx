import type { Metadata } from "next";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { editableSections } from "@/lib/content";
import { AdminSubmit } from "@/components/admin-submit";
import { saveSection, signIn, signOut } from "./actions";

export const metadata: Metadata = {
  title: "Editor",
  robots: { index: false, follow: false },
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { error, saved } = await searchParams;

  if (!hasSupabaseConfig()) {
    return (
      <section className="admin-page">
        <div className="admin-status"><span /> SETUP REQUIRED</div>
        <h1>Your control room is ready to connect.</h1>
        <p>The editor UI is installed. Add the Supabase project URL, publishable key, and owner email to Vercel to turn on secure sign-in, drafts, and one-click publishing.</p>
        <div className="admin-grid">
          {['Homepage opening', 'Homepage field note', 'Story opening'].map((item) => (
            <div className="admin-module" key={item}><span>{item}</span><small>Editor installed</small></div>
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
        <p className="eyebrow">OWNER ACCESS</p>
        <h1>Enter the control room.</h1>
        {signedInEmail && <p className="form-error">This account is not authorized as the site owner.</p>}
        {error && <p className="form-error">That email and password did not match.</p>}
        <form action={signIn}>
          <label>Email<input name="email" type="email" autoComplete="email" required /></label>
          <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
          <button type="submit">Sign in</button>
        </form>
        {signedInEmail && <form action={signOut}><button className="text-button" type="submit">Sign out of this account</button></form>}
      </section>
    );
  }

  const { data: storedSections } = await supabase
    .from("content_items")
    .select("slug,title,summary,body,draft_title,draft_summary,draft_body,status,updated_at")
    .eq("kind", "page");

  const sections = editableSections.map((fallback) => {
    const stored = storedSections?.find((item) => item.slug === fallback.slug);
    const hasDraft = Boolean(stored?.draft_title || stored?.draft_body);
    const contentBody = hasDraft ? stored?.draft_body : stored?.body;
    const body = contentBody && typeof contentBody === "object" ? contentBody as Record<string, unknown> : {};
    return {
      ...fallback,
      title: (hasDraft ? stored?.draft_title : stored?.title) || fallback.title,
      summary: (hasDraft ? stored?.draft_summary : stored?.summary) ?? fallback.summary,
      eyebrow: typeof body.eyebrow === "string" ? body.eyebrow : fallback.eyebrow,
      body: typeof body.copy === "string" ? body.copy : fallback.body,
      status: hasDraft ? "draft changes" : stored?.status || "local fallback",
      updatedAt: stored?.updated_at as string | undefined,
    };
  });

  return (
    <section className="admin-page">
      <div className="admin-status"><span /> OWNER VERIFIED</div>
      <h1>Editorial control room.</h1>
      <p>Edit the live site from here. Save a private draft or publish immediately; code changes are not required for these sections.</p>
      {saved && <p className="form-success">Section {saved === "published" ? "published live" : "saved as a draft"}.</p>}
      {error && <p className="form-error">The change could not be saved. Check the required fields and try again.</p>}
      <div className="editor-list" id="page-editor">
        {sections.map((section) => (
          <form className="editor-card" id={section.slug} action={saveSection} key={section.slug}>
            <input type="hidden" name="slug" value={section.slug} />
            <header>
              <div>
                <p className="eyebrow">{section.label}</p>
                <h2>{section.title.replace("|", " ")}</h2>
              </div>
              <p className="editor-state"><span>{section.status}</span>{section.updatedAt ? `Updated ${new Date(section.updatedAt).toLocaleDateString("en-US")}` : "Using local copy"}</p>
            </header>
            <label>Small heading<input name="eyebrow" defaultValue={section.eyebrow} maxLength={100} required /></label>
            <label>Main heading<input name="title" defaultValue={section.title} maxLength={240} required /></label>
            <label>Short introduction<input name="summary" defaultValue={section.summary} maxLength={500} /></label>
            <label>Body copy<textarea name="body" defaultValue={section.body} rows={5} maxLength={5000} /></label>
            <AdminSubmit />
          </form>
        ))}
      </div>
      <form action={signOut}><button className="text-button" type="submit">Sign out</button></form>
    </section>
  );
}
