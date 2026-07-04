"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SparkIcon } from "@/components/site-icons";
import type { NewsPost } from "@/lib/news";
import { churchPhotos } from "@/lib/site-media";

type NewsBrowserProps = {
  items: NewsPost[];
};

export function NewsBrowser({ items }: NewsBrowserProps) {
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(items.map((item) => item.label).filter(Boolean)))],
    [items]
  );
  const [activeCategory, setActiveCategory] = useState(categories[0] ?? "All");

  const filteredItems =
    activeCategory === "All"
      ? items
      : items.filter((item) => item.label === activeCategory);
  const [featured, ...rest] = filteredItems;

  if (items.length === 0) {
    return (
      <div className="panel empty-state">
        <h2>Parish news will appear here soon.</h2>
        <p>Recent stories, events, and community moments will be added from the admin area.</p>
      </div>
    );
  }

  return (
    <div className="news-browser">
      <div className="news-browser__filters">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={`news-filter${activeCategory === category ? " is-active" : ""}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {featured ? (
        <article className="news-feature">
          <div className="news-feature__copy">
            <span className="section-badge">
              <SparkIcon className="icon" />
              {featured.label}
            </span>
            <h2>{featured.title}</h2>
            <p>{featured.excerpt || featured.description}</p>
            <div className="story-card__meta">
              <span>{featured.date}</span>
              <span>{featured.location}</span>
            </div>
            <Link href={`/news/${featured.slug}`} className="button button--primary">
              Read Full Story
            </Link>
          </div>
          <div
            className="news-feature__image"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(17, 12, 9, 0.1), rgba(17, 12, 9, 0.38)), url(${
                featured.image || churchPhotos.processionStreet.src
              })`
            }}
            aria-label={featured.title}
          />
        </article>
      ) : null}

      <div className="news-browser__grid">
        {rest.map((item) => (
          <article key={item.id} className="news-preview-card">
            <span className="section-badge">
              <SparkIcon className="icon" />
              {item.label}
            </span>
            <h3>{item.title}</h3>
            <p>{item.excerpt || item.description}</p>
            <div className="story-card__meta">
              <span>{item.date}</span>
              <span>{item.location}</span>
            </div>
            <Link href={`/news/${item.slug}`} className="text-link">
              Open story
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
