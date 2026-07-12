"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PlusIcon } from "@/components/site-icons";
import {
  buildConfessionSlots
} from "@/lib/community-shared";
import type { ConfessionReservation, ConfessionSchedule } from "@/lib/community-shared";

type AdminConfessionManagerProps = {
  initialSchedules: ConfessionSchedule[];
  initialReservations: ConfessionReservation[];
};

function createDraft(): ConfessionSchedule {
  const today = new Date().toISOString().slice(0, 10);

  return {
    id: `confession-${Date.now()}`,
    title: "",
    date: today,
    location: "St Camillus de Lellis Chaplaincy",
    note: "",
    startTime: "16:00",
    endTime: "18:00",
    slotMinutes: 10,
    maxPerSlot: 1,
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

export function AdminConfessionManager({
  initialSchedules,
  initialReservations
}: AdminConfessionManagerProps) {
  const [items, setItems] = useState(initialSchedules);
  const [reservations, setReservations] = useState(initialReservations);
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState(createDraft);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const activeItem = creating ? draft : items.find((item) => item.id === selectedId) ?? null;
  const scheduleReservations = useMemo(() => {
    if (!activeItem) {
      return [];
    }

    return reservations.filter((item) => item.scheduleId === activeItem.id);
  }, [activeItem, reservations]);
  const slotCounts = useMemo(() => {
    const counts = new Map<string, number>();

    scheduleReservations.forEach((item) => {
      counts.set(item.timeSlot, (counts.get(item.timeSlot) ?? 0) + 1);
    });

    return counts;
  }, [scheduleReservations]);

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

  function setActiveItem(updater: (item: ConfessionSchedule) => ConfessionSchedule) {
    if (creating) {
      setDraft((current) => updater(current));
      return;
    }

    setItems((current) =>
      current.map((item) => (item.id === selectedId ? updater(item) : item))
    );
  }

  function updateActive(
    key: keyof ConfessionSchedule,
    value: string | boolean | number
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
      const response = await fetch("/api/admin/confession", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(activeItem)
      });
      const result = (await response.json()) as {
        error?: string;
        item?: ConfessionSchedule;
      };

      if (!response.ok || !result.item) {
        setError(result.error ?? "Unable to save this confession schedule.");
        return;
      }

      setItems((current) => {
        const others = current.filter((item) => item.id !== result.item?.id);
        return [result.item!, ...others];
      });
      setCreating(false);
      setSelectedId(result.item.id);
      setMessage("Confession schedule saved.");
    } catch {
      setError("Unable to save this confession schedule.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(item: ConfessionSchedule) {
    if (!item || deletingId) {
      return;
    }

    setDeletingId(item.id);
    resetNotice();

    try {
      const response = await fetch(`/api/admin/confession/${item.id}`, {
        method: "DELETE"
      });
      const result = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        setError(result.error ?? "Unable to remove this confession schedule.");
        return;
      }

      setItems((current) => current.filter((entry) => entry.id !== item.id));
      setReservations((current) => current.filter((entry) => entry.scheduleId !== item.id));
      if (!creating && selectedId === item.id) {
        setSelectedId("");
      }
      setMessage("Confession schedule removed.");
    } catch {
      setError("Unable to remove this confession schedule.");
    } finally {
      setDeletingId("");
    }
  }

  function printCurrent() {
    if (!activeItem) {
      return;
    }

    const reservationRows = scheduleReservations
      .map(
        (item) =>
          `<tr><td>${item.timeSlot}</td><td>${item.fullName}</td><td>${item.department}</td><td>${item.level}</td><td>${item.identifier}</td></tr>`
      )
      .join("");

    const printWindow = window.open("", "_blank", "width=960,height=720");

    if (!printWindow) {
      setError("Popup blocked. Please allow popups to print the list.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${activeItem.title}</title>
          <style>
            body { font-family: Georgia, serif; padding: 24px; color: #1a120c; }
            h1 { margin-bottom: 8px; }
            p { margin: 4px 0 16px; }
            table { width: 100%; border-collapse: collapse; margin-top: 18px; }
            th, td { border: 1px solid #d9cab8; padding: 10px; text-align: left; }
            th { background: #f6efe7; }
          </style>
        </head>
        <body>
          <h1>${activeItem.title}</h1>
          <p>${asDateLabel(activeItem.date)} • ${activeItem.location}</p>
          <p>Total reservations: ${scheduleReservations.length}</p>
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Name</th>
                <th>Department</th>
                <th>Level</th>
                <th>Identifier</th>
              </tr>
            </thead>
            <tbody>${reservationRows}</tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  return (
    <div className="admin-manager">
      <aside className="admin-manager__list">
        <div className="admin-manager__toolbar">
          <div>
            <div className="eyebrow">Confession</div>
            <h2>Schedules</h2>
          </div>
          <button type="button" className="button button--secondary" onClick={startNew}>
            <PlusIcon className="icon icon--tiny" />
            New Schedule
          </button>
        </div>

        <div className="admin-record-list">
          {items.length === 0 ? (
            <div className="admin-card admin-card--empty">
              <p className="admin-hint">No confession schedules yet.</p>
            </div>
          ) : null}

          {items.map((item) => {
            const count = reservations.filter((record) => record.scheduleId === item.id).length;

            return (
              <article
                key={item.id}
                className={`admin-record-row${!creating && selectedId === item.id ? " is-active" : ""}`}
              >
                <div>
                  <strong>{item.title || "Untitled confession day"}</strong>
                  <small>{asDateLabel(item.date)} • {count} reservations</small>
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
                <h2>{creating ? "Create Confession Schedule" : activeItem.title || "Edit Confession Schedule"}</h2>
                <p>Open time slots for members and print the reservation list when needed.</p>
              </div>
              <div className="admin-manager__actions">
                <button type="button" className="button button--secondary" onClick={closeEditor}>
                  Close
                </button>
                <Link href="/confession" target="_blank" className="button button--secondary">
                  Open Public Page
                </Link>
                {!creating ? (
                  <button type="button" className="button button--secondary" onClick={printCurrent}>
                    Print List
                  </button>
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
                  {saving ? "Saving..." : creating ? "Create Schedule" : "Save Changes"}
                </button>
              </div>
            </div>

            <div className="admin-grid">
              <label className="admin-field admin-field--full">
                <span>Title</span>
                <input
                  value={activeItem.title}
                  onChange={(event) => updateActive("title", event.target.value)}
                  placeholder="Wednesday Evening Confession"
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
                <span>Start Time</span>
                <input
                  type="time"
                  value={activeItem.startTime}
                  onChange={(event) => updateActive("startTime", event.target.value)}
                />
              </label>
              <label className="admin-field">
                <span>End Time</span>
                <input
                  type="time"
                  value={activeItem.endTime}
                  onChange={(event) => updateActive("endTime", event.target.value)}
                />
              </label>
              <label className="admin-field">
                <span>Minutes Per Slot</span>
                <input
                  type="number"
                  min={5}
                  value={activeItem.slotMinutes}
                  onChange={(event) =>
                    updateActive("slotMinutes", Number.parseInt(event.target.value || "10", 10))
                  }
                />
              </label>
              <label className="admin-field">
                <span>Max Per Slot</span>
                <input
                  type="number"
                  min={1}
                  value={activeItem.maxPerSlot}
                  onChange={(event) =>
                    updateActive("maxPerSlot", Number.parseInt(event.target.value || "1", 10))
                  }
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
                  placeholder="Short note for members before they book a time."
                />
              </label>
            </div>

            <div className="community-admin-grid">
              <article className="panel panel--soft-stack">
                <div className="community-card__head">
                  <div>
                    <div className="eyebrow">Time Slots</div>
                    <h3>{buildConfessionSlots(activeItem).length} slots available</h3>
                  </div>
                </div>
                <div className="community-list">
                  {buildConfessionSlots(activeItem).map((slot) => (
                    <article key={slot} className="community-list__item">
                      <strong>{slot}</strong>
                      <span>
                        {slotCounts.get(slot) ?? 0} / {activeItem.maxPerSlot} booked
                      </span>
                    </article>
                  ))}
                  {buildConfessionSlots(activeItem).length === 0 ? (
                    <p className="admin-hint">Set a valid start and end time to generate slots.</p>
                  ) : null}
                </div>
              </article>

              <article className="panel panel--soft-stack">
                <div className="community-card__head">
                  <div>
                    <div className="eyebrow">Reservations</div>
                    <h3>{scheduleReservations.length} members coming</h3>
                  </div>
                </div>
                {scheduleReservations.length > 0 ? (
                  <div className="community-list">
                    {scheduleReservations.map((record) => (
                      <article key={record.id} className="community-list__item">
                        <div>
                          <strong>{record.fullName}</strong>
                          <small>
                            {record.timeSlot} • {record.department} • {record.level}
                          </small>
                        </div>
                        <span>{record.identifier}</span>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="admin-hint">No one has reserved a confession time yet.</p>
                )}
              </article>
            </div>
          </>
        ) : (
          <div className="admin-card admin-card--empty">
            <p className="admin-hint">
              Select a confession schedule to edit it, or create a new one.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
