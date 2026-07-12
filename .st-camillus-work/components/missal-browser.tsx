"use client";

import { useMemo, useState } from "react";
import { BookIcon, CrossIcon, SparkIcon } from "@/components/site-icons";
import {
  missalLanguages
} from "@/lib/community-shared";
import type { HymnPlan, MissalEntry, MissalLanguage } from "@/lib/community-shared";

type MissalBrowserProps = {
  entries: MissalEntry[];
  hymnPlans: HymnPlan[];
  dateKey: string;
};

export function MissalBrowser({
  entries,
  hymnPlans,
  dateKey
}: MissalBrowserProps) {
  const [language, setLanguage] = useState<MissalLanguage>("English");
  const languageEntries = useMemo(
    () => entries.filter((item) => item.language === language),
    [entries, language]
  );
  const orderEntries = languageEntries.filter((item) => item.entryType === "order");
  const dailyEntries = languageEntries.filter(
    (item) => item.entryType === "daily" && item.date === dateKey
  );

  return (
    <div className="community-stack">
      <div className="news-browser__filters">
        {missalLanguages.map((item) => (
          <button
            key={item}
            type="button"
            className={`news-filter${language === item ? " is-active" : ""}`}
            onClick={() => setLanguage(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {dailyEntries.length === 0 && orderEntries.length === 0 ? (
        <div className="panel empty-state">
          <span className="section-badge">
            <BookIcon className="icon" />
            {language}
          </span>
          <h2>No missal text has been added in {language} yet.</h2>
          <p>The chaplaincy admin can add today&apos;s prayers, responses, and Order of Mass from the dashboard.</p>
        </div>
      ) : null}

      {dailyEntries.map((entry) => (
        <article key={entry.id} className="panel panel--soft-stack">
          <span className="section-badge">
            <SparkIcon className="icon" />
            Daily Entry
          </span>
          <h2>{entry.title}</h2>
          {entry.celebration ? <p>{entry.celebration}</p> : null}
          <div className="community-stack">
            {entry.sections
              .filter((section) => section.heading || section.body)
              .map((section) => (
                <section key={section.id} className="missal-section">
                  {section.heading ? <h3>{section.heading}</h3> : null}
                  <div className="missal-section__body">
                    {section.body
                      .split(/\n+/)
                      .map((line) => line.trim())
                      .filter(Boolean)
                      .map((line, index) => (
                        <p key={`${section.id}-${index}`}>{line}</p>
                      ))}
                  </div>
                </section>
              ))}
          </div>
        </article>
      ))}

      {orderEntries.map((entry) => (
        <article key={entry.id} className="panel panel--soft-stack">
          <span className="section-badge">
            <CrossIcon className="icon" />
            Order of Mass
          </span>
          <h2>{entry.title}</h2>
          {entry.celebration ? <p>{entry.celebration}</p> : null}
          <div className="community-stack">
            {entry.sections
              .filter((section) => section.heading || section.body)
              .map((section) => (
                <section key={section.id} className="missal-section">
                  {section.heading ? <h3>{section.heading}</h3> : null}
                  <div className="missal-section__body">
                    {section.body
                      .split(/\n+/)
                      .map((line) => line.trim())
                      .filter(Boolean)
                      .map((line, index) => (
                        <p key={`${section.id}-${index}`}>{line}</p>
                      ))}
                  </div>
                </section>
              ))}
          </div>
        </article>
      ))}

      {hymnPlans.length > 0 ? (
        <article className="panel panel--soft-stack">
          <span className="section-badge">
            <SparkIcon className="icon" />
            Choir Hymns for Today
          </span>
          {hymnPlans.map((plan) => (
            <div key={plan.id} className="community-stack">
              <div>
                <h2>{plan.title}</h2>
                {plan.note ? <p>{plan.note}</p> : null}
              </div>
              {plan.hymns.map((hymn) => (
                <section key={hymn.id} className="missal-section">
                  <h3>{hymn.part ? `${hymn.part}: ${hymn.title}` : hymn.title}</h3>
                  <div className="missal-section__body">
                    {hymn.lyrics
                      .split(/\n+/)
                      .map((line) => line.trim())
                      .filter(Boolean)
                      .map((line, index) => (
                        <p key={`${hymn.id}-${index}`}>{line}</p>
                      ))}
                  </div>
                </section>
              ))}
            </div>
          ))}
        </article>
      ) : null}
    </div>
  );
}
