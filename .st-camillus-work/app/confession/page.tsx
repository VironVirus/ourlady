import { ConfessionBrowser } from "@/components/confession-browser";
import { PageIntro } from "@/components/page-intro";
import {
  readConfessionReservations,
  readConfessionSchedules
} from "@/lib/community-modules";
import { getSiteDateKey } from "@/lib/site-runtime";
import { churchPhotos } from "@/lib/site-media";

export default async function ConfessionPage() {
  const today = getSiteDateKey();
  const [schedules, reservations] = await Promise.all([
    readConfessionSchedules(),
    readConfessionReservations()
  ]);
  const publishedSchedules = schedules.filter(
    (item) => item.published && (!item.date || item.date >= today)
  );

  return (
    <div className="page">
      <PageIntro
        eyebrow="Confession"
        title="Confession Schedule"
        description="Choose a confession time and come prayerfully at the slot you reserve."
        image={churchPhotos.altarInterior.src}
        position={churchPhotos.altarInterior.position}
      />
      <section className="section section--soft">
        <div className="container">
          <ConfessionBrowser
            schedules={publishedSchedules}
            reservations={reservations}
          />
        </div>
      </section>
    </div>
  );
}
