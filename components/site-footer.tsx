import Link from "next/link";

type SiteFooterProps = {
  massSummary: string;
  town: string;
};

export function SiteFooter({ massSummary, town }: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div>
          <strong>Our Lady of Lourdes Catholic Church</strong>
          <p>{town}</p>
        </div>
        <div>
          <strong>Mass</strong>
          <p>{massSummary}</p>
        </div>
        <div>
          <strong>Explore</strong>
          <p>
            <Link href="/associations">Associations</Link> · <Link href="/contact">Contact</Link>
          </p>
        </div>
        <div>
          <strong>Powered by</strong>
          <p>
            <a
              href="https://wa.me/2347067038882?text=Hello%20Tapxora%20Concepts"
              target="_blank"
              rel="noreferrer"
            >
              Powered by Tapxora Concepts
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
