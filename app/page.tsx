import Link from "next/link";
import { HeroSlideshow } from "@/components/hero-slideshow";
import {
  ClockIcon,
  CrossIcon,
  DocumentIcon,
  SparkIcon,
  UsersIcon
} from "@/components/site-icons";
import { getSiteContent } from "@/lib/content";
import { getPublishedDocuments } from "@/lib/documents";
import { getPublishedNewsPosts } from "@/lib/news";
import { getActiveSaint } from "@/lib/site-runtime";
import {
  churchPhotos,
  gallerySlides,
  heroSlides,
  photoBackground
} from "@/lib/site-media";

export default async function HomePage() {
  const [content, newsItems, documents] = await Promise.all([
    getSiteContent(),
    getPublishedNewsPosts(),
    getPublishedDocuments()
  ]);
  const featuredPriest = content.priests[0];
  const featuredSaint = getActiveSaint(content);
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
      href: "/associations",
      label: "Associations",
      meta: "CYON, CMO, CWO and more",
      icon: UsersIcon,
      photo: churchPhotos.processionCourtyard
    }
  ];

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
              {content.churchTimesNote ? <p>{content.churchTimesNote}</p> : null}
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
          {newsItems.length > 0 ? (
            newsItems.slice(0, 3).map((item, index) => (
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
            ))
          ) : (
            <div className="panel empty-state">
              <h2>No parish news yet.</h2>
              <p>Real parish news can be added from the admin area when ready.</p>
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container split-grid">
          <article className="panel panel--soft-stack">
            <div className="section-badge">
              <CrossIcon className="icon" />
              Announcements
            </div>
            {content.announcements.length > 0 ? (
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
            ) : (
              <p>No announcements have been published yet.</p>
            )}
            <Link href="/announcements" className="text-link">
              Open announcements
            </Link>
          </article>

          <article className="panel panel--soft-stack">
            {featuredSaint ? (
              <>
                <div className="section-badge">
                  <CrossIcon className="icon" />
                  Saint of the Day
                </div>
                <h2>{featuredSaint.name}</h2>
                <p>{featuredSaint.excerpt}</p>
                <div className="chip-row">
                  <span className="chip">{featuredSaint.title}</span>
                  <span className="chip">{featuredSaint.feastDay}</span>
                </div>
                <Link href={`/saints/${featuredSaint.slug}`} className="text-link">
                  Read saint story
                </Link>
              </>
            ) : documents[0] ? (
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
                  <CrossIcon className="icon" />
                  Saint of the Day
                </div>
                <h2>Saint stories coming soon</h2>
                <p>Add saint stories from the admin area to feature them on the homepage.</p>
              </>
            )}
          </article>
        </div>
      </section>

      <section className="section section--soft">
        <div className="container section__heading">
          <div>
            <div className="eyebrow">Associations</div>
            <h2>Find Your Association</h2>
          </div>
          <Link href="/associations" className="text-link">
            View all associations
          </Link>
        </div>
        <div className="container association-strip">
          {content.associations.slice(0, 4).map((item) => (
            <Link key={item.slug} href={`/associations/${item.slug}`} className="association-chip-card">
              <span>{item.shortName}</span>
              <strong>{item.name}</strong>
              <small>{item.meeting || item.lead}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container section__heading">
          <div>
            <div className="eyebrow">Latest News</div>
            <h2>More News Previews</h2>
          </div>
          <Link href="/news" className="text-link">
            Open all news
          </Link>
        </div>
        <div className="container news-preview-grid">
          {newsItems.length > 0 ? (
            newsItems.slice(0, 4).map((item) => (
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
                  Read story
                </Link>
              </article>
            ))
          ) : (
            <div className="panel empty-state">
              <h2>No news previews yet.</h2>
              <p>Published news will appear here once real stories are added.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
