"use client";

import Link from "next/link";
import { useState } from "react";
import { PlusIcon } from "@/components/site-icons";
import type { HymnItem, HymnPlan } from "@/lib/community-modules";

type AdminHymnManagerProps = {
  initialPlans: HymnPlan[];
};

function createHymn(): HymnItem {
  return {
    id: `hymn-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    part: "",
    title: "",
    lyrics: ""
  };
}

function createDraft(): HymnPlan {
  const today = new Date().toISOString().slice(0, 10);

  return {
    id: `hymn-plan-${Date.now()}`,
    date: today,
    title: "",
    note: "",
    published: true,
    hymns: [createHymn()]
  };
}

export function AdminHymnManager({ initialPlans }: AdminHymnManagerProps) {
  const [items, setItems] = useState(initialPlans);
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState(createDraft);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const activeItem = creating ? draft : items.find((item) => item.id === selectedId) ?? null;

  function resetNotice() {
    setMessage("");
    setError("");
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

  function toggleEdit(id: string) {
    setCreating(false);
    setSelectedId((current) => (current === id ? "" : id));
    resetNotice();
  }

  function setActiveItem(updater: (item: HymnPlan) => HymnPlan) {
    if (creating) {
      setDraft((current) => updater(current));
      return;
    }

    setItems((current) =>
      current.map((item) => (item.id === selectedId ? updater(item) : item))
    );
  }

  function updateActive(key: keyof HymnPlan, value: string | boolean) {
    setActiveItem((current) => ({
      ...current,
      [key]: value
    }));
  }

  function updateHymn(index: number, key: keyof HymnItem, value: string) {
    setActiveItem((current) => ({
      ...current,
      hymns: current.hymns.map((hymn, hymnIndex) =>
        hymnIndex === index ? { ...hymn, [key]: value } : hymn
      )
    }));
  }

  function addHymn() {
    setActiveItem((current) => ({
      ...current,
      hymns: [...current.hymns, createHymn()]
    }));
  }

  function removeHymn(index: number) {
    setActiveItem((current) => ({
      ...current,
      hymns: current.hymns.filter((_, hymnIndex) => hymnIndex !== index)
    }));
  }

  async function saveCurrent() {
    if (!activeItem || saving) {
      return;
    }

    setSaving(true);
    resetNotice();

    try {
      const response = await fetch("/api/admin/hymns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(activeItem)
      });
      const result = (await response.json()) as {
        error?: string;
        item?: HymnPlan;
      };

      if (!response.ok || !result.item) {
        setError(result.error ?? "Unable to save this hymn plan.");
        return;
      }

      setItems((current) => {
        const others = current.filter((item) => item.id !== result.item?.id);
        return [result.item!, ...others];
      });
      setCreating(false);
      setSelectedId(result.item.id);
      setMessage("Hymn plan saved.");
    } catch {
      setError("Unable to save this hymn plan.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(item: HymnPlan) {
    if (!item || deletingId) {
      return;
    }

    setDeletingId(item.id);
    resetNotice();

    try {
      const response = await fetch(`/api/admin/hymns/${item.id}`, {
        method: "DELETE"
      });
      const result = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        setError(result.error ?? "Unable to remove this hymn plan.");
        return;
      }

      setItems((current) => current.filter((entry) => entry.id !== item.id));
      if (!creating && selectedId === item.id) {
        setSelectedId("");
      }
      setMessage("Hymn plan removed.");
    } catch {
      setError("Unable to remove this hymn plan.");
    } finally {
      setDeletingId("");
    }
  }

  return (
    <div className="admin-manager">
      <aside className="admin-manager__list">
        <div className="admin-manager__toolbar">
          <div>
            <div className="eyebrow">Choir</div>
            <h2>Hymn Plans</h2>
          </div>
          <button type="button" className="button button--secondary" onClick={startNew}>
            <PlusIcon className="icon icon--tiny" />
            New Plan
          </button>
        </div>

        <div className="admin-record-list">
          {items.length === 0 ? (
            <div className="admin-card admin-card--empty">
              <p className="admin-hint">No hymn plans yet.</p>
            </div>
          ) : null}

          {items.map((item) => (
            <article
              key={item.id}
              className={`admin-record-row${!creating && selectedId === item.id ? " is-active" : ""}`}
            >
              <div>
                <strong>{item.title || "Untitled hymn plan"}</strong>
                <small>{item.date || "Date not set"} • {item.hymns.length} hymns</small>
              </div>
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
                <h2>{creating ? "Create Hymn Plan" : activeItem.title || "Edit Hymn Plan"}</h2>
                <p>Upload the choir list and the congregation can follow the lyrics from the missal page.</p>
              </div>
              <div className="admin-manager__actions">
                <button type="button" className="button button--secondary" onClick={closeEditor}>
                  Close
                </button>
                <Link href="/missal" target="_blank" className="button button--secondary">
                  Open Public Page
                </Link>
                {!creating ? (
                  <button
                    type="button"
                    className="button button--secondary"
                    disabled={Boolean(deletingId)}
                    onClick={() => deleteItem(activeItem)}
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
                  {saving ? "Saving..." : creating ? "Create Plan" : "Save Changes"}
                </button>
              </div>
            </div>

            <div className="admin-grid">
              <label className="admin-field admin-field--full">
                <span>Title</span>
                <input
                  value={activeItem.title}
                  onChange={(event) => updateActive("title", event.target.value)}
                  placeholder="Sunday Choir Hymns"
                />
              </label>
              <label className="admin-field">
                <span>Date</span>
                <input
                  type="date"
                  value={activeItem.date}
                  onChange={(event) => updateActive("date", event.target.value)}
                />
              </label>
              <label className="admin-field">
                <span>Status</span>
                <select
                  value={activeItem.published ? "published" : "draft"}
                  onChange={(event) => updateActive("published", event.target.value === "published")}
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </label>
              <label className="admin-field admin-field--full">
                <span>Note</span>
                <textarea
                  rows={4}
                  value={activeItem.note}
                  onChange={(event) => updateActive("note", event.target.value)}
                  placeholder="Short note for today’s liturgy."
                />
              </label>
            </div>

            <div className="community-stack">
              <div className="community-card__head">
                <div>
                  <div className="eyebrow">Hymns</div>
                  <h3>Choir list</h3>
                </div>
                <button type="button" className="button button--secondary" onClick={addHymn}>
                  Add Hymn
                </button>
              </div>

              {activeItem.hymns.map((hymn, index) => (
                <article key={hymn.id} className="panel panel--soft-stack">
                  <div className="community-card__head">
                    <strong>Hymn {index + 1}</strong>
                    <button
                      type="button"
                      className="admin-link admin-link--danger"
                      onClick={() => removeHymn(index)}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="admin-grid">
                    <label className="admin-field">
                      <span>Part</span>
                      <input
                        value={hymn.part}
                        onChange={(event) => updateHymn(index, "part", event.target.value)}
                        placeholder="Entrance"
                      />
                    </label>
                    <label className="admin-field admin-field--full">
                      <span>Title</span>
                      <input
                        value={hymn.title}
                        onChange={(event) => updateHymn(index, "title", event.target.value)}
                        placeholder="Great Is Thy Faithfulness"
                      />
                    </label>
                    <label className="admin-field admin-field--full">
                      <span>Lyrics</span>
                      <textarea
                        rows={8}
                        value={hymn.lyrics}
                        onChange={(event) => updateHymn(index, "lyrics", event.target.value)}
                        placeholder="Add the hymn lyrics here."
                      />
                    </label>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="admin-card admin-card--empty">
            <p className="admin-hint">
              Select a hymn plan to edit it, or create a new choir list for a Mass day.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
