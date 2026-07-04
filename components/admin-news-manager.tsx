"use client";

import Link from "next/link";
import { useState } from "react";
import { AdminImageUpload } from "@/components/admin-image-upload";
import { HeartIcon, PlusIcon, ShareIcon, SparkIcon } from "@/components/site-icons";
import type { NewsPost } from "@/lib/news";

type AdminNewsManagerProps = {
  initialItems: NewsPost[];
  uploadsEnabled: boolean;
};

function createDraft(): NewsPost {
  return {
    id: `news-${Date.now()}`,
    slug: "",
    label: "News",
    title: "",
    description: "",
    excerpt: "",
    content: "",
    date: "",
    location: "",
    image: "",
    published: true,
    likes: 0,
    createdAt: "",
    updatedAt: ""
  };
}

export function AdminNewsManager({
  initialItems,
  uploadsEnabled
}: AdminNewsManagerProps) {
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
  const storyUrl = activeItem?.slug ? `/news/${activeItem.slug}` : "";

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

  function updateActive(key: keyof NewsPost, value: string | boolean | number) {
    if (creating) {
      setDraft((current) => {
        const next = {
          ...current,
          [key]: value
        };

        if (key === "excerpt" && typeof value === "string") {
          next.description = value;
        }

        return next;
      });

      return;
    }

    setItems((current) =>
      current.map((item) => {
        if (item.id !== selectedId) {
          return item;
        }

        const next = {
          ...item,
          [key]: value
        };

        if (key === "excerpt" && typeof value === "string") {
          next.description = value;
        }

        return next;
      })
    );
  }

  async function saveCurrent() {
    if (!activeItem || saving) {
      return;
    }

    setSaving(true);
    resetNotice();

    try {
      const response = await fetch("/api/admin/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...activeItem,
          description: activeItem.excerpt,
          previousSlug: creating
            ? ""
            : items.find((item) => item.id === activeItem.id)?.slug ?? ""
        })
      });
      const result = (await response.json()) as {
        error?: string;
        item?: NewsPost;
      };

      if (!response.ok || !result.item) {
        setError(result.error ?? "Unable to save this story.");
        return;
      }

      setItems((current) => {
        const others = current.filter((item) => item.id !== result.item?.id);
        return [result.item!, ...others];
      });
      setSelectedId(result.item.id);
      setCreating(false);
      setMessage("News story saved.");
    } catch {
      setError("Unable to save this story.");
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
      const response = await fetch(`/api/admin/news/${activeItem.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          slug: activeItem.slug
        })
      });
      const result = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        setError(result.error ?? "Unable to remove this story.");
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
      setMessage("News story removed.");
    } catch {
      setError("Unable to remove this story.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="admin-manager">
      <aside className="admin-manager__list">
        <div className="admin-manager__toolbar">
          <div>
            <div className="eyebrow">Stories</div>
            <h2>News Library</h2>
          </div>
          <button type="button" className="button button--secondary" onClick={startNew}>
            <PlusIcon className="icon icon--tiny" />
            Add News
          </button>
        </div>

        <div className="admin-record-list">
          {items.length === 0 ? (
            <div className="admin-card admin-card--empty">
              <p className="admin-hint">No news stories yet. Start with a new one.</p>
            </div>
          ) : null}

          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`admin-record-item${!creating && selectedId === item.id ? " is-active" : ""}`}
              onClick={() => selectItem(item.id)}
            >
              <span>{item.published ? "Published" : "Draft"}</span>
              <strong>{item.title || "Untitled story"}</strong>
              <small>
                {item.date || "No date"} {item.location ? `· ${item.location}` : ""}
              </small>
            </button>
          ))}
        </div>
      </aside>

      <section className="admin-manager__editor">
        <div className="admin-manager__editor-head">
          <div>
            <div className="eyebrow">Editor</div>
            <h2>{creating ? "Create News Story" : activeItem?.title || "Edit News Story"}</h2>
            <p>Write the preview, full story, and image for the public news page.</p>
          </div>
          <div className="admin-manager__actions">
            {!creating && storyUrl ? (
              <Link href={storyUrl} target="_blank" className="button button--secondary">
                Preview Story
              </Link>
            ) : null}
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
              {saving ? "Saving..." : creating ? "Post News" : "Save Changes"}
            </button>
          </div>
        </div>

        {message ? <div className="admin-banner">{message}</div> : null}
        {error ? <div className="admin-banner admin-banner--error">{error}</div> : null}

        {activeItem ? (
          <>
            <div className="admin-grid">
              <label className="admin-field">
                <span>Label</span>
                <input
                  value={activeItem.label}
                  onChange={(event) => updateActive("label", event.target.value)}
                />
              </label>
              <label className="admin-field">
                <span>Date</span>
                <input
                  value={activeItem.date}
                  onChange={(event) => updateActive("date", event.target.value)}
                />
              </label>
              <label className="admin-field">
                <span>Location</span>
                <input
                  value={activeItem.location}
                  onChange={(event) => updateActive("location", event.target.value)}
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
                <span>Story Link</span>
                <input
                  value={activeItem.slug}
                  onChange={(event) => updateActive("slug", event.target.value)}
                  placeholder="example-story-title"
                />
              </label>
              <label className="admin-field admin-field--full">
                <span>Preview Text</span>
                <textarea
                  rows={3}
                  value={activeItem.excerpt}
                  onChange={(event) => updateActive("excerpt", event.target.value)}
                />
              </label>
              <label className="admin-field admin-field--full">
                <span>Full Story</span>
                <textarea
                  rows={10}
                  value={activeItem.content}
                  onChange={(event) => updateActive("content", event.target.value)}
                />
              </label>
              <label className="admin-field admin-field--full">
                <span>Image Link</span>
                <input
                  value={activeItem.image ?? ""}
                  onChange={(event) => updateActive("image", event.target.value)}
                />
              </label>
            </div>

            <AdminImageUpload
              enabled={uploadsEnabled}
              folder="news"
              onUploaded={(url) => updateActive("image", url)}
            />

            <div className="admin-story-preview">
              <article
                className="story-card story-card--photo"
                style={
                  activeItem.image
                    ? {
                        backgroundImage: `linear-gradient(180deg, rgba(17, 12, 9, 0.18), rgba(17, 12, 9, 0.78)), url(${activeItem.image})`,
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "cover"
                      }
                    : undefined
                }
              >
                <div className="story-card__content">
                  <span className="section-badge section-badge--light">
                    <SparkIcon className="icon" />
                    {activeItem.label || "News"}
                  </span>
                  <h2>{activeItem.title || "Story title"}</h2>
                  <p>{activeItem.excerpt || "Story preview text will appear here."}</p>
                  <div className="story-card__meta story-card__meta--light">
                    <span>{activeItem.date || "Date"}</span>
                    <span>{activeItem.location || "Location"}</span>
                  </div>
                </div>
              </article>

              <div className="admin-story-preview__details">
                <div className="admin-story-link">
                  <span>Public link</span>
                  <strong>{storyUrl || "/news/story-link"}</strong>
                </div>
                <div className="story-actions story-actions--inline">
                  <span>
                    <HeartIcon className="icon icon--tiny" />
                    {activeItem.likes}
                  </span>
                  <span>
                    <ShareIcon className="icon icon--tiny" />
                    Shareable story page
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}
