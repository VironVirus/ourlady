import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page">
      <section className="section">
        <div className="container empty-state">
          <div className="eyebrow">Page Not Found</div>
          <h1>The page you requested does not exist.</h1>
          <p>
            Let&apos;s bring you back to the chaplaincy homepage and continue from
            there.
          </p>
          <Link href="/" className="button button--primary">
            Return Home
          </Link>
        </div>
      </section>
    </div>
  );
}
