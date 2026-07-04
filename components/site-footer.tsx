import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div>
          <strong>Our Lady of Lourdes Catholic Church</strong>
          <p>Maryland, Enugu</p>
        </div>
        <div>
          <strong>Mass</strong>
          <p>Sunday · 6:30 AM · 9:00 AM</p>
        </div>
        <div>
          <strong>Explore</strong>
          <p>
            <Link href="/gallery">Gallery</Link> · <Link href="/contact">Contact</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
