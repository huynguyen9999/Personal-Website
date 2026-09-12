"use client";

import { useFormStatus } from "react-dom";

export function AdminSubmit() {
  const { pending } = useFormStatus();

  return (
    <div className="editor-actions">
      <button type="submit" name="status" value="draft" disabled={pending}>
        {pending ? "Saving…" : "Save draft"}
      </button>
      <button className="publish-button" type="submit" name="status" value="published" disabled={pending}>
        {pending ? "Publishing…" : "Publish live"}
      </button>
    </div>
  );
}
