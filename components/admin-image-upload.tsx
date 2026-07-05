"use client";

import { useState } from "react";

const maxImageBytes = 2 * 1024 * 1024;

type AdminImageUploadProps = {
  enabled: boolean;
  folder: string;
  onUploaded: (url: string) => void;
  onUploadedMany?: (urls: string[]) => void;
  accept?: string;
  buttonLabel?: string;
  fieldLabel?: string;
  kind?: "image" | "document";
  multiple?: boolean;
};

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

function loadImageElement(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Unable to read this image."));
    };

    image.src = objectUrl;
  });
}

function renderCanvasBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Unable to prepare this image."));
          return;
        }

        resolve(blob);
      },
      "image/webp",
      quality
    );
  });
}

async function optimizeImageFile(file: File) {
  const image = await loadImageElement(file);
  let width = image.naturalWidth;
  let height = image.naturalHeight;
  const maxDimension = 2200;
  const initialScale = Math.min(1, maxDimension / Math.max(width, height));

  width = Math.max(1, Math.round(width * initialScale));
  height = Math.max(1, Math.round(height * initialScale));

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Image optimization is not available in this browser.");
  }

  let blob: Blob | null = null;

  while (true) {
    canvas.width = width;
    canvas.height = height;
    context.clearRect(0, 0, width, height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, 0, 0, width, height);

    for (const quality of [0.86, 0.8, 0.74, 0.68, 0.62, 0.56]) {
      blob = await renderCanvasBlob(canvas, quality);

      if (blob.size <= maxImageBytes) {
        return new File(
          [blob],
          `${file.name.replace(/\.[^.]+$/, "") || "image"}.webp`,
          { type: "image/webp" }
        );
      }
    }

    if (Math.max(width, height) <= 1200) {
      break;
    }

    width = Math.max(1, Math.round(width * 0.84));
    height = Math.max(1, Math.round(height * 0.84));
  }

  throw new Error("Please choose a smaller image. It is still above 2MB after optimization.");
}

export function AdminImageUpload({
  enabled,
  folder,
  onUploaded,
  onUploadedMany,
  accept = "image/*",
  buttonLabel = "Upload Image",
  fieldLabel = "Image Upload",
  kind = "image",
  multiple = false
}: AdminImageUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [inputKey, setInputKey] = useState(0);
  const firstSelectedFile = selectedFiles[0];

  async function uploadSelectedFiles() {
    if (selectedFiles.length === 0 || uploading || !enabled) {
      return;
    }

    setUploading(true);
    setMessage("");
    setError("");

    try {
      const uploadedUrls: string[] = [];
      let lastUploadedSize = 0;

      for (const selectedFile of selectedFiles) {
        const fileToUpload =
          kind === "image" ? await optimizeImageFile(selectedFile) : selectedFile;
        const formData = new FormData();
        formData.append("file", fileToUpload);
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

        uploadedUrls.push(result.url);
        lastUploadedSize = fileToUpload.size;
      }

      if (uploadedUrls.length === 0) {
        setError(`${fieldLabel} failed.`);
        return;
      }

      if (multiple && onUploadedMany) {
        onUploadedMany(uploadedUrls);
      } else {
        onUploaded(uploadedUrls[0]);
      }

      setSelectedFiles([]);
      setInputKey((current) => current + 1);
      if (kind === "image") {
        setMessage(
          uploadedUrls.length > 1
            ? `${fieldLabel} complete. ${uploadedUrls.length} images uploaded.`
            : `${fieldLabel} complete. Optimized to ${formatFileSize(lastUploadedSize)}.`
        );
      } else {
        setMessage(`${fieldLabel} complete.`);
      }
    } catch {
      setError(
        kind === "image"
          ? "Image upload failed. Please use a smaller image or try again."
          : `${fieldLabel} failed.`
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="admin-upload">
      <label className="admin-field">
        <span>{fieldLabel}</span>
        <input
          key={inputKey}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={!enabled || uploading}
          onChange={(event) => setSelectedFiles(Array.from(event.target.files ?? []))}
        />
      </label>
      <button
        type="button"
        className="button button--secondary"
        disabled={!enabled || selectedFiles.length === 0 || uploading}
        onClick={uploadSelectedFiles}
      >
        {uploading ? "Uploading..." : buttonLabel}
      </button>
      {!enabled ? (
        <p className="admin-hint">Add Supabase keys to enable uploads on Netlify.</p>
      ) : null}
      {kind === "image" ? (
        <p className="admin-hint">Images are converted to WebP and kept under 2MB before upload.</p>
      ) : null}
      {selectedFiles.length > 0 ? (
        <p className="admin-hint">
          Selected:{" "}
          {selectedFiles.length === 1
            ? `${firstSelectedFile?.name ?? "file"} · ${formatFileSize(firstSelectedFile?.size ?? 0)}`
            : `${selectedFiles.length} files ready for upload`}
        </p>
      ) : null}
      {message ? <p className="admin-hint">{message}</p> : null}
      {error ? <p className="admin-hint admin-hint--error">{error}</p> : null}
    </div>
  );
}
