"use client";

import { useMemo, useState } from "react";
import { ClockIcon, CrossIcon } from "@/components/site-icons";
import {
  buildConfessionSlots
} from "@/lib/community-shared";
import type { ConfessionReservation, ConfessionSchedule } from "@/lib/community-shared";

type ConfessionBrowserProps = {
  schedules: ConfessionSchedule[];
  reservations: ConfessionReservation[];
};

type ScheduleCardProps = {
  schedule: ConfessionSchedule;
  reservations: ConfessionReservation[];
};

function ScheduleCard({ schedule, reservations }: ScheduleCardProps) {
  const [form, setForm] = useState({
    fullName: "",
    department: "",
    level: "",
    identifier: "",
    timeSlot: "",
    note: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const slots = buildConfessionSlots(schedule);
  const slotCounts = useMemo(() => {
    const counts = new Map<string, number>();

    reservations.forEach((item) => {
      counts.set(item.timeSlot, (counts.get(item.timeSlot) ?? 0) + 1);
    });

    return counts;
  }, [reservations]);

  function updateField(key: keyof typeof form, value: string) {
    setForm((current) => ({
      ...current,
      [key]: value
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/confession/${schedule.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });
      const result = (await response.json()) as {
        error?: string;
        duplicate?: boolean;
        message?: string;
      };

      if (!response.ok) {
        setError(result.error ?? "Unable to reserve this confession slot.");
        return;
      }

      setMessage(
        result.duplicate
          ? "Your confession reservation already exists for this schedule."
          : result.message || "Confession slot reserved."
      );
      setForm({
        fullName: "",
        department: "",
        level: "",
        identifier: "",
        timeSlot: "",
        note: ""
      });
    } catch {
      setError("Unable to reserve this confession slot.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <article className="panel panel--soft-stack">
      <span className="section-badge">
        <ClockIcon className="icon" />
        {schedule.date}
      </span>
      <h2>{schedule.title}</h2>
      <p>{schedule.location}</p>
      {schedule.note ? <p>{schedule.note}</p> : null}

      <div className="community-slot-grid">
        {slots.map((slot) => (
          <div key={slot} className="community-slot-pill">
            <strong>{slot}</strong>
            <span>
              {slotCounts.get(slot) ?? 0} / {schedule.maxPerSlot}
            </span>
          </div>
        ))}
      </div>

      {message ? <div className="admin-banner">{message}</div> : null}
      {error ? <div className="admin-banner admin-banner--error">{error}</div> : null}

      <form className="community-form" onSubmit={handleSubmit}>
        <div className="admin-grid">
          <label className="admin-field admin-field--full">
            <span>Full Name</span>
            <input
              value={form.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
              required
            />
          </label>
          <label className="admin-field">
            <span>Department</span>
            <input
              value={form.department}
              onChange={(event) => updateField("department", event.target.value)}
              required
            />
          </label>
          <label className="admin-field">
            <span>Level</span>
            <input
              value={form.level}
              onChange={(event) => updateField("level", event.target.value)}
              required
            />
          </label>
          <label className="admin-field">
            <span>Time Slot</span>
            <select
              value={form.timeSlot}
              onChange={(event) => updateField("timeSlot", event.target.value)}
              required
            >
              <option value="">Choose a time</option>
              {slots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot} ({schedule.maxPerSlot - (slotCounts.get(slot) ?? 0)} space left)
                </option>
              ))}
            </select>
          </label>
          <label className="admin-field admin-field--full">
            <span>Phone or Matric Number</span>
            <input
              value={form.identifier}
              onChange={(event) => updateField("identifier", event.target.value)}
              required
            />
          </label>
          <label className="admin-field admin-field--full">
            <span>Note</span>
            <textarea
              rows={3}
              value={form.note}
              onChange={(event) => updateField("note", event.target.value)}
              placeholder="Optional note"
            />
          </label>
        </div>

        <button type="submit" className="button button--primary" disabled={submitting}>
          {submitting ? "Reserving..." : "Reserve Confession Time"}
        </button>
      </form>
    </article>
  );
}

export function ConfessionBrowser({
  schedules,
  reservations
}: ConfessionBrowserProps) {
  if (schedules.length === 0) {
    return (
      <div className="panel empty-state">
        <span className="section-badge">
          <CrossIcon className="icon" />
          Confession
        </span>
        <h2>No confession schedule has been published yet.</h2>
      </div>
    );
  }

  return (
    <div className="community-stack">
      {schedules.map((schedule) => (
        <ScheduleCard
          key={schedule.id}
          schedule={schedule}
          reservations={reservations.filter((item) => item.scheduleId === schedule.id)}
        />
      ))}
    </div>
  );
}
