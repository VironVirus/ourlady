"use client";

import { useState } from "react";

type AdminImageUploadProps = {
  enabled: boolean;
  folder: string;
  onUploaded: (url: string) => void;
  accept?: string;
  buttonLabel?: string;
  fieldLabel?: string;
  kind?: "image" | "document";
};

export function AdminImageUpload({
  enabled,
  folder,
  onUploaded,
  accept = "image/*",
  buttonLabel = "Upload Image",
  fieldLabel = "Image Upload",
  kind = "image"
}: AdminImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  async function uploadSelectedFile() {
    if (!selectedFile || uploading || !enabled) {
      return;
    }

    setUploading(true);
    setMessage("");
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("folder", folder);
      formData.append("kind", kind);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData
      });
      const result = (await response.json()) as {
        error?: string;
        url?: string;
      };

      if (!response.ok || !result.url) {
        setError(result.error ?? `${fieldLabel} failed.`);
        return;
      }

      onUploaded(result.url);
      setSelectedFile(null);
      setMessage(`${fieldLabel} complete.`);
    } catch {
      setError(`${fieldLabel} failed.`);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="admin-upload">
      <label className="admin-field">
        <span>{fieldLabel}</span>
        <input
          type="file"
          accept={accept}
          disabled={!enabled || uploading}
          onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
        />
      </label>
      <button
        type="button"
        className="button button--secondary"
        disabled={!enabled || !selectedFile || uploading}
        onClick={uploadSelectedFile}
      >
        {uploading ? "Uploading..." : buttonLabel}
      </button>
      {!enabled ? (
        <p className="admin-hint">Add Supabase keys to enable uploads on Netlify.</p>
      ) : null}
      {message ? <p className="admin-hint">{message}</p> : null}
      {error ? <p className="admin-hint admin-hint--error">{error}</p> : null}
    </div>
  );
}
