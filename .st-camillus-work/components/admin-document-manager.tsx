"use client";

import Link from "next/link";
import { useState } from "react";
import { AdminImageUpload } from "@/components/admin-image-upload";
import { DocumentIcon, PlusIcon } from "@/components/site-icons";
import type { ParishDocument } from "@/lib/documents";

type AdminDocumentManagerProps = {
  initialItems: ParishDocument[];
  uploadsEnabled: boolean;
};

function createDraft(): ParishDocument {
  return {
    id: `document-${Date.now()}`,
    slug: "",
    title: "",
    category: "Bulletin",
    summary: "",
    date: "",
    fileUrl: "",
    coverImage: "",
    published: true,
    createdAt: "",
    updatedAt: ""
  };
}

export function AdminDocumentManager({
  initialItems,
  uploadsEnabled
}: AdminDocumentManagerProps) {
  const [items, setItems] = useState(initialItems);
  const [selectedId, setSelectedId] = useState(initialItems[0]?.id ?? "");
  const [draft, setDraft] = useState(createDraft);
  const [creating, setCreating] = useState(initialItems.length === 0);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const activeItem = creating
    ? draft
    : items.find((item) => item.id === selectedId) ?? null;

  function resetNotice() {
    setMessage("");
    setError("");
  }

  function selectItem(id: string) {
    setSelectedId(id);
    setCreating(false);
    resetNotice();
  }

  function startNew() {
    setDraft(createDraft());
    setCreating(true);
    setSelectedId("");
    resetNotice();
  }

  function updateActive(key: keyof ParishDocument, value: string | boolean) {
    if (creating) {
      setDraft((current) => ({
        ...current,
        [key]: value
      }));
      return;
    }

    setItems((current) =>
      current.map((item) =>
        item.id === selectedId
          ? {
              ...item,
              [key]: value
            }
          : item
      )
    );
  }

  async function saveCurrent() {
    if (!activeItem || saving) {
      return;
    }

    setSaving(true);
    resetNotice();

    try {
      const response = await fetch("/api/admin/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(activeItem)
      });
      const result = (await response.json()) as {
        error?: string;
        item?: ParishDocument;
      };

      if (!response.ok || !result.item) {
        setError(result.error ?? "Unable to save this document.");
        return;
      }

      setItems((current) => {
        const others = current.filter((item) => item.id !== result.item?.id);
        return [result.item!, ...others];
      });
      setSelectedId(result.item.id);
      setCreating(false);
      setMessage("Document saved.");
    } catch {
      setError("Unable to save this document.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteCurrent() {
    if (!activeItem || creating || deleting) {
      return;
    }

    setDeleting(true);
    resetNotice();

    try {
      const response = await fetch(`/api/admin/documents/${activeItem.id}`, {
        method: "DELETE"
      });
      const result = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        setError(result.error ?? "Unable to remove this document.");
        return;
      }

      const nextItems = items.filter((item) => item.id !== activeItem.id);
      setItems(nextItems);
      if (nextItems[0]) {
        setSelectedId(nextItems[0].id);
      } else {
        setSelectedId("");
        setCreating(true);
        setDraft(createDraft());
      }
      setMessage("Document removed.");
    } catch {
      setError("Unable to remove this document.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="admin-manager">
      <aside className="admin-manager__list">
        <div className="admin-manager__toolbar">
          <div>
            <div className="eyebrow">Library</div>
            <h2>Bulletins & Events</h2>
          </div>
          <button type="button" className="button button--secondary" onClick={startNew}>
            <PlusIcon className="icon icon--tiny" />
            Add File
          </button>
        </div>

        <div className="admin-record-list">
          {items.length === 0 ? (
            <div className="admin-card admin-card--empty">
              <p className="admin-hint">No files yet. Add a bulletin or event document.</p>
            </div>
          ) : null}

          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`admin-record-item${!creating && selectedId === item.id ? " is-active" : ""}`}
              onClick={() => selectItem(item.id)}
            >
              <span>{item.category}</span>
              <strong>{item.title || "Untitled document"}</strong>
              <small>
                {item.date || "No date"} {item.published ? "· Published" : "· Draft"}
              </small>
            </button>
          ))}
        </div>
      </aside>

      <section className="admin-manager__editor">
        <div className="admin-manager__editor-head">
          <div>
            <div className="eyebrow">Editor</div>
            <h2>{creating ? "Add Document" : activeItem?.title || "Edit Document"}</h2>
            <p>Upload a bulletin or special event file and keep it easy to find.</p>
          </div>
          <div className="admin-manager__actions">
            <Link href="/documents" className="button button--secondary">
              Open Public Page
            </Link>
            {!creating ? (
              <button
                type="button"
                className="button button--secondary"
                disabled={deleting}
                onClick={deleteCurrent}
              >
                {deleting ? "Removing..." : "Delete"}
              </button>
            ) : null}
            <button
              type="button"
              className="button button--primary"
              disabled={saving}
              onClick={saveCurrent}
            >
              {saving ? "Saving..." : creating ? "Add Document" : "Save Changes"}
            </button>
          </div>
        </div>

        {message ? <div className="admin-banner">{message}</div> : null}
        {error ? <div className="admin-banner admin-banner--error">{error}</div> : null}

        {activeItem ? (
          <>
            <div className="admin-grid">
              <label className="admin-field">
                <span>Category</span>
                <select
                  value={activeItem.category}
                  onChange={(event) => updateActive("category", event.target.value)}
                >
                  <option value="Bulletin">Bulletin</option>
                  <option value="Special Event">Special Event</option>
                </select>
              </label>
              <label className="admin-field">
                <span>Date</span>
                <input
                  value={activeItem.date}
                  onChange={(event) => updateActive("date", event.target.value)}
                />
              </label>
              <label className="admin-field">
                <span>Status</span>
                <select
                  value={activeItem.published ? "published" : "draft"}
                  onChange={(event) =>
                    updateActive("published", event.target.value === "published")
                  }
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </label>
              <label className="admin-field admin-field--full">
                <span>Title</span>
                <input
                  value={activeItem.title}
                  onChange={(event) => updateActive("title", event.target.value)}
                />
              </label>
              <label className="admin-field admin-field--full">
                <span>Summary</span>
                <textarea
                  rows={4}
                  value={activeItem.summary}
                  onChange={(event) => updateActive("summary", event.target.value)}
                />
              </label>
              <label className="admin-field admin-field--full">
                <span>Document Link</span>
                <input
                  value={activeItem.fileUrl}
                  onChange={(event) => updateActive("fileUrl", event.target.value)}
                />
              </label>
              <label className="admin-field admin-field--full">
                <span>Cover Image Link</span>
                <input
                  value={activeItem.coverImage ?? ""}
                  onChange={(event) => updateActive("coverImage", event.target.value)}
                />
              </label>
            </div>

            <div className="admin-upload-pair">
              <AdminImageUpload
                enabled={uploadsEnabled}
                folder="documents/files"
                kind="document"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                fieldLabel="Document Upload"
                buttonLabel="Upload Document"
                onUploaded={(url) => updateActive("fileUrl", url)}
              />
              <AdminImageUpload
                enabled={uploadsEnabled}
                folder="documents/covers"
                fieldLabel="Cover Image Upload"
                buttonLabel="Upload Cover"
                onUploaded={(url) => updateActive("coverImage", url)}
              />
            </div>

            <div className="admin-document-preview">
              <div className="admin-document-preview__card">
                <span className="section-badge">
                  <DocumentIcon className="icon" />
                  {activeItem.category}
                </span>
                <h3>{activeItem.title || "Document title"}</h3>
                <p>{activeItem.summary || "Document summary will appear here."}</p>
                <div className="story-card__meta">
                  <span>{activeItem.date || "Date"}</span>
                </div>
              </div>
              {activeItem.fileUrl ? (
                <Link href={activeItem.fileUrl} target="_blank" className="text-link">
                  Open uploaded file
                </Link>
              ) : null}
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}
