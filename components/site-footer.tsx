import Link from "next/link";

type SiteFooterProps = {
  massSummary: string;
  town: string;
};

export function SiteFooter({ massSummary, town }: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div className="site-footer__block">
          <strong>Our Lady of Lourdes Catholic Church</strong>
          <p>{town}</p>
        </div>

        <div className="site-footer__block">
          <strong>Mass</strong>
          <p>{massSummary}</p>
        </div>

        <div className="site-footer__block">
          <strong>Explore</strong>
          <p className="site-footer__links">
            <Link href="/associations" prefetch={false}>CYON</Link>
            <span aria-hidden="true">•</span>
            <Link href="/contact" prefetch={false}>Contact</Link>
          </p>
        </div>

        <div className="site-footer__block">
          <strong>Powered by</strong>
          <p>
            <a
              className="site-footer__credit"
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
