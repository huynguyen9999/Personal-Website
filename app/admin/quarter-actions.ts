"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isOwnerUserId } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import {
  QUARTER_KIND,
  parseQuarterNotes,
  parseQuarterSelection,
  quarterLabel,
  quarterSlug,
} from "@/lib/quarters";

async function requireQuarterOwner() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const ownerId = typeof claims?.sub === "string" ? claims.sub : "";

  if (!ownerId || !isOwnerUserId(ownerId)) redirect("/admin?error=unauthorized");
  return { supabase, ownerId };
}

function revalidateQuarters() {
  revalidatePath("/");
  revalidatePath("/now");
  revalidatePath("/admin");
}

async function quarterExists(
  supabase: Awaited<ReturnType<typeof createClient>>,
  ownerId: string,
  slug: string,
) {
  const [{ data: published }, { data: draft }] = await Promise.all([
    supabase
      .from("content_items")
      .select("slug")
      .eq("owner_id", ownerId)
      .eq("kind", QUARTER_KIND)
      .eq("slug", slug)
      .maybeSingle(),
    supabase
      .from("content_drafts")
      .select("slug")
      .eq("owner_id", ownerId)
      .eq("kind", QUARTER_KIND)
      .eq("slug", slug)
      .maybeSingle(),
  ]);

  return Boolean(published?.slug || draft?.slug);
}

export async function createQuarter(formData: FormData) {
  const selection = parseQuarterSelection(formData);
  if (!selection) redirect("/admin?error=quarter-invalid#quarter-log");

  const { supabase, ownerId } = await requireQuarterOwner();
  const slug = quarterSlug(selection.year, selection.quarter);
  if (await quarterExists(supabase, ownerId, slug)) {
    redirect(`/admin?error=quarter-exists#${slug}`);
  }

  const now = new Date().toISOString();
  const { error } = await supabase.from("content_drafts").upsert({
    owner_id: ownerId,
    kind: QUARTER_KIND,
    slug,
    title: quarterLabel(selection.year, selection.quarter),
    summary: "",
    body: parseQuarterNotes(formData),
    updated_at: now,
  }, { onConflict: "kind,slug" });

  if (error) redirect("/admin?error=quarter-save#quarter-log");
  revalidateQuarters();
  redirect(`/admin?saved=quarter-added#${slug}`);
}

export async function saveQuarter(formData: FormData) {
  const selection = parseQuarterSelection(formData);
  if (!selection) redirect("/admin?error=quarter-invalid#quarter-log");

  const { supabase, ownerId } = await requireQuarterOwner();
  const slug = quarterSlug(selection.year, selection.quarter);
  const title = quarterLabel(selection.year, selection.quarter);
  const notes = parseQuarterNotes(formData);
  const status = formData.get("status") === "published" ? "published" : "draft";
  const now = new Date().toISOString();
  let error;

  if (status === "draft") {
    ({ error } = await supabase.from("content_drafts").upsert({
      owner_id: ownerId,
      kind: QUARTER_KIND,
      slug,
      title,
      summary: "",
      body: notes,
      updated_at: now,
    }, { onConflict: "kind,slug" }));
  } else {
    ({ error } = await supabase.from("content_items").upsert({
      owner_id: ownerId,
      kind: QUARTER_KIND,
      slug,
      title,
      summary: "",
      body: notes,
      status,
      sort_order: selection.year * 4 + selection.quarter,
      published_at: now,
      updated_at: now,
    }, { onConflict: "kind,slug" }));

    if (!error) {
      ({ error } = await supabase
        .from("content_drafts")
        .delete()
        .eq("kind", QUARTER_KIND)
        .eq("slug", slug));
    }
  }

  if (error) redirect(`/admin?error=quarter-save#${slug}`);
  revalidateQuarters();
  redirect(`/admin?saved=quarter-${status}#${slug}`);
}

export async function deleteQuarter(formData: FormData) {
  const selection = parseQuarterSelection(formData);
  if (!selection) redirect("/admin?error=quarter-invalid#quarter-log");

  const { supabase, ownerId } = await requireQuarterOwner();
  const slug = quarterSlug(selection.year, selection.quarter);
  const nowDelete = supabase
    .from("content_items")
    .delete()
    .eq("owner_id", ownerId)
    .eq("kind", QUARTER_KIND)
    .eq("slug", slug);
  const draftDelete = supabase
    .from("content_drafts")
    .delete()
    .eq("owner_id", ownerId)
    .eq("kind", QUARTER_KIND)
    .eq("slug", slug);

  const [published, draft] = await Promise.all([nowDelete, draftDelete]);
  if (published.error || draft.error) redirect(`/admin?error=quarter-save#${slug}`);
  revalidateQuarters();
  redirect("/admin?saved=quarter-removed#quarter-log");
}
