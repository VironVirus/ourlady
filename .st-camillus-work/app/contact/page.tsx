import { PageIntro } from "@/components/page-intro";
import { ClockIcon, MapPinIcon } from "@/components/site-icons";
import { getSiteContent } from "@/lib/content";
import { siteIdentity } from "@/lib/site-identity";
import { churchPhotos, photoBackground } from "@/lib/site-media";

export default async function ContactPage() {
  const content = await getSiteContent();

  return (
    <div className="page">
      <PageIntro
        eyebrow="Contact"
        title="Visit the Chaplaincy"
        description={siteIdentity.fullName}
        image={churchPhotos.frontExterior.src}
        position={churchPhotos.frontExterior.position}
      />
      <section className="section">
        <div className="container split-grid">
          <article
            className="photo-card photo-card--medium"
            style={photoBackground(churchPhotos.frontExterior)}
          >
            <div className="photo-card__content">
              <div className="eyebrow eyebrow--light">Location</div>
              <h2>{content.contact.address}</h2>
              <p>{content.contact.town}</p>
            </div>
          </article>

          <article className="panel panel--soft-stack">
            <div className="section-badge">
              <MapPinIcon className="icon" />
              Chaplaincy Office
            </div>
            <p>{content.contact.address}</p>
            <p>{content.contact.town}</p>
            {content.contact.phone ? <p>{content.contact.phone}</p> : null}
            {content.contact.email ? <p>{content.contact.email}</p> : null}

            <div className="section-badge">
              <ClockIcon className="icon" />
              Office Hours
            </div>
            <div className="chip-row">
              {content.contact.officeHours.map((item) => (
                <span key={item} className="chip">
                  {item}
                </span>
              ))}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
