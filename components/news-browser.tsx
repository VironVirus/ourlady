"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { NewsSlideshow } from "@/components/news-slideshow";
import { SparkIcon } from "@/components/site-icons";
import { getNewsImages } from "@/lib/news-images";
import type { NewsPost } from "@/lib/news";

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
        <h2>No news yet.</h2>
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
          <NewsSlideshow
            className="news-feature__image"
            images={getNewsImages(featured)}
            emptyLabel="No story image"
          />
        </article>
      ) : null}

      <div className="news-browser__grid">
        {rest.map((item) => (
          <article key={item.id} className="news-preview-card">
            <NewsSlideshow
              className="news-preview-card__image"
              images={getNewsImages(item)}
              emptyLabel="No story image"
              overlay="linear-gradient(180deg, rgba(17, 12, 9, 0.06), rgba(17, 12, 9, 0.3))"
            />
            <div className="news-preview-card__body">
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
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
