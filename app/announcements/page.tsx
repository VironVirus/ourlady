import { PageIntro } from "@/components/page-intro";
import { CrossIcon } from "@/components/site-icons";
import { getSiteContent } from "@/lib/content";
import { churchPhotos } from "@/lib/site-media";

export default async function AnnouncementsPage() {
  const content = await getSiteContent();

  return (
    <div className="page">
      <PageIntro
        eyebrow="Announcements"
        title="Parish Announcements"
        description="Important notices and reminders."
        image={churchPhotos.frontExterior.src}
        position={churchPhotos.frontExterior.position}
      />
      <section className="section">
        <div className="container story-grid">
          {content.announcements.map((item) => (
            <article key={item.id} className="story-card">
              <span className="section-badge">
                <CrossIcon className="icon" />
                {item.tag}
              </span>
              <h2>{item.title}</h2>
              <p>{item.detail}</p>
              <div className="story-card__meta">
                <span>{item.date}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
