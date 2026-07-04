"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ChevronDownIcon,
  CloseIcon,
  CrossIcon,
  DocumentIcon,
  GalleryIcon,
  HomeIcon,
  MegaphoneIcon,
  MenuIcon,
  PriestIcon,
  SparkIcon,
  UsersIcon
} from "@/components/site-icons";

type SiteHeaderProps = {
  activeSaint?: {
    name: string;
    slug: string;
  };
  associations: Array<{
    slug: string;
    shortName: string;
    name: string;
  }>;
};

export function SiteHeader({ activeSaint, associations }: SiteHeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);
  const primaryLinks = [
    { href: "/", label: "Home", icon: HomeIcon },
    { href: "/mass-schedule", label: "Mass", icon: CrossIcon },
    { href: "/news", label: "News", icon: SparkIcon }
  ];
  const groupedNavigation = [
    {
      label: "Parish",
      items: [
        { href: "/about", label: "About", icon: CrossIcon },
        { href: "/priest", label: "Priests", icon: PriestIcon },
        { href: "/saints", label: "Saints", icon: CrossIcon },
        { href: "/pastoral", label: "Pastoral", icon: UsersIcon },
        { href: "/contact", label: "Contact", icon: CrossIcon }
      ]
    },
    {
      label: "Associations",
      items: [
        { href: "/associations", label: "All Associations", icon: UsersIcon },
        ...(associations.length > 0
          ? associations.map((item) => ({
              href: `/associations/${item.slug}`,
              label: item.shortName || item.name,
              icon: UsersIcon
            }))
          : [])
      ]
    },
    {
      label: "Resources",
      items: [
        { href: "/announcements", label: "Announcements", icon: MegaphoneIcon },
        { href: "/prayers", label: "Prayers", icon: CrossIcon },
        { href: "/documents", label: "Bulletins", icon: DocumentIcon },
        { href: "/reflections", label: "Reflections", icon: CrossIcon },
        { href: "/gallery", label: "Gallery", icon: GalleryIcon }
      ]
    }
  ];
  const isGroupActive = (hrefs: { href: string }[]) =>
    hrefs.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  const isAdminPage = pathname.startsWith("/admin");

  function closeMobileMenu() {
    setMobileOpen(false);
    setOpenMobileGroup(null);
  }

  function toggleMobileMenu() {
    setMobileOpen((current) => {
      if (current) {
        setOpenMobileGroup(null);
        return false;
      }

      return true;
    });
  }

  if (isAdminPage) {
    return (
      <header className="site-header site-header--minimal">
        <div className="container site-header__inner">
          <Link href="/" className="brand-mark" onClick={closeMobileMenu}>
            <span className="brand-mark__seal">OL</span>
            <span className="brand-mark__text">
              <strong>Our Lady of Lourdes</strong>
              <small>Maryland, Enugu</small>
            </span>
          </Link>
        </div>
      </header>
    );
  }

  const showActiveSaint = pathname === "/" && activeSaint;

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link href="/" className="brand-mark" onClick={closeMobileMenu}>
          <span className="brand-mark__seal">OL</span>
          <span className="brand-mark__text">
            <strong>Our Lady of Lourdes</strong>
            <small>Maryland, Enugu</small>
          </span>
        </Link>

        <div className="site-header__controls">
          {showActiveSaint ? (
            <Link href={`/saints/${activeSaint.slug}`} className="site-saint-pill">
              <span>Saint Today</span>
              <strong>{activeSaint.name}</strong>
            </Link>
          ) : null}

          <nav className="site-nav site-nav--desktop" aria-label="Primary navigation">
            <div className="site-nav__cluster">
              {primaryLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={pathname === item.href ? "is-active" : undefined}
                  >
                    <Icon className="icon icon--tiny" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {groupedNavigation.map((group) => (
              <div key={group.label} className="desktop-dropdown">
                <button
                  type="button"
                  className={`desktop-dropdown__trigger${
                    isGroupActive(group.items) ? " is-active" : ""
                  }`}
                >
                  {group.label}
                  <ChevronDownIcon className="icon icon--tiny" />
                </button>
                <div className="desktop-dropdown__menu">
                  {group.items.map((item) => {
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={pathname === item.href ? "is-active" : undefined}
                      >
                        <Icon className="icon icon--tiny" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <button
            type="button"
            className={`mobile-menu-button${mobileOpen ? " is-active" : ""}`}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={toggleMobileMenu}
          >
            {mobileOpen ? <CloseIcon className="icon" /> : <MenuIcon className="icon" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="site-mobile-menu">
          <div className="container">
            <div className="site-mobile-menu__inner">
              {showActiveSaint ? (
                <Link href={`/saints/${activeSaint.slug}`} className="site-mobile-menu__saint" onClick={closeMobileMenu}>
                  <span>Saint Today</span>
                  <strong>{activeSaint.name}</strong>
                </Link>
              ) : null}

              <div className="site-mobile-menu__top">
                {primaryLinks.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={pathname === item.href ? "is-active" : undefined}
                      onClick={closeMobileMenu}
                    >
                      <Icon className="icon icon--tiny" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              {groupedNavigation.map((group) => (
                <div
                  key={group.label}
                  className={`site-mobile-dropdown${
                    (openMobileGroup ? openMobileGroup === group.label : isGroupActive(group.items))
                      ? " is-open"
                      : ""
                  }`}
                >
                  <button
                    type="button"
                    className="site-mobile-dropdown__trigger"
                    aria-expanded={
                      openMobileGroup ? openMobileGroup === group.label : isGroupActive(group.items)
                    }
                    onClick={() =>
                      setOpenMobileGroup((current) =>
                        current === group.label ? null : group.label
                      )
                    }
                  >
                    <span>{group.label}</span>
                    <ChevronDownIcon className="icon icon--tiny" />
                  </button>
                  {(openMobileGroup ? openMobileGroup === group.label : isGroupActive(group.items)) ? (
                    <div className="site-mobile-dropdown__content">
                      <div className="site-mobile-menu__links">
                        {group.items.map((item) => {
                          const Icon = item.icon;

                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={
                                pathname === item.href || pathname.startsWith(`${item.href}/`)
                                  ? "is-active"
                                  : undefined
                              }
                              onClick={closeMobileMenu}
                            >
                              <Icon className="icon icon--tiny" />
                              {item.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
