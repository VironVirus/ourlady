"use client";

import { useEffect, useMemo, useState } from "react";
import { SparkIcon } from "@/components/site-icons";

type NewsSlideshowProps = {
  images: string[];
  className?: string;
  overlay?: string;
  emptyLabel?: string;
  intervalMs?: number;
  position?: string;
  fit?: "cover" | "contain";
};

export function NewsSlideshow({
  images,
  className = "",
  overlay = "linear-gradient(180deg, rgba(17, 12, 9, 0.08), rgba(17, 12, 9, 0.38))",
  emptyLabel,
  intervalMs = 4200,
  position = "center",
  fit = "cover"
}: NewsSlideshowProps) {
  const slides = useMemo(
    () => images.map((item) => item.trim()).filter(Boolean),
    [images]
  );
  const slideKey = slides.join("|");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [slideKey]);

  useEffect(() => {
    if (slides.length < 2) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [intervalMs, slides.length]);

  return (
    <div
      className={`news-slideshow news-slideshow--${fit}${slides.length === 0 ? " is-empty" : ""}${
        className ? ` ${className}` : ""
      }`}
    >
      {slides.map((image, index) => (
        <div
          key={`${image}-${index}`}
          className={`news-slideshow__slide${index === activeIndex ? " is-active" : ""}`}
          style={{
            backgroundImage: `${overlay}, url(${image})`,
            backgroundPosition: position
          }}
        />
      ))}

      {slides.length === 0 && emptyLabel ? (
        <div className="news-slideshow__empty">
          <SparkIcon className="icon" />
          <span>{emptyLabel}</span>
        </div>
      ) : null}

      {slides.length > 1 ? (
        <div className="news-slideshow__dots" aria-hidden="true">
          {slides.map((image, index) => (
            <span key={`${image}-dot-${index}`} className={index === activeIndex ? "is-active" : undefined} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
