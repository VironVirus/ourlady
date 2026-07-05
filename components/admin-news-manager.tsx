"use client";

import Link from "next/link";
import { useState } from "react";
import { AdminImageUpload } from "@/components/admin-image-upload";
import { NewsSlideshow } from "@/components/news-slideshow";
import { HeartIcon, MessageIcon, PlusIcon, ShareIcon, SparkIcon } from "@/components/site-icons";
import { collectNewsImages, getNewsImages, getPrimaryNewsImage } from "@/lib/news-images";
import { newsCategoryOptions, normalizeNewsCategory } from "@/lib/news-categories";
import type { NewsPost } from "@/lib/news";

type AdminNewsManagerProps = {
  initialItems: NewsPost[];
  uploadsEnabled: boolean;
};

function createDraft(): NewsPost {
  return {
    id: `news-${Date.now()}`,
    slug: "",
    label: "General",
    title: "",
    description: "",
    excerpt: "",
    content: "",
    date: "",
    location: "",
    image: "",
    images: [],
    comments: 0,
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
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState(createDraft);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const activeItem = creating
    ? draft
    : items.find((item) => item.id === selectedId) ?? null;
  const storyUrl = !creating && activeItem?.slug ? `/news/${activeItem.slug}` : "";
  const activeImages = activeItem ? getNewsImages(activeItem) : [];

  function resetNotice() {
    setMessage("");
    setError("");
  }

  function toggleEdit(id: string) {
    setCreating(false);
    setSelectedId((current) => (current === id ? "" : id));
    resetNotice();
  }

  function startNew() {
    setDraft(createDraft());
    setCreating(true);
    setSelectedId("");
    resetNotice();
  }

  function closeEditor() {
    setCreating(false);
    setSelectedId("");
    resetNotice();
  }

  function setActiveItem(updater: (item: NewsPost) => NewsPost) {
    if (creating) {
      setDraft((current) => updater(current));
      return;
    }

    setItems((current) =>
      current.map((item) => (item.id === selectedId ? updater(item) : item))
    );
  }

  function updateActive(key: keyof NewsPost, value: string | boolean | number) {
    setActiveItem((current) => {
      const next = {
        ...current,
        [key]: key === "label" && typeof value === "string" ? normalizeNewsCategory(value) : value
      };

      if (key === "excerpt" && typeof value === "string") {
        next.description = value;
      }

      return next;
    });
  }

  function updateImages(nextImages: string[]) {
    const normalized = collectNewsImages(nextImages);

    setActiveItem((current) => ({
      ...current,
      image: getPrimaryNewsImage({ images: normalized }),
      images: normalized
    }));
  }

  function removeImage(indexToRemove: number) {
    updateImages(activeImages.filter((_, index) => index !== indexToRemove));
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

  async function deleteItem(item: NewsPost) {
    if (!item || !item.id || deletingId) {
      return;
    }

    setDeletingId(item.id);
    resetNotice();

    try {
      const response = await fetch(`/api/admin/news/${item.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          slug: item.slug
        })
      });
      const result = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        setError(result.error ?? "Unable to remove this story.");
        return;
      }

      const nextItems = items.filter((entry) => entry.id !== item.id);
      setItems(nextItems);
      if (!creating && selectedId === item.id) {
        setSelectedId("");
      }
      if (nextItems.length === 0 && creating) {
        setDraft(createDraft());
      }
      setMessage("News story removed.");
    } catch {
      setError("Unable to remove this story.");
    } finally {
      setDeletingId("");
    }
  }

  async function deleteCurrent() {
    if (!activeItem || creating) {
      return;
    }

    await deleteItem(activeItem);
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
            <article
              key={item.id}
              className={`admin-record-row${!creating && selectedId === item.id ? " is-active" : ""}`}
            >
              <strong>{item.title || "Untitled story"}</strong>
              <div className="admin-record-actions">
                <button type="button" className="admin-link" onClick={() => toggleEdit(item.id)}>
                  {!creating && selectedId === item.id ? "Close" : "Edit"}
                </button>
                <button
                  type="button"
                  className="admin-link admin-link--danger"
                  disabled={Boolean(deletingId)}
                  onClick={() => deleteItem(item)}
                >
                  {deletingId === item.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </aside>

      <section className="admin-manager__editor">
        {message ? <div className="admin-banner">{message}</div> : null}
        {error ? <div className="admin-banner admin-banner--error">{error}</div> : null}

        {activeItem ? (
          <>
            <div className="admin-manager__editor-head">
              <div>
                <div className="eyebrow">Editor</div>
                <h2>{creating ? "Create News Story" : activeItem.title || "Edit News Story"}</h2>
                <p>Write the preview, full story, slideshow images, and public link for this news post.</p>
              </div>
              <div className="admin-manager__actions">
                <button type="button" className="button button--secondary" onClick={closeEditor}>
                  Close
                </button>
                {!creating && storyUrl ? (
                  <Link href={storyUrl} target="_blank" className="button button--secondary">
                    Preview Story
                  </Link>
                ) : null}
                {!creating ? (
                  <button
                    type="button"
                    className="button button--secondary"
                    disabled={Boolean(deletingId)}
                    onClick={deleteCurrent}
                  >
                    {deletingId === activeItem.id ? "Removing..." : "Delete"}
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

            <div className="admin-grid">
              <label className="admin-field">
                <span>Category</span>
                <select
                  value={activeItem.label}
                  onChange={(event) => updateActive("label", event.target.value)}
                >
                  {newsCategoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
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
                <span>Story Images</span>
                <textarea
                  rows={4}
                  value={activeImages.join("\n")}
                  onChange={(event) =>
                    updateImages(
                      event.target.value
                        .split("\n")
                        .map((item) => item.trim())
                        .filter(Boolean)
                    )
                  }
                />
              </label>
            </div>

            <AdminImageUpload
              enabled={uploadsEnabled}
              folder="news"
              buttonLabel="Upload Story Images"
              fieldLabel="Story Image Upload"
              multiple
              onUploaded={(url) => updateImages([...activeImages, url])}
              onUploadedMany={(urls) => updateImages([...activeImages, ...urls])}
            />

            <div className="admin-image-stack">
              <p className="admin-hint">
                Add one image per line. The first image appears first in the slideshow.
              </p>
              {activeImages.length > 0 ? (
                <div className="admin-image-list">
                  {activeImages.map((imageUrl, index) => (
                    <article key={`${imageUrl}-${index}`} className="admin-image-item">
                      <div
                        className="admin-image-item__preview"
                        style={{ backgroundImage: `url(${imageUrl})` }}
                      />
                      <div className="admin-image-item__body">
                        <strong>{index === 0 ? "Cover image" : `Slide ${index + 1}`}</strong>
                        <small>{imageUrl}</small>
                      </div>
                      <button
                        type="button"
                        className="admin-link admin-link--danger"
                        onClick={() => removeImage(index)}
                      >
                        Remove
                      </button>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="admin-hint">Upload one or more images to build the story slideshow.</p>
              )}
            </div>

            <div className="admin-story-preview">
              <article className="story-card story-card--photo">
                <NewsSlideshow
                  className="story-card__media"
                  images={activeImages}
                  emptyLabel="No story image added"
                  fit="contain"
                  overlay="linear-gradient(180deg, rgba(17, 12, 9, 0.18), rgba(17, 12, 9, 0.78))"
                />
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
                    <MessageIcon className="icon icon--tiny" />
                    {activeItem.comments}
                  </span>
                  <span>
                    <ShareIcon className="icon icon--tiny" />
                    Shareable story page
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="admin-card admin-card--empty">
            <p className="admin-hint">
              Select a news title from the list to edit it, or use Add News to create a new story.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
