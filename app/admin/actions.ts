"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isOwnerUserId } from "@/lib/admin";
import { inspectAuthForm } from "@/lib/auth-guard";
import { createClient } from "@/lib/supabase/server";
import { editableSections, getFallbackSection, type EditableSection } from "@/lib/content";
import { isHomeFaqSlug } from "@/lib/faq";
import { MEDIA_BUCKET, MEDIA_STAGING_BUCKET, parseMediaPlacement } from "@/lib/media";

const allowedSlugs = new Set(editableSections.map((section) => section.slug));

async function getOwner() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const ownerId = typeof claims?.sub === "string" ? claims.sub : null;

  if (!ownerId || !isOwnerUserId(ownerId)) return { error: "unauthorized" as const };
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
  revalidatePath("/now");
  revalidatePath("/contact");
  revalidatePath("/admin");
}

export async function signIn(formData: FormData) {
  const form = inspectAuthForm(formData);
  if (!form.ok) redirect("/admin?error=failed");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
  if (error) redirect("/admin?error=failed");

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

  const fallback = getFallbackSection(slug);
  const eyebrow = (isHomeFaqSlug(slug)
    ? fallback.eyebrow
    : String(formData.get("eyebrow") || "").trim()).slice(0, 100);
  const title = (isHomeFaqSlug(slug)
    ? fallback.title
    : String(formData.get("title") || "").trim()).slice(0, 240);
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
  if (!placement.page || !placement.slot) {
    return { error: "Choose a page and location before uploading." };
  }

  const { data: stagedFile, error: downloadError } = await owner.supabase.storage
    .from(MEDIA_STAGING_BUCKET)
    .download(storagePath);
  if (downloadError || !stagedFile) return { error: "The private upload could not be found. Try again." };

  const { error: publishError } = await owner.supabase.storage
    .from(MEDIA_BUCKET)
    .upload(storagePath, stagedFile, {
      cacheControl: "31536000",
      contentType: stagedFile.type || undefined,
      upsert: false,
    });
  if (publishError) return { error: "The image could not be published. Try again." };

  const { error } = await owner.supabase.from("media_assets").insert({
    owner_id: owner.ownerId,
    storage_path: storagePath,
    page: placement.page,
    slot: placement.slot,
    alt: placement.alt,
    caption: placement.caption,
  });

  if (error) {
    await owner.supabase.storage.from(MEDIA_BUCKET).remove([storagePath]);
    return { error: "The image could not be placed. Try again." };
  }

  await owner.supabase.storage.from(MEDIA_STAGING_BUCKET).remove([storagePath]);
  revalidatePublic();
  return { error: null };
}

export async function placeMedia(formData: FormData) {
  const id = String(formData.get("id") || "").trim();
  if (!id) redirect("/admin?error=media#media-uploader-title");

  const { supabase, ownerId } = await requireOwner();
  const placement = parseMediaPlacement(formData);
  if (!placement.page || !placement.slot) redirect("/admin?error=media#media-uploader-title");
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

export async function deleteUnplacedMedia() {
  const { supabase, ownerId } = await requireOwner();
  const { data, error: findError } = await supabase
    .from("media_assets")
    .select("id,storage_path")
    .eq("owner_id", ownerId)
    .or("page.is.null,slot.is.null");

  if (findError) redirect("/admin?error=media#media-uploader-title");
  const files = (data || []).map((item) => item.storage_path).filter(Boolean);
  const ids = (data || []).map((item) => item.id);
  if (!ids.length) redirect("/admin?saved=legacy-media-empty#media-uploader-title");

  const { error: storageError } = await supabase.storage.from(MEDIA_BUCKET).remove(files);
  if (storageError) redirect("/admin?error=media#media-uploader-title");

  const { error } = await supabase.from("media_assets").delete().in("id", ids).eq("owner_id", ownerId);
  if (error) redirect("/admin?error=media#media-uploader-title");
  revalidatePublic();
  redirect("/admin?saved=legacy-media-removed#media-uploader-title");
}
