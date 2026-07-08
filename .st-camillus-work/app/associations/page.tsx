import { PageIntro } from "@/components/page-intro";
import { UsersIcon } from "@/components/site-icons";
import { churchPhotos } from "@/lib/site-media";

export default async function AssociationsPage() {
  return (
    <div className="page">
      <PageIntro
        eyebrow="Students"
        title="Departments and Student Communities"
        description="This chaplaincy is tailored for medical students. Department-based details can be added later when needed."
        image={churchPhotos.processionCourtyard.src}
        position={churchPhotos.processionCourtyard.position}
      />
      <section className="section">
        <div className="container">
          <article className="panel panel--soft-stack">
            <span className="section-badge">
              <UsersIcon className="icon" />
              Student Community
            </span>
            <h2>Medical student departments and communities can be added later.</h2>
            <p>
              For now, the website is focused on worship, daily readings, news, announcements,
              prayers, and chaplaincy life for students of the College of Health Sciences.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
