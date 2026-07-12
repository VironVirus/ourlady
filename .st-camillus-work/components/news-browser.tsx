"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  MapPinIcon,
  MessageIcon,
  SparkIcon
} from "@/components/site-icons";
import { getNewsImages } from "@/lib/news-images";
import type { NewsPost } from "@/lib/news";
import { NewsSlideshow } from "./news-slideshow";

type NewsBrowserProps = {
  items: NewsPost[];
};

const pageSize = 6;

export function NewsBrowser({ items }: NewsBrowserProps) {
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(items.map((item) => item.label).filter(Boolean)))],
    [items]
  );
  const [activeCategory, setActiveCategory] = useState(categories[0] ?? "All");
  const [page, setPage] = useState(1);
  const currentCategory = categories.includes(activeCategory) ? activeCategory : "All";

  const filteredItems =
    currentCategory === "All"
      ? items
      : items.filter((item) => item.label === currentCategory);

  const pageCount = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleItems = filteredItems.slice(startIndex, startIndex + pageSize);

  if (items.length === 0) {
    return (
      <div className="panel empty-state">
        <h2>No news yet.</h2>
      </div>
    );
  }

  return (
    <div className="news-browser">
      <div className="news-browser__toolbar">
        <div className="news-browser__summary">
          <span className="section-badge">
            <SparkIcon className="icon" />
            Chaplaincy Updates
          </span>
          <h2>Latest stories from the chaplaincy</h2>
          <p>
            Browse recent worship life, student activities, chaplaincy updates, and community news.
          </p>
        </div>

        <div className="news-browser__filters">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`news-filter${currentCategory === category ? " is-active" : ""}`}
              onClick={() => {
                setActiveCategory(category);
                setPage(1);
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="news-browser__grid">
        {visibleItems.map((item) => (
          <article key={item.id} className="news-list-card">
            <div className="news-list-card__head">
              <span className="section-badge">
                <SparkIcon className="icon" />
                {item.label}
              </span>
              <h3>{item.title}</h3>
            </div>

            <NewsSlideshow
              className="news-list-card__image"
              images={getNewsImages(item)}
              emptyLabel="No story image"
              fit="contain"
              overlay="linear-gradient(180deg, rgba(17, 12, 9, 0.02), rgba(17, 12, 9, 0.14))"
            />

            <div className="news-list-card__meta">
              <span>{item.date || "Date to be added"}</span>
              <span>
                <MapPinIcon className="icon icon--tiny" />
                {item.location || "St Camillus Chaplaincy"}
              </span>
            </div>

            <p>{item.excerpt || item.description}</p>

            <div className="news-list-card__footer">
              <div className="news-stats">
                <span>
                  <HeartIcon className="icon icon--tiny" />
                  {item.likes}
                </span>
                <span>
                  <MessageIcon className="icon icon--tiny" />
                  {item.comments}
                </span>
              </div>

              <Link href={`/news/${item.slug}`} className="text-link">
                Read full story
              </Link>
            </div>
          </article>
        ))}
      </div>

      {pageCount > 1 ? (
        <div className="news-pagination">
          <button
            type="button"
            className="news-pagination__button"
            disabled={currentPage <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            <ChevronLeftIcon className="icon icon--tiny" />
            Previous
          </button>

          <div className="news-pagination__pages" aria-label="News pages">
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                className={`news-pagination__page${pageNumber === currentPage ? " is-active" : ""}`}
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="news-pagination__button"
            disabled={currentPage >= pageCount}
            onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
          >
            Next
            <ChevronRightIcon className="icon icon--tiny" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
