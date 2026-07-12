import { MissalBrowser } from "@/components/missal-browser";
import { PageIntro } from "@/components/page-intro";
import { getPublishedMissalContent } from "@/lib/community-modules";
import { getSiteDateKey } from "@/lib/site-runtime";
import { churchPhotos } from "@/lib/site-media";

export default async function MissalPage() {
  const dateKey = getSiteDateKey();
  const { missalEntries, hymnPlans } = await getPublishedMissalContent(dateKey);

  return (
    <div className="page">
      <PageIntro
        eyebrow="Missal"
        title="Mass Companion"
        description="Follow the Order of Mass, daily prayers, and choir hymns in the language you prefer."
        image={churchPhotos.altarInterior.src}
        position={churchPhotos.altarInterior.position}
      />
      <section className="section section--soft">
        <div className="container">
          <MissalBrowser
            entries={missalEntries}
            hymnPlans={hymnPlans}
            dateKey={dateKey}
          />
        </div>
      </section>
    </div>
  );
}
