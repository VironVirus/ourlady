import Link from "next/link";
import { HeroSlideshow } from "@/components/hero-slideshow";
import { NewsSlideshow } from "@/components/news-slideshow";
import {
  ClockIcon,
  CrossIcon,
  SparkIcon,
  UsersIcon
} from "@/components/site-icons";
import { getSiteContent } from "@/lib/content";
import { getLiturgicalDayInfo } from "@/lib/liturgical-calendar";
import { getNewsImages } from "@/lib/news-images";
import { getPublishedNewsPosts } from "@/lib/news";
import {
  getActiveSaint,
  getMassEntryForDate,
  getMassTimes,
  getMassVenue,
  getRollingMassWeek,
  getSiteDateKey
} from "@/lib/site-runtime";
import {
  churchPhotos,
  heroSlides,
  photoBackground
} from "@/lib/site-media";

function sentenceCase(value: string) {
  if (!value) {
    return "";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default async function HomePage() {
  const dateKey = getSiteDateKey();
  const [content, newsItems, liturgicalDay] = await Promise.all([
    getSiteContent(),
    getPublishedNewsPosts(),
    getLiturgicalDayInfo(dateKey)
  ]);
  const activeSaint = getActiveSaint(content, dateKey);
  const todayEntry = getMassEntryForDate(content, dateKey);
  const nextUpcomingEntry =
    getRollingMassWeek(content).find((entry) => entry.item) ?? todayEntry;
  const focusEntry = todayEntry?.item ? todayEntry : nextUpcomingEntry;
  const focusItem = focusEntry?.item ?? null;
  const massTimes = focusItem ? getMassTimes(focusItem) : [];
  const celebration = focusItem?.liturgyTitle || liturgicalDay?.title || "";
  const season = focusItem?.liturgySeason || liturgicalDay?.season || "";
  const liturgicalColor = focusItem?.liturgyColor || liturgicalDay?.color || "";
  const focusSaint =
    (focusItem?.saintSlug
      ? content.saints.find((item) => item.slug === focusItem.saintSlug && item.published)
      : null) ?? activeSaint;
  const quickLinks = [
    {
      href: "/mass-schedule",
      label: "Mass Schedule",
      meta: "See the full 7-day plan",
      icon: ClockIcon,
      photo: churchPhotos.altarInterior
    },
    {
      href: "/news",
      label: "Parish News",
      meta: "Read all stories",
      icon: SparkIcon,
      photo: churchPhotos.processionStreet
    },
    {
      href: "/prayers",
      label: "Prayers",
      meta: "Open prayer write-ups",
      icon: CrossIcon,
      photo: churchPhotos.frontExterior
    },
    {
      href: "/associations",
      label: "Associations",
      meta: "CYON, CMO, CWO, servers",
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
          <p className="hero__lead hero__lead--light">
            {content.mission || "A Catholic parish family rooted in prayer and service."}
          </p>
          <div className="hero__actions hero__actions--left">
            <Link href="/mass-schedule" className="button button--primary">
              Mass Schedule
            </Link>
            <Link href="/news" className="button button--ghost">
              Parish News
            </Link>
          </div>
          <div className="hero__dots" aria-hidden="true">
            {heroSlides.map((slide) => (
              <span key={slide.src} />
            ))}
          </div>
        </div>
      </HeroSlideshow>

      <section className="section">
        <div className="container">
          <article className="panel today-panel">
            <div className="today-panel__head">
              <div>
                <div className="eyebrow">Mass and Prayer</div>
                <h2>{focusEntry?.isToday ? "Today" : "Next Mass Day"}</h2>
                {focusEntry ? <p className="today-panel__date">{focusEntry.labels.longDate}</p> : null}
              </div>
              <div className="chip-row">
                {season ? <span className="chip">{season}</span> : null}
                {liturgicalColor ? <span className="chip">{sentenceCase(liturgicalColor)}</span> : null}
              </div>
            </div>

            <div className="today-panel__grid">
              <div className="today-panel__main">
                {celebration ? (
                  <span className="section-badge">
                    <SparkIcon className="icon" />
                    {celebration}
                  </span>
                ) : null}

                {massTimes.length > 0 ? (
                  <div className="today-panel__times">
                    {massTimes.map((massTime) => (
                      <div key={massTime} className="today-panel__time">
                        <ClockIcon className="icon icon--tiny" />
                        <strong>{massTime}</strong>
                      </div>
                    ))}
                  </div>
                ) : null}

                {focusItem?.readingQuote ? (
                  <blockquote className="today-panel__quote">
                    <p>{focusItem.readingQuote}</p>
                    {focusItem.readingReference ? (
                      <footer>{focusItem.readingReference}</footer>
                    ) : null}
                  </blockquote>
                ) : null}
              </div>

              <div className="today-panel__side">
                {focusSaint ? (
                  <Link href={`/saints/${focusSaint.slug}`} className="today-panel__saint">
                    <span>Saint of the Day</span>
                    <strong>{focusSaint.name}</strong>
                  </Link>
                ) : null}

                {focusItem?.reflectionTheme ? (
                  <div className="today-panel__detail">
                    <span>Reflection Theme</span>
                    <strong>{focusItem.reflectionTheme}</strong>
                  </div>
                ) : null}

                {focusItem ? (
                  <div className="today-panel__detail">
                    <span>Venue</span>
                    <strong>{getMassVenue(focusItem) || "Main Church"}</strong>
                  </div>
                ) : null}

                {content.churchTimesNote ? (
                  <p className="today-panel__note">{content.churchTimesNote}</p>
                ) : null}

                <div className="today-panel__actions">
                  <Link href="/prayers" className="button button--secondary">
                    Open Prayers
                  </Link>
                  <Link href="/mass-schedule" className="text-link">
                    Full week
                  </Link>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="section section--soft">
        <div className="container section__heading">
          <div>
            <div className="eyebrow">News</div>
            <h2>Parish News</h2>
          </div>
          <Link href="/news" className="text-link">
            View all news
          </Link>
        </div>
        <div className="container story-grid">
          {newsItems.length > 0 ? (
            newsItems.slice(0, 3).map((item) => (
              <article key={item.id} className="story-card story-card--photo">
                <NewsSlideshow
                  className="story-card__media"
                  images={getNewsImages(item)}
                  emptyLabel="No story image"
                  overlay="linear-gradient(180deg, rgba(26, 17, 10, 0.18), rgba(26, 17, 10, 0.76))"
                />
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
              <h2>No news yet.</h2>
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container section__heading">
          <div>
            <div className="eyebrow">Announcements</div>
            <h2>Parish Announcements</h2>
          </div>
          <Link href="/announcements" className="text-link">
            Open announcements
          </Link>
        </div>
        <div className="container news-preview-grid">
          {content.announcements.length > 0 ? (
            content.announcements.slice(0, 4).map((item) => (
              <article key={item.id} className="news-preview-card">
                <div className="news-preview-card__body">
                  <span className="section-badge">
                    <CrossIcon className="icon" />
                    {item.tag || "Notice"}
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                  <div className="story-card__meta">
                    <span>{item.date}</span>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="panel empty-state">
              <h2>No announcements yet.</h2>
            </div>
          )}
        </div>
      </section>

      <section className="section section--tight">
        <div className="container quick-link-grid">
          {quickLinks.map(({ href, label, meta, icon: Icon, photo }) => (
            <Link
              key={label}
              href={href}
              className="quick-link"
              style={photoBackground(
                photo,
                "linear-gradient(180deg, rgba(20, 14, 10, 0.18), rgba(20, 14, 10, 0.72))"
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
    </div>
  );
}
