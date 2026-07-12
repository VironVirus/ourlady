"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ThemeModeToggle } from "@/components/theme-mode-toggle";
import { siteIdentity } from "@/lib/site-identity";
import {
  BookIcon,
  ClockIcon,
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
    href?: string;
  };
};

export function SiteHeader({ activeSaint }: SiteHeaderProps) {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDesktopGroup, setOpenDesktopGroup] = useState<string | null>(null);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);
  const primaryLinks = [
    { href: "/", label: "Home", icon: HomeIcon },
    { href: "/mass-schedule", label: "Mass", icon: CrossIcon },
    { href: "/news", label: "News", icon: SparkIcon }
  ];
  const groupedNavigation = [
    {
      label: "Chaplaincy",
      items: [
        { href: "/about", label: "About", icon: CrossIcon },
        { href: "/priest", label: "Priests", icon: PriestIcon },
        { href: "/saints", label: "Saints", icon: CrossIcon },
        { href: "/pastoral", label: "Student Life", icon: UsersIcon },
        { href: "/contact", label: "Contact", icon: CrossIcon }
      ]
    },
    {
      label: "Resources",
      items: [
        { href: "/daily-readings", label: "Daily Readings", icon: BookIcon },
        { href: "/missal", label: "Missal", icon: CrossIcon },
        { href: "/confession", label: "Confession", icon: ClockIcon },
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

  function closeMenus() {
    setMobileOpen(false);
    setOpenDesktopGroup(null);
    setOpenMobileGroup(null);
  }

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!headerRef.current?.contains(event.target as Node)) {
        setOpenDesktopGroup(null);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

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
          <Link href="/" className="brand-mark" onClick={closeMenus}>
            <span className="brand-mark__seal">{siteIdentity.seal}</span>
            <span className="brand-mark__text">
              <strong>St Camillus de Lellis</strong>
              <small>College of Health Sciences, Nnewi</small>
            </span>
          </Link>
        </div>
      </header>
    );
  }

  const showActiveSaint = pathname === "/" && activeSaint;

  return (
    <header className="site-header" ref={headerRef}>
      <div className="container site-header__inner">
        <Link href="/" className="brand-mark" onClick={closeMenus}>
          <span className="brand-mark__seal">{siteIdentity.seal}</span>
          <span className="brand-mark__text">
            <strong>St Camillus de Lellis</strong>
            <small>College of Health Sciences, Nnewi</small>
          </span>
        </Link>

        <div className="site-header__controls">
          {showActiveSaint ? (
            activeSaint.href ? (
              <Link href={activeSaint.href} className="site-saint-pill">
                <span>Saint Today</span>
                <strong>{activeSaint.name}</strong>
              </Link>
            ) : (
              <div className="site-saint-pill">
                <span>Saint Today</span>
                <strong>{activeSaint.name}</strong>
              </div>
            )
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
              <div
                key={group.label}
                className={`desktop-dropdown${
                  openDesktopGroup === group.label ? " is-open" : ""
                }`}
              >
                <button
                  type="button"
                  className={`desktop-dropdown__trigger${
                    isGroupActive(group.items) ? " is-active" : ""
                  }`}
                  aria-expanded={openDesktopGroup === group.label}
                  onClick={() =>
                    setOpenDesktopGroup((current) =>
                      current === group.label ? null : group.label
                    )
                  }
                >
                  {group.label}
                  <ChevronDownIcon className="icon icon--tiny" />
                </button>
                <div className="desktop-dropdown__menu">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href || pathname.startsWith(`${item.href}/`);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={isActive ? "is-active" : undefined}
                        onClick={() => setOpenDesktopGroup(null)}
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

          <div className="site-header__theme">
            <ThemeModeToggle />
          </div>

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
                activeSaint.href ? (
                  <Link
                    href={activeSaint.href}
                    className="site-mobile-menu__saint"
                    onClick={closeMenus}
                  >
                    <span>Saint Today</span>
                    <strong>{activeSaint.name}</strong>
                  </Link>
                ) : (
                  <div className="site-mobile-menu__saint">
                    <span>Saint Today</span>
                    <strong>{activeSaint.name}</strong>
                  </div>
                )
              ) : null}

              <div className="site-mobile-menu__top">
                {primaryLinks.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={pathname === item.href ? "is-active" : undefined}
                      onClick={closeMenus}
                    >
                      <Icon className="icon icon--tiny" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              {groupedNavigation.map((group) => {
                const isOpen = openMobileGroup
                  ? openMobileGroup === group.label
                  : isGroupActive(group.items);

                return (
                  <div
                    key={group.label}
                    className={`site-mobile-dropdown${isOpen ? " is-open" : ""}`}
                  >
                    <button
                      type="button"
                      className="site-mobile-dropdown__trigger"
                      aria-expanded={isOpen}
                      onClick={() =>
                        setOpenMobileGroup((current) =>
                          current === group.label ? null : group.label
                        )
                      }
                    >
                      <span>{group.label}</span>
                      <ChevronDownIcon className="icon icon--tiny" />
                    </button>
                    {isOpen ? (
                      <div className="site-mobile-dropdown__content">
                        <div className="site-mobile-menu__links">
                          {group.items.map((item) => {
                            const Icon = item.icon;
                            const isActive =
                              pathname === item.href || pathname.startsWith(`${item.href}/`);

                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                className={isActive ? "is-active" : undefined}
                                onClick={closeMenus}
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
                );
              })}

              <div className="site-mobile-menu__theme">
                <span>Theme</span>
                <ThemeModeToggle />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
