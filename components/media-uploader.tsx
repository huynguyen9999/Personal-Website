"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  MEDIA_BUCKET,
  mediaPages,
  mediaSlots,
  slotsForPage,
  type PlacedPhoto,
} from "@/lib/media";
import { deleteMedia, placeMedia, registerMedia } from "@/app/admin/actions";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const MAX_FILES = 12;
const ALLOWED_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["image/avif", "avif"],
  ["image/heic", "heic"],
  ["image/heif", "heif"],
]);

type UploadStatus = "ready" | "uploading" | "uploaded" | "error";

type UploadItem = {
  id: string;
  file: File;
  previewUrl: string;
  status: UploadStatus;
  error?: string;
};

function safeStem(filename: string) {
  const stem = filename.replace(/\.[^.]+$/, "");
  return stem
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "photo";
}

function makeObjectPath(userId: string, file: File) {
  const extension = ALLOWED_TYPES.get(file.type) ?? "image";
  return `${userId}/${Date.now()}-${crypto.randomUUID()}-${safeStem(file.name)}.${extension}`;
}

function SlotFields({
  pageValue,
  slotValue,
}: {
  pageValue?: string;
  slotValue?: string;
}) {
  const [page, setPage] = useState(pageValue ?? "");
  const availableSlots = page ? slotsForPage(page) : mediaSlots;

  return (
    <>
      <label>
        Page
        <select name="page" value={page} onChange={(event) => setPage(event.target.value)}>
          <option value="">Hidden until placed</option>
          {mediaPages.map((item) => (
            <option value={item.id} key={item.id}>{item.label}</option>
          ))}
        </select>
      </label>
      <label>
        Location on that page
        <select name="slot" defaultValue={slotValue ?? ""} key={page}>
          <option value="">Choose a location</option>
          {availableSlots.map((item) => (
            <option value={item.id} key={`${item.page}-${item.id}`}>
              {page ? item.label : `${mediaPages.find((entry) => entry.id === item.page)?.label} · ${item.label}`}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}

export function MediaUploader({ initialMedia }: { initialMedia: PlacedPhoto[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef<string[]>([]);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlsRef.current = [];
    };
  }, []);

  function chooseFiles(files: FileList | null) {
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current = [];
    setMessage("");

    const selected = Array.from(files ?? []).slice(0, MAX_FILES);
    const nextItems = selected.map((file): UploadItem => {
      const previewUrl = URL.createObjectURL(file);
      objectUrlsRef.current.push(previewUrl);

      if (!ALLOWED_TYPES.has(file.type)) {
        return {
          id: crypto.randomUUID(),
          file,
          previewUrl,
          status: "error",
          error: "Use JPEG, PNG, WebP, GIF, AVIF, HEIC, or HEIF.",
        };
      }

      if (file.size > MAX_FILE_SIZE) {
        return {
          id: crypto.randomUUID(),
          file,
          previewUrl,
          status: "error",
          error: "This image is larger than 8 MB.",
        };
      }

      return { id: crypto.randomUUID(), file, previewUrl, status: "ready" };
    });

    setItems(nextItems);
    if ((files?.length ?? 0) > MAX_FILES) {
      setMessage(`Only the first ${MAX_FILES} images were added.`);
    }
  }

  function updateItem(id: string, change: Partial<UploadItem>) {
    setItems((current) =>
      current.map((item) => item.id === id ? { ...item, ...change } : item),
    );
  }

  async function uploadSelected() {
    const pendingItems = items.filter((item) => item.status === "ready");
    if (!pendingItems.length || uploading) return;

    setUploading(true);
    setMessage("");
    const supabase = createClient();
    const { data, error: claimsError } = await supabase.auth.getClaims();
    const userId = typeof data?.claims?.sub === "string" ? data.claims.sub : null;

    if (claimsError || !userId) {
      setMessage("Your owner session expired. Sign in again before uploading.");
      setUploading(false);
      return;
    }

    const form = document.getElementById("new-media-placement") as HTMLFormElement | null;
    const formData = form ? new FormData(form) : new FormData();
    let uploadedCount = 0;

    for (const item of pendingItems) {
      updateItem(item.id, { status: "uploading", error: undefined });
      const objectPath = makeObjectPath(userId, item.file);
      const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(objectPath, item.file, {
        cacheControl: "31536000",
        contentType: item.file.type,
        upsert: false,
      });

      if (error) {
        updateItem(item.id, { status: "error", error: error.message });
        continue;
      }

      formData.set("storagePath", objectPath);
      const registered = await registerMedia(formData);
      if (registered?.error) {
        updateItem(item.id, { status: "error", error: registered.error });
        continue;
      }

      uploadedCount += 1;
      updateItem(item.id, { status: "uploaded" });
    }

    setMessage(
      uploadedCount === pendingItems.length
        ? `${uploadedCount} ${uploadedCount === 1 ? "image" : "images"} uploaded. They appear on the chosen page after placement.`
        : `${uploadedCount} of ${pendingItems.length} images uploaded. Review the errors below.`,
    );
    setUploading(false);
    router.refresh();
  }

  const completed = items.filter((item) => item.status === "uploaded" || item.status === "error").length;
  const uploadable = items.some((item) => item.status === "ready");

  return (
    <section className="media-uploader" aria-labelledby="media-uploader-title">
      <header className="media-uploader__header">
        <div>
          <p className="eyebrow">PHOTOS / PLACEMENT</p>
          <h2 id="media-uploader-title">Upload from your Mac, then choose the page.</h2>
        </div>
        <p>Pick files in Finder, choose a page and location, and the public site updates without a code change. JPEG, PNG, WebP, GIF, AVIF, HEIC, or HEIF · 8 MB maximum per image.</p>
      </header>

      <form id="new-media-placement" className="media-uploader__placement">
        <SlotFields />
        <label>
          Alt text
          <input name="alt" maxLength={200} placeholder="Describe the photo" />
        </label>
        <label>
          Caption
          <input name="caption" maxLength={240} placeholder="Optional caption on the page" />
        </label>
      </form>

      <input
        ref={inputRef}
        className="media-uploader__input"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/heic,image/heif"
        multiple
        onChange={(event) => chooseFiles(event.target.files)}
      />
      <div className="media-uploader__controls">
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}>
          Choose photos
        </button>
        <button
          className="publish-button"
          type="button"
          onClick={uploadSelected}
          disabled={!uploadable || uploading}
        >
          {uploading ? "Uploading…" : "Upload selected"}
        </button>
      </div>

      {uploading && (
        <div className="media-uploader__progress" aria-live="polite">
          <progress value={completed} max={items.length}>Uploading images</progress>
          <span>{completed} of {items.length} processed</span>
        </div>
      )}
      {message && <p className="media-uploader__message" aria-live="polite">{message}</p>}

      {items.length > 0 && (
        <ul className="media-uploader__grid" aria-label="Selected images">
          {items.map((item) => (
            <li className={`media-uploader__item is-${item.status}`} key={item.id}>
              <Image src={item.previewUrl} alt={`Preview of ${item.file.name}`} width={640} height={480} unoptimized />
              <div>
                <strong>{item.file.name}</strong>
                <span>{(item.file.size / 1024 / 1024).toFixed(1)} MB · {item.status}</span>
                {item.error && <p className="form-error">{item.error}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}

      {initialMedia.length > 0 && (
        <div className="media-library">
          <p className="eyebrow">LIBRARY / {initialMedia.length}</p>
          <ul className="media-uploader__grid" aria-label="Uploaded media library">
            {initialMedia.map((item) => (
              <li className={`media-uploader__item ${item.page && item.slot ? "is-uploaded" : ""}`} key={item.id}>
                <Image src={item.url} alt={item.alt || item.storagePath} width={640} height={480} unoptimized />
                <form className="media-placement-form" action={placeMedia}>
                  <input type="hidden" name="id" value={item.id} />
                  <strong>{item.alt || item.storagePath.split("/").at(-1)}</strong>
                  <SlotFields pageValue={item.page ?? ""} slotValue={item.slot ?? ""} />
                  <label>
                    Alt text
                    <input name="alt" defaultValue={item.alt} maxLength={200} />
                  </label>
                  <label>
                    Caption
                    <input name="caption" defaultValue={item.caption} maxLength={240} />
                  </label>
                  <div className="media-placement-form__actions">
                    <button className="publish-button" type="submit">Place on site</button>
                    <button type="submit" formAction={deleteMedia}>Delete</button>
                  </div>
                </form>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
