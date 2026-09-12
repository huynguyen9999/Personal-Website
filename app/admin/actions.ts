"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { editableSections, type EditableSection } from "@/lib/content";

const allowedSlugs = new Set(editableSections.map((section) => section.slug));

async function requireOwner() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const email = typeof claims?.email === "string" ? claims.email.toLowerCase() : null;
  const ownerEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const ownerId = typeof claims?.sub === "string" ? claims.sub : null;

  if (!email || !ownerEmail || email !== ownerEmail || !ownerId) redirect("/admin?error=unauthorized");
  return { supabase, ownerId };
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) redirect("/admin?error=signin");
  redirect("/admin");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin");
}

export async function saveSection(formData: FormData) {
  const slug = String(formData.get("slug") || "") as EditableSection["slug"];
  if (!allowedSlugs.has(slug)) redirect("/admin?error=invalid-section");

  const eyebrow = String(formData.get("eyebrow") || "").trim().slice(0, 100);
  const title = String(formData.get("title") || "").trim().slice(0, 240);
  const summary = String(formData.get("summary") || "").trim().slice(0, 500);
  const copy = String(formData.get("body") || "").trim().slice(0, 5000);
  const status = formData.get("status") === "published" ? "published" : "draft";
  if (!title || !eyebrow) redirect(`/admin?error=required#${slug}`);

  const { supabase, ownerId } = await requireOwner();
  const now = new Date().toISOString();
  const { data: existing } = await supabase
    .from("content_items")
    .select("id,status")
    .eq("kind", "page")
    .eq("slug", slug)
    .maybeSingle();

  let error;
  if (status === "draft" && existing?.status === "published") {
    ({ error } = await supabase.from("content_items").update({
      draft_title: title,
      draft_summary: summary,
      draft_body: { eyebrow, copy },
      updated_at: now,
    }).eq("id", existing.id));
  } else {
    ({ error } = await supabase.from("content_items").upsert({
      owner_id: ownerId,
      kind: "page",
      slug,
      title,
      summary,
      body: { eyebrow, copy },
      status,
      draft_title: status === "published" ? null : title,
      draft_summary: status === "published" ? null : summary,
      draft_body: status === "published" ? null : { eyebrow, copy },
      published_at: status === "published" ? now : null,
      updated_at: now,
    }, { onConflict: "kind,slug" }));
  }

  if (error) redirect(`/admin?error=save#${slug}`);
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin");
  redirect(`/admin?saved=${status}#${slug}`);
}
