"use client";

import { useState } from "react";

type AttendanceCheckInFormProps = {
  token: string;
  isOpen: boolean;
  statusLabel: string;
  requestTitle: string;
};

export function AttendanceCheckInForm({
  token,
  isOpen,
  statusLabel,
  requestTitle
}: AttendanceCheckInFormProps) {
  const [form, setForm] = useState({
    fullName: "",
    department: "",
    level: "",
    identifier: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateField(key: keyof typeof form, value: string) {
    setForm((current) => ({
      ...current,
      [key]: value
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isOpen || submitting) {
      return;
    }

    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/attendance/${token}`, {
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
        setError(result.error ?? "Unable to record attendance right now.");
        return;
      }

      setMessage(
        result.duplicate
          ? `Attendance was already recorded earlier for ${requestTitle}.`
          : result.message || `Attendance recorded for ${requestTitle}.`
      );
      setForm({
        fullName: "",
        department: "",
        level: "",
        identifier: ""
      });
    } catch {
      setError("Unable to record attendance right now.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="panel panel--soft-stack">
      <div className="story-card__meta">
        <span>Status: {statusLabel}</span>
      </div>

      {message ? <div className="admin-banner">{message}</div> : null}
      {error ? <div className="admin-banner admin-banner--error">{error}</div> : null}

      {isOpen ? (
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
            <label className="admin-field admin-field--full">
              <span>Phone or Matric Number</span>
              <input
                value={form.identifier}
                onChange={(event) => updateField("identifier", event.target.value)}
                required
              />
            </label>
          </div>

          <button type="submit" className="button button--primary" disabled={submitting}>
            {submitting ? "Recording..." : "Record Attendance"}
          </button>
        </form>
      ) : (
        <p>The check-in window is not open right now. Please wait for the parish office to open it.</p>
      )}
    </div>
  );
}
