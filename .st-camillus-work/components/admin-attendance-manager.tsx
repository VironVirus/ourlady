"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useMemo, useState } from "react";
import { PlusIcon, UsersIcon } from "@/components/site-icons";
import type { AttendanceRecord, AttendanceRequest } from "@/lib/community-modules";

type AdminAttendanceManagerProps = {
  initialRequests: AttendanceRequest[];
  initialRecords: AttendanceRecord[];
  siteUrl: string;
};

function createDraft(): AttendanceRequest {
  const today = new Date().toISOString().slice(0, 10);

  return {
    id: `attendance-${Date.now()}`,
    title: "",
    date: today,
    location: "St Camillus de Lellis Chaplaincy",
    note: "",
    opensAt: "",
    closesAt: "",
    token: crypto.randomUUID(),
    published: true
  };
}

function asDateLabel(value: string) {
  if (!value) {
    return "Date not set";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(`${value}T12:00:00`));
}

export function AdminAttendanceManager({
  initialRequests,
  initialRecords,
  siteUrl
}: AdminAttendanceManagerProps) {
  const [items, setItems] = useState(initialRequests);
  const [records, setRecords] = useState(initialRecords);
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState(createDraft);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const activeItem = creating ? draft : items.find((item) => item.id === selectedId) ?? null;
  const requestRecords = useMemo(() => {
    if (!activeItem) {
      return [];
    }

    return records.filter((item) => item.requestId === activeItem.id);
  }, [activeItem, records]);
  const checkInUrl =
    activeItem?.token ? new URL(`/attendance/check-in/${activeItem.token}`, siteUrl).toString() : "";
  const qrCodeUrl = checkInUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(checkInUrl)}`
    : "";

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

  function setActiveItem(updater: (item: AttendanceRequest) => AttendanceRequest) {
    if (creating) {
      setDraft((current) => updater(current));
      return;
    }

    setItems((current) =>
      current.map((item) => (item.id === selectedId ? updater(item) : item))
    );
  }

  function updateActive(
    key: keyof AttendanceRequest,
    value: string | boolean
  ) {
    setActiveItem((current) => ({
      ...current,
      [key]: value
    }));
  }

  async function saveCurrent() {
    if (!activeItem || saving) {
      return;
    }

    setSaving(true);
    resetNotice();

    try {
      const response = await fetch("/api/admin/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(activeItem)
      });
      const result = (await response.json()) as {
        error?: string;
        item?: AttendanceRequest;
      };

      if (!response.ok || !result.item) {
        setError(result.error ?? "Unable to save this attendance request.");
        return;
      }

      setItems((current) => {
        const others = current.filter((item) => item.id !== result.item?.id);
        return [result.item!, ...others];
      });
      setCreating(false);
      setSelectedId(result.item.id);
      setMessage("Attendance request saved.");
    } catch {
      setError("Unable to save this attendance request.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(item: AttendanceRequest) {
    if (!item || deletingId) {
      return;
    }

    setDeletingId(item.id);
    resetNotice();

    try {
      const response = await fetch(`/api/admin/attendance/${item.id}`, {
        method: "DELETE"
      });
      const result = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        setError(result.error ?? "Unable to remove this attendance request.");
        return;
      }

      setItems((current) => current.filter((entry) => entry.id !== item.id));
      setRecords((current) => current.filter((entry) => entry.requestId !== item.id));
      if (!creating && selectedId === item.id) {
        setSelectedId("");
      }
      setMessage("Attendance request removed.");
    } catch {
      setError("Unable to remove this attendance request.");
    } finally {
      setDeletingId("");
    }
  }

  async function copyLink() {
    if (!checkInUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(checkInUrl);
      setMessage("Check-in link copied.");
      setError("");
    } catch {
      setError("Unable to copy the link on this device.");
    }
  }

  return (
    <div className="admin-manager">
      <aside className="admin-manager__list">
        <div className="admin-manager__toolbar">
          <div>
            <div className="eyebrow">Attendance</div>
            <h2>QR Check-ins</h2>
          </div>
          <button type="button" className="button button--secondary" onClick={startNew}>
            <PlusIcon className="icon icon--tiny" />
            New Request
          </button>
        </div>

        <div className="admin-record-list">
          {items.length === 0 ? (
            <div className="admin-card admin-card--empty">
              <p className="admin-hint">No attendance requests yet.</p>
            </div>
          ) : null}

          {items.map((item) => {
            const count = records.filter((record) => record.requestId === item.id).length;

            return (
              <article
                key={item.id}
                className={`admin-record-row${!creating && selectedId === item.id ? " is-active" : ""}`}
              >
                <div>
                  <strong>{item.title || "Untitled attendance"}</strong>
                  <small>{asDateLabel(item.date)} • {count} checked in</small>
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
            );
          })}
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
                <h2>{creating ? "Create Attendance Request" : activeItem.title || "Edit Attendance Request"}</h2>
                <p>Create a one-day QR check-in link and keep the attendee list for that Mass.</p>
              </div>
              <div className="admin-manager__actions">
                <button type="button" className="button button--secondary" onClick={closeEditor}>
                  Close
                </button>
                {checkInUrl ? (
                  <Link href={checkInUrl} target="_blank" className="button button--secondary">
                    Open Check-in Page
                  </Link>
                ) : null}
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
                  {saving ? "Saving..." : creating ? "Create Request" : "Save Changes"}
                </button>
              </div>
            </div>

            <div className="admin-grid">
              <label className="admin-field admin-field--full">
                <span>Title</span>
                <input
                  value={activeItem.title}
                  onChange={(event) => updateActive("title", event.target.value)}
                  placeholder="Sunday 8:00 AM Mass Attendance"
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
                <span>Location</span>
                <input
                  value={activeItem.location}
                  onChange={(event) => updateActive("location", event.target.value)}
                />
              </label>
              <label className="admin-field">
                <span>Opens At</span>
                <input
                  type="time"
                  value={activeItem.opensAt}
                  onChange={(event) => updateActive("opensAt", event.target.value)}
                />
              </label>
              <label className="admin-field">
                <span>Closes At</span>
                <input
                  type="time"
                  value={activeItem.closesAt}
                  onChange={(event) => updateActive("closesAt", event.target.value)}
                />
              </label>
              <label className="admin-field admin-field--full">
                <span>Note</span>
                <textarea
                  rows={4}
                  value={activeItem.note}
                  onChange={(event) => updateActive("note", event.target.value)}
                  placeholder="Optional note for students before they check in."
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
                <span>Check-in Link</span>
                <input readOnly value={checkInUrl} />
              </label>
            </div>

            <div className="community-admin-grid">
              <article className="panel panel--soft-stack">
                <div className="community-card__head">
                  <div>
                    <div className="eyebrow">QR Code</div>
                    <h3>Poster-ready link</h3>
                  </div>
                  <button type="button" className="button button--secondary" onClick={copyLink}>
                    Copy Link
                  </button>
                </div>
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="Attendance QR code" className="community-qr-code" />
                ) : (
                  <p className="admin-hint">Save the request to keep a stable QR link.</p>
                )}
              </article>

              <article className="panel panel--soft-stack">
                <div className="community-card__head">
                  <div>
                    <div className="eyebrow">Attendance List</div>
                    <h3>{requestRecords.length} members recorded</h3>
                  </div>
                </div>
                {requestRecords.length > 0 ? (
                  <div className="community-list">
                    {requestRecords.map((record) => (
                      <article key={record.id} className="community-list__item">
                        <div>
                          <strong>{record.fullName}</strong>
                          <small>
                            {record.department} • {record.level}
                          </small>
                        </div>
                        <span>{record.identifier}</span>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="admin-hint">No one has checked in yet for this Mass.</p>
                )}
              </article>
            </div>
          </>
        ) : (
          <div className="admin-card admin-card--empty">
            <p className="admin-hint">
              Select an attendance request to edit it, or create a new QR check-in.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
