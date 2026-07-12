import { notFound } from "next/navigation";
import { AttendanceCheckInForm } from "@/components/attendance-check-in-form";
import { PageIntro } from "@/components/page-intro";
import {
  getAttendanceRequestByToken,
  getAttendanceRequestStatus,
  isAttendanceRequestOpen
} from "@/lib/community-modules";
import { churchPhotos } from "@/lib/site-media";

type AttendanceCheckInPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function AttendanceCheckInPage({
  params
}: AttendanceCheckInPageProps) {
  const { token } = await params;
  const request = await getAttendanceRequestByToken(token);

  if (!request) {
    notFound();
  }

  const isOpen = isAttendanceRequestOpen(request);
  const statusLabel = getAttendanceRequestStatus(request);

  return (
    <div className="page">
      <PageIntro
        eyebrow="Attendance"
        title={request.title}
        description="Scan, fill in your details, and record your Mass attendance."
        image={churchPhotos.frontExterior.src}
        position={churchPhotos.frontExterior.position}
      />
      <section className="section">
        <div className="container story-article">
          <article className="story-article__main">
            <AttendanceCheckInForm
              token={token}
              isOpen={isOpen}
              statusLabel={statusLabel}
              requestTitle={request.title}
            />
          </article>
          <aside className="story-article__aside">
            <div className="panel panel--soft-stack">
              <h2>{request.date}</h2>
              <p>{request.location}</p>
              {request.note ? <p>{request.note}</p> : null}
              {request.opensAt || request.closesAt ? (
                <div className="story-card__meta">
                  {request.opensAt ? <span>Opens: {request.opensAt}</span> : null}
                  {request.closesAt ? <span>Closes: {request.closesAt}</span> : null}
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
