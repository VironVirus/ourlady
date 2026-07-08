import { PageIntro } from "@/components/page-intro";
import { PrayerBrowser } from "@/components/prayer-browser";
import { getSiteContent } from "@/lib/content";
import { getVisiblePrayers } from "@/lib/site-runtime";
import { churchPhotos } from "@/lib/site-media";

export default async function PrayersPage() {
  const content = await getSiteContent();
  const prayers = getVisiblePrayers(content);

  return (
    <div className="page">
      <PageIntro
        eyebrow="Prayers"
        title="Chaplaincy Prayers"
        description="Choose a prayer from the list and pray along as a student community."
        image={churchPhotos.altarInterior.src}
        position={churchPhotos.altarInterior.position}
      />
      <section className="section">
        <div className="container">
          <PrayerBrowser items={prayers} />
        </div>
      </section>
    </div>
  );
}
