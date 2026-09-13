"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isOwnerEmail, normalizeAdminEmail } from "@/lib/admin";
import {
  authAttemptLimiter,
  clientIpFromHeaders,
  hashClientKey,
  inspectAuthForm,
  isWeakSignUpPassword,
} from "@/lib/auth-guard";
import { createClient } from "@/lib/supabase/server";
import { editableSections, type EditableSection } from "@/lib/content";
import { MEDIA_BUCKET, parseMediaPlacement } from "@/lib/media";

const allowedSlugs = new Set(editableSections.map((section) => section.slug));

async function clientKeyFromRequest() {
  return hashClientKey(clientIpFromHeaders(await headers()));
}

async function beginAuthAttempt() {
  const clientKey = await clientKeyFromRequest();
  const decision = authAttemptLimiter.consume(clientKey);
  if (!decision.ok) redirect("/admin?error=limited");
  return clientKey;
}

async function getOwner() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const email = typeof claims?.email === "string" ? normalizeAdminEmail(claims.email) : null;
  const ownerId = typeof claims?.sub === "string" ? claims.sub : null;

  if (!email || !isOwnerEmail(email) || !ownerId) return { error: "unauthorized" as const };
  return { supabase, ownerId };
}

async function requireOwner() {
  const owner = await getOwner();
  if ("error" in owner) redirect("/admin?error=unauthorized");
  return owner;
}

function revalidatePublic() {
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/writing");
  revalidatePath("/now");
  revalidatePath("/contact");
  revalidatePath("/admin");
}

export async function signIn(formData: FormData) {
  const clientKey = await beginAuthAttempt();
  const form = inspectAuthForm(formData);
  if (!form.ok) redirect("/admin?error=failed");

  const email = normalizeAdminEmail(form.email);
  if (!isOwnerEmail(email)) redirect("/admin?error=failed");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password: form.password });
  if (error) redirect("/admin?error=failed");

  authAttemptLimiter.clear(clientKey);
  redirect("/admin");
}

export async function signUp(formData: FormData) {
  const clientKey = await beginAuthAttempt();
  const form = inspectAuthForm(formData);
  if (!form.ok) redirect("/admin?error=failed");

  const email = normalizeAdminEmail(form.email);
  if (!isOwnerEmail(email)) redirect("/admin?error=failed");
  if (isWeakSignUpPassword(form.password)) redirect("/admin?error=password");

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thehobbiest.vercel.app";
  const { data, error } = await supabase.auth.signUp({
    email,
    password: form.password,
    options: { emailRedirectTo: `${siteUrl}/admin` },
  });

  if (error) redirect("/admin?error=failed");
  authAttemptLimiter.clear(clientKey);
  redirect(data.session ? "/admin" : "/admin?notice=check-email");
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
  const accentTitle = String(formData.get("accentTitle") || "").trim().slice(0, 240);
  const summary = String(formData.get("summary") || "").trim().slice(0, 500);
  const copy = String(formData.get("body") || "").trim().slice(0, 5000);
  const status = formData.get("status") === "published" ? "published" : "draft";
  if (!title || !eyebrow) redirect(`/admin?error=required#${slug}`);

  const { supabase, ownerId } = await requireOwner();
  const now = new Date().toISOString();
  let error;
  if (status === "draft") {
    ({ error } = await supabase.from("content_drafts").upsert({
      owner_id: ownerId,
      kind: "page",
      slug,
      title,
      summary,
      body: { eyebrow, accentTitle, copy },
      updated_at: now,
    }, { onConflict: "kind,slug" }));
  } else {
    ({ error } = await supabase.from("content_items").upsert({
      owner_id: ownerId,
      kind: "page",
      slug,
      title,
      summary,
      body: { eyebrow, accentTitle, copy },
      status,
      published_at: now,
      updated_at: now,
    }, { onConflict: "kind,slug" }));

    if (!error) {
      ({ error } = await supabase
        .from("content_drafts")
        .delete()
        .eq("kind", "page")
        .eq("slug", slug));
    }
  }

  if (error) redirect(`/admin?error=save#${slug}`);
  revalidatePublic();
  redirect(`/admin?saved=${status}#${slug}`);
}

export async function registerMedia(formData: FormData) {
  const owner = await getOwner();
  if ("error" in owner) return { error: "Sign in again as the owner before uploading." };

  const storagePath = String(formData.get("storagePath") || "").trim();
  if (!storagePath.startsWith(`${owner.ownerId}/`) || storagePath.includes("..")) {
    return { error: "That file path is not allowed." };
  }

  const placement = parseMediaPlacement(formData);
  const { error } = await owner.supabase.from("media_assets").insert({
    owner_id: owner.ownerId,
    storage_path: storagePath,
    page: placement.page,
    slot: placement.slot,
    alt: placement.alt,
    caption: placement.caption,
  });

  if (error) return { error: error.message };
  revalidatePublic();
  return { error: null };
}

export async function placeMedia(formData: FormData) {
  const id = String(formData.get("id") || "").trim();
  if (!id) redirect("/admin?error=media#media-uploader-title");

  const { supabase, ownerId } = await requireOwner();
  const placement = parseMediaPlacement(formData);
  const { error } = await supabase
    .from("media_assets")
    .update({
      page: placement.page,
      slot: placement.slot,
      alt: placement.alt,
      caption: placement.caption,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("owner_id", ownerId);

  if (error) redirect("/admin?error=media#media-uploader-title");
  revalidatePublic();
  redirect("/admin?saved=placed#media-uploader-title");
}

export async function deleteMedia(formData: FormData) {
  const id = String(formData.get("id") || "").trim();
  if (!id) redirect("/admin?error=media#media-uploader-title");

  const { supabase, ownerId } = await requireOwner();
  const { data } = await supabase
    .from("media_assets")
    .select("storage_path")
    .eq("id", id)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (data?.storage_path) {
    await supabase.storage.from(MEDIA_BUCKET).remove([data.storage_path]);
  }

  const { error } = await supabase
    .from("media_assets")
    .delete()
    .eq("id", id)
    .eq("owner_id", ownerId);

  if (error) redirect("/admin?error=media#media-uploader-title");
  revalidatePublic();
  redirect("/admin?saved=removed#media-uploader-title");
}