import type { Metadata } from "next";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { signIn, signOut } from "./actions";

export const metadata: Metadata = {
  title: "Editor",
  robots: { index: false, follow: false },
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  if (!hasSupabaseConfig()) {
    return (
      <section className="admin-page">
        <div className="admin-status"><span /> SETUP REQUIRED</div>
        <h1>The control room is structurally ready.</h1>
        <p>Connect the Supabase project to enable owner sign-in, drafts, publishing, media, and normal content updates from the browser.</p>
        <div className="admin-grid">
          {['Homepage', 'Story', 'Writing', 'Work', 'Now', 'Media'].map((item) => (
            <div className="admin-module" key={item}><span>{item}</span><small>Awaiting connection</small></div>
          ))}
        </div>
      </section>
    );
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const signedInEmail = typeof data?.claims?.email === "string" ? data.claims.email : null;
  const allowedEmail = process.env.ADMIN_EMAIL;
  const isOwner = Boolean(signedInEmail && allowedEmail && signedInEmail === allowedEmail);

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
      </section>
    );
  }

  return (
    <section className="admin-page">
      <div className="admin-status"><span /> OWNER VERIFIED</div>
      <h1>Editorial control room.</h1>
      <p>The content model is connected. Editors for individual content types are the next implementation slice.</p>
      <div className="admin-grid">
        {['Homepage', 'Story', 'Writing', 'Work', 'Now', 'Media'].map((item) => (
          <div className="admin-module" key={item}><span>{item}</span><small>Ready for editor UI</small></div>
        ))}
      </div>
      <form action={signOut}><button className="text-button" type="submit">Sign out</button></form>
    </section>
  );
}
