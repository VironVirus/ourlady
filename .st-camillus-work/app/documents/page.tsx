import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { DocumentIcon } from "@/components/site-icons";
import { getPublishedDocuments } from "@/lib/documents";
import { churchPhotos, photoBackground } from "@/lib/site-media";

export default async function DocumentsPage() {
  const items = await getPublishedDocuments();

  return (
    <div className="page">
      <PageIntro
        eyebrow="Documents"
        title="Bulletins & Special Events"
        description="Chaplaincy bulletins, event files, and resources shared with students."
        image={churchPhotos.frontExterior.src}
        position={churchPhotos.frontExterior.position}
      />

      <section className="section">
        <div className="container story-grid">
          {items.length === 0 ? (
            <div className="panel empty-state">
              <h2>Documents will appear here soon.</h2>
              <p>Bulletins and special event files can be uploaded from the admin area.</p>
            </div>
          ) : null}

          {items.map((item) => (
            <article
              key={item.id}
              className={`story-card${item.coverImage ? " story-card--photo" : ""}`}
              style={
                item.coverImage
                  ? photoBackground(
                      {
                        src: item.coverImage,
                        alt: item.title,
                        position: "center"
                      },
                      "linear-gradient(180deg, rgba(20, 14, 10, 0.12), rgba(20, 14, 10, 0.7))"
                    )
                  : undefined
              }
            >
              <div className={item.coverImage ? "story-card__content" : undefined}>
                <span className={`section-badge${item.coverImage ? " section-badge--light" : ""}`}>
                  <DocumentIcon className="icon" />
                  {item.category}
                </span>
                <h2>{item.title}</h2>
                <p>{item.summary}</p>
                <div className={`story-card__meta${item.coverImage ? " story-card__meta--light" : ""}`}>
                  <span>{item.date}</span>
                </div>
                <Link
                  href={item.fileUrl}
                  target="_blank"
                  className={item.coverImage ? "button button--ghost" : "text-link"}
                >
                  Open document
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
