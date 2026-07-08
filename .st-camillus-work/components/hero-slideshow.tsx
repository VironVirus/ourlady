import type { ReactNode } from "react";
import type { SitePhoto } from "@/lib/site-media";

type HeroSlideshowProps = {
  slides: SitePhoto[];
  children: ReactNode;
};

export function HeroSlideshow({ slides, children }: HeroSlideshowProps) {
  const duration = `${slides.length * 5}s`;

  return (
    <section className="hero hero--immersive">
      <div className="hero-slideshow" aria-hidden="true">
        {slides.map((slide, index) => (
          <div
            key={slide.src}
            className="hero-slide"
            style={{
              backgroundImage: `url(${slide.src})`,
              backgroundPosition: slide.position ?? "center",
              animationDuration: duration,
              animationDelay: `${index * 5}s`
            }}
          />
        ))}
        <div className="hero-slideshow__veil" />
      </div>

      <div className="container hero__content">{children}</div>
    </section>
  );
}
