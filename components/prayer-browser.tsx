"use client";

import { useState } from "react";
import type { PrayerItem } from "@/lib/content";
import { summarizePrayer } from "@/lib/site-runtime";

type PrayerBrowserProps = {
  items: PrayerItem[];
};

function toParagraphs(value: string) {
  return value
    .split(/\n{2,}/)
    .map((item) => item.replace(/\n/g, " ").trim())
    .filter(Boolean);
}

export function PrayerBrowser({ items }: PrayerBrowserProps) {
  const [selectedId, setSelectedId] = useState(items[0]?.id ?? "");
  const activePrayer = items.find((item) => item.id === selectedId) ?? items[0];

  if (!activePrayer) {
    return (
      <div className="panel empty-state">
        <h2>No prayers yet.</h2>
        <p>Prayer write-ups can be added from the admin area when ready.</p>
      </div>
    );
  }

  return (
    <div className="prayer-browser">
      <aside className="prayer-browser__list">
        <div className="eyebrow">Prayer List</div>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`prayer-option${item.id === activePrayer.id ? " is-active" : ""}`}
            onClick={() => setSelectedId(item.id)}
          >
            <span>{item.category || "Prayer"}</span>
            <strong>{item.title}</strong>
            <small>{summarizePrayer(item)}</small>
          </button>
        ))}
      </aside>

      <article className="prayer-browser__content">
        <span className="section-badge">{activePrayer.category || "Prayer"}</span>
        <h2>{activePrayer.title}</h2>
        {activePrayer.excerpt ? <p>{activePrayer.excerpt}</p> : null}
        <div className="reading-flow">
          {toParagraphs(activePrayer.body).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>
    </div>
  );
}
