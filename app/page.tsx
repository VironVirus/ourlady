import Link from "next/link";
import { HeroSlideshow } from "@/components/hero-slideshow";
import {
  ClockIcon,
  CrossIcon,
  DocumentIcon,
  GalleryIcon,
  MapPinIcon,
  SparkIcon
} from "@/components/site-icons";
import { getSiteContent } from "@/lib/content";
import { getPublishedDocuments } from "@/lib/documents";
import { getPublishedNewsPosts } from "@/lib/news";
import {
  churchPhotos,
  gallerySlides,
  heroSlides,
  photoBackground
} from "@/lib/site-media";

const quickLinks = [
  {
    href: "/mass-schedule",
    label: "Mass Times",
    meta: "Sunday and weekday worship",
    icon: ClockIcon,
    photo: churchPhotos.altarInterior
  },
  {
    href: "/news",
    label: "News",
    meta: "Parish stories and updates",
    icon: SparkIcon,
    photo: churchPhotos.processionStreet
  },
  {
    href: "/announcements",
    label: "Announcements",
    meta: "Important notices",
    icon: CrossIcon,
    photo: churchPhotos.frontExterior
  },
  {
    href: "/gallery",
    label: "Gallery",
    meta: "Church life in pictures",
    icon: GalleryIcon,
    photo: churchPhotos.processionCourtyard
  }
];

export default async function HomePage() {
  const [content, newsItems, documents] = await Promise.all([
    getSiteContent(),
    getPublishedNewsPosts(),
    getPublishedDocuments()
  ]);
  const featuredPriest = content.priests[0];

  return (
    <div className="page">
      <HeroSlideshow slides={heroSlides}>
        <div className="hero__panel">
          <div className="eyebrow eyebrow--light">Catholic Parish</div>
          <h1>Our Lady of Lourdes Catholic Church</h1>
          <p className="hero__meta">Maryland, Enugu</p>
          <p className="hero__lead hero__lead--light">{content.mission}</p>
          <div className="hero__actions hero__actions--left">
            <Link href="/mass-schedule" className="button button--primary">
              Mass Schedule
            </Link>
            <Link href="/announcements" className="button button--ghost">
              Announcements
            </Link>
          </div>
          <div className="hero__dots" aria-hidden="true">
            {heroSlides.map((slide) => (
              <span key={slide.src} />
            ))}
          </div>
        </div>
      </HeroSlideshow>

      <section className="section section--tight">
        <div className="container quick-link-grid">
          {quickLinks.map(({ href, label, meta, icon: Icon, photo }) => (
            <Link
              key={label}
              href={href}
              className="quick-link"
              style={photoBackground(
                photo,
                "linear-gradient(180deg, rgba(20, 14, 10, 0.18), rgba(20, 14, 10, 0.7))"
              )}
            >
              <span className="quick-link__icon">
                <Icon className="icon" />
              </span>
              <strong>{label}</strong>
              <span>{meta}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container split-grid split-grid--featured">
          <article
            className="photo-card photo-card--wide"
            style={photoBackground(churchPhotos.altarInterior)}
          >
            <div className="photo-card__content">
              <div className="eyebrow eyebrow--light">Join Us</div>
              <h2>Mass and Prayer</h2>
              <div className="schedule-pill-row">
                {content.massSchedule.slice(0, 4).map((item) => (
                  <div key={item.id} className="schedule-pill">
                    <span>{item.day}</span>
                    <strong>{item.time}</strong>
                  </div>
                ))}
              </div>
            </div>
          </article>

          {featuredPriest ? (
            <article
              className="photo-card photo-card--tall"
              style={photoBackground(churchPhotos.priest)}
            >
              <div className="photo-card__content">
                <div className="eyebrow eyebrow--light">Priest</div>
                <h2>{featuredPriest.name}</h2>
                <p>{featuredPriest.motto}</p>
                <Link href="/priest" className="text-link text-link--light">
                  View priests
                </Link>
              </div>
            </article>
          ) : null}
        </div>
      </section>

      <section className="section section--soft">
        <div className="container section__heading">
          <div>
            <div className="eyebrow">News Section</div>
            <h2>Parish News</h2>
          </div>
          <Link href="/news" className="text-link">
            View all news
          </Link>
        </div>
        <div className="container story-grid">
          {newsItems.slice(0, 3).map((item, index) => (
            <article
              key={item.id}
              className="story-card story-card--photo"
              style={photoBackground(
                item.image
                  ? {
                      src: item.image,
                      alt: item.title || "Parish news image",
                      position: "center"
                    }
                  : gallerySlides[(index + 1) % gallerySlides.length]
              )}
            >
              <div className="story-card__content">
                <span className="section-badge section-badge--light">
                  <SparkIcon className="icon" />
                  {item.label}
                </span>
                <h2>{item.title}</h2>
                <p>{item.excerpt || item.description}</p>
                <div className="story-card__meta story-card__meta--light">
                  <span>{item.date}</span>
                  <span>{item.location}</span>
                </div>
                <Link href={`/news/${item.slug}`} className="text-link text-link--light">
                  Read full story
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container split-grid">
          <article className="panel panel--soft-stack">
            <div className="section-badge">
              <CrossIcon className="icon" />
              Announcements
            </div>
            <div className="feed-stack">
              {content.announcements.map((item) => (
                <div key={item.id} className="feed-item">
                  <span>{item.tag}</span>
                  <strong>{item.title}</strong>
                  <small>
                    {item.date} · {item.detail}
                  </small>
                </div>
              ))}
            </div>
            <Link href="/announcements" className="text-link">
              Open announcements
            </Link>
          </article>

          <article className="panel panel--soft-stack">
            {documents[0] ? (
              <>
                <div className="section-badge">
                  <DocumentIcon className="icon" />
                  Bulletins
                </div>
                <h2>{documents[0].title}</h2>
                <p>{documents[0].summary}</p>
                <div className="chip-row">
                  <span className="chip">{documents[0].category}</span>
                  <span className="chip">{documents[0].date}</span>
                </div>
                <Link href="/documents" className="text-link">
                  Open bulletins and events
                </Link>
              </>
            ) : (
              <>
                <div className="section-badge">
                  <MapPinIcon className="icon" />
                  Parish
                </div>
                <h2>{content.contact.address}</h2>
                <p>{content.contact.town}</p>
                <div className="chip-row">
                  {content.pastoralUnits.map((item) => (
                    <span key={item.slug} className="chip">
                      {item.name}
                    </span>
                  ))}
                </div>
                <Link href="/pastoral" className="text-link">
                  Pastoral organisation
                </Link>
              </>
            )}
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container section__heading">
          <div>
            <div className="eyebrow">Gallery</div>
            <h2>Parish Moments</h2>
          </div>
          <Link href="/gallery" className="text-link">
            Open gallery
          </Link>
        </div>
        <div className="container photo-mosaic">
          {gallerySlides.slice(0, 4).map((photo, index) => {
            const item = content.gallery[index];

            return (
              <article
                key={photo.src}
                className={`mosaic-card${index === 0 ? " mosaic-card--large" : ""}`}
                style={photoBackground(photo)}
              >
                <div className="mosaic-card__content">
                  <span>{item?.period ?? "Parish"}</span>
                  <h3>{item?.title ?? "Our Lady of Lourdes"}</h3>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
