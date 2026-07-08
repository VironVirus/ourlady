"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  MapPinIcon,
  MessageIcon,
  SparkIcon
} from "@/components/site-icons";
import { getPrimaryNewsImage } from "@/lib/news-images";
import type { NewsPost } from "@/lib/news";

type HomeNewsShowcaseProps = {
  items: NewsPost[];
};

export function HomeNewsShowcase({ items }: HomeNewsShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const currentIndex = items.length > 0 ? activeIndex % items.length : 0;
  const activeItem = items[currentIndex] ?? null;

  useEffect(() => {
    if (items.length < 2) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, [items.length]);

  if (!activeItem) {
    return (
      <div className="panel empty-state">
        <h2>No news yet.</h2>
      </div>
    );
  }

  function goToNext() {
    setActiveIndex((current) => (current + 1) % items.length);
  }

  function goToPrevious() {
    setActiveIndex((current) => (current - 1 + items.length) % items.length);
  }

  const activeImage = getPrimaryNewsImage(activeItem);

  return (
    <article className="home-news-showcase">
      <div className="home-news-showcase__top">
        <span className="section-badge">
          <SparkIcon className="icon" />
          {activeItem.label || "News"}
        </span>
        {items.length > 1 ? (
          <div className="home-news-showcase__controls">
            <button type="button" className="home-news-showcase__nav" onClick={goToPrevious}>
              <ChevronLeftIcon className="icon" />
              <span className="sr-only">Previous news</span>
            </button>
            <button type="button" className="home-news-showcase__nav" onClick={goToNext}>
              <ChevronRightIcon className="icon" />
              <span className="sr-only">Next news</span>
            </button>
          </div>
        ) : null}
      </div>

      <h3>{activeItem.title}</h3>

      <div
        className={`home-news-showcase__image${activeImage ? "" : " is-empty"}`}
        style={
          activeImage
            ? {
                backgroundImage: `url(${activeImage})`
              }
            : undefined
        }
      >
        {!activeImage ? <span>No story image</span> : null}
      </div>

      <div className="home-news-showcase__meta">
        <span>{activeItem.date || "Date to be added"}</span>
        <span>
          <MapPinIcon className="icon icon--tiny" />
          {activeItem.location || "Parish update"}
        </span>
      </div>

      <p>{activeItem.excerpt || activeItem.description}</p>

      <div className="home-news-showcase__footer">
        <div className="news-stats">
          <span>
            <HeartIcon className="icon icon--tiny" />
            {activeItem.likes}
          </span>
          <span>
            <MessageIcon className="icon icon--tiny" />
            {activeItem.comments}
          </span>
        </div>
        <Link href={`/news/${activeItem.slug}`} className="button button--secondary">
          Read News
        </Link>
      </div>

      {items.length > 1 ? (
        <div className="home-news-showcase__dots" aria-hidden="true">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={index === currentIndex ? "is-active" : undefined}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      ) : null}
    </article>
  );
}
