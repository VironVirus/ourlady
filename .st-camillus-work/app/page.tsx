import Link from "next/link";
import { HeroSlideshow } from "@/components/hero-slideshow";
import { HomeNewsShowcase } from "@/components/home-news-showcase";
import {
  ClockIcon,
  CrossIcon,
  DocumentIcon,
  SparkIcon
} from "@/components/site-icons";
import { getSiteContent } from "@/lib/content";
import { getLiturgicalDayInfo } from "@/lib/liturgical-calendar";
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
import { siteIdentity } from "@/lib/site-identity";

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
  const isTodayMassEntry = Boolean(focusEntry?.isToday);
  const celebration =
    (isTodayMassEntry ? focusItem?.liturgyTitle : "") || liturgicalDay?.title || focusItem?.liturgyTitle || "";
  const season =
    (isTodayMassEntry ? focusItem?.liturgySeason : "") || liturgicalDay?.season || focusItem?.liturgySeason || "";
  const liturgicalColor =
    (isTodayMassEntry ? focusItem?.liturgyColor : "") || liturgicalDay?.color || focusItem?.liturgyColor || "";
  const focusSaint =
    (focusItem?.saintSlug
      ? content.saints.find((item) => item.slug === focusItem.saintSlug && item.published)
      : null) ?? activeSaint;
  const automaticSaint = !focusSaint && liturgicalDay?.saint ? liturgicalDay.saint : null;
  const dailyReadings = liturgicalDay?.readings ?? null;
  const saintDisplayName = focusSaint?.name || automaticSaint?.name || "";
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
      label: "Chaplaincy News",
      meta: "Read campus stories",
      icon: SparkIcon,
      photo: churchPhotos.processionStreet
    },
    {
      href: "/daily-readings",
      label: "Daily Readings",
      meta: "Readings and saint today",
      icon: DocumentIcon,
      photo: churchPhotos.altarInterior
    },
    {
      href: "/prayers",
      label: "Prayers",
      meta: "Open prayer write-ups",
      icon: CrossIcon,
      photo: churchPhotos.frontExterior
    }
  ];

  return (
    <div className="page">
      <HeroSlideshow slides={heroSlides}>
        <div className="hero__split">
          <div className="hero__panel hero__panel--camillus">
            <div className="hero__kicker-row">
              <div className="eyebrow eyebrow--light">
                Catholic Chaplaincy • College of Health Sciences
              </div>
              <div className="hero__pulse">
                <span className="hero__pulse-dot" aria-hidden="true" />
                <span>Prayer for the healing vocation</span>
              </div>
            </div>

            <h1>{siteIdentity.shortName}</h1>
            <p className="hero__meta">{siteIdentity.fullLocation}</p>
            <p className="hero__lead hero__lead--light">
              {content.mission ||
                "A Catholic chaplaincy rooted in prayer, study, service, and healing compassion."}
            </p>

            <div className="hero__tag-row" aria-label="Student community focus">
              <span>Medical Students</span>
              <span>Daily Mass</span>
              <span>Readings</span>
              <span>Formation</span>
            </div>

            <div className="hero__actions hero__actions--left">
              <Link href="/mass-schedule" className="button button--primary">
                Worship This Week
              </Link>
              <Link href="/daily-readings" className="button button--ghost">
                Daily Readings
              </Link>
            </div>

            <div className="hero__dots" aria-hidden="true">
              {heroSlides.map((slide) => (
                <span key={slide.src} />
              ))}
            </div>
          </div>

          <aside className="hero__rail">
            <div className="hero__rail-card">
              <span className="section-badge section-badge--light">
                <ClockIcon className="icon" />
                Today at the Chaplaincy
              </span>
              <h2>{celebration || "Daily Worship"}</h2>
              {focusEntry ? <p className="hero__rail-date">{focusEntry.labels.longDate}</p> : null}

              {massTimes.length > 0 ? (
                <div className="hero__rail-times">
                  {massTimes.slice(0, 3).map((massTime) => (
                    <div key={massTime} className="hero__rail-time">
                      <ClockIcon className="icon icon--tiny" />
                      <strong>{massTime}</strong>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="hero__rail-details">
                {saintDisplayName ? (
                  <div className="hero__rail-detail">
                    <span>Saint of the Day</span>
                    <strong>{saintDisplayName}</strong>
                  </div>
                ) : null}

                {liturgicalColor ? (
                  <div className="hero__rail-detail">
                    <span>Color of the Day</span>
                    <strong>{sentenceCase(liturgicalColor)}</strong>
                  </div>
                ) : null}

                {focusItem ? (
                  <div className="hero__rail-detail">
                    <span>Venue</span>
                    <strong>{getMassVenue(focusItem) || "Chaplaincy"}</strong>
                  </div>
                ) : null}
              </div>

              <div className="hero__rail-actions">
                <Link href="/prayers" className="button button--secondary">
                  Open Prayers
                </Link>
                <Link href="/news" className="text-link text-link--light">
                  See chaplaincy news
                </Link>
              </div>
            </div>
          </aside>
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

                {dailyReadings ? (
                  <div className="today-panel__readings">
                    <div className="today-panel__readings-head">
                      <span>Daily Readings</span>
                      {dailyReadings.lectionary ? <strong>Lectionary {dailyReadings.lectionary}</strong> : null}
                    </div>
                    <div className="today-panel__reading-list">
                      {dailyReadings.references.map((reading) => (
                        <div key={`${reading.label}-${reading.citation}`} className="today-panel__reading">
                          <span>{reading.label}</span>
                          <strong>{reading.citation}</strong>
                        </div>
                      ))}
                    </div>
                    <p className="today-panel__reading-note">
                      Read the full passages below on the Daily Readings page.
                    </p>
                    <Link href="/daily-readings" className="text-link">
                      Open full readings
                    </Link>
                  </div>
                ) : null}
              </div>

              <div className="today-panel__side">
                {focusSaint ? (
                  <Link href={`/saints/${focusSaint.slug}`} className="today-panel__saint">
                    <span>Saint of the Day</span>
                    <strong>{focusSaint.name}</strong>
                  </Link>
                ) : automaticSaint ? (
                  <Link href="/saints" className="today-panel__saint">
                    <span>Saint of the Day</span>
                    <strong>{automaticSaint.name}</strong>
                  </Link>
                ) : null}

                {liturgicalColor ? (
                  <div className="today-panel__detail">
                    <span>Color of the Day</span>
                    <strong>{sentenceCase(liturgicalColor)}</strong>
                  </div>
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
                  <Link href="/daily-readings" className="button button--secondary">
                    Daily Readings
                  </Link>
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
            <h2>Chaplaincy News</h2>
          </div>
          <Link href="/news" className="text-link">
            View all news
          </Link>
        </div>
        <div className="container home-news-grid">
          {newsItems.length > 0 ? (
            <HomeNewsShowcase items={newsItems.slice(0, 5)} />
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
            <h2>Chaplaincy Announcements</h2>
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
                "linear-gradient(180deg, rgba(6, 26, 30, 0.16), rgba(6, 26, 30, 0.78))"
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
