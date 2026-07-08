import Link from "next/link";
import type { ReactNode } from "react";
import { logoutAction } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin-nav";

type AdminShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  notice?: {
    type: "success" | "error";
    message: string;
  };
};

export function AdminShell({
  title,
  description,
  children,
  notice
}: AdminShellProps) {
  return (
    <div className="page">
      <section className="section">
        <div className="container admin-layout">
          <aside className="admin-sidebar">
            <div className="admin-sidebar__top">
              <div className="eyebrow">Admin</div>
              <h1>Content Manager</h1>
              <p>Organized sections for simpler chaplaincy updates.</p>
            </div>
            <AdminNav />
          </aside>

          <div className="admin-main">
            <div className="admin-topbar">
              <div>
                <div className="eyebrow">Admin Dashboard</div>
                <h1>{title}</h1>
                <p>{description}</p>
              </div>
              <div className="admin-topbar__actions">
                <Link href="/" className="button button--secondary">
                  View Website
                </Link>
                <form action={logoutAction}>
                  <button type="submit" className="button button--secondary">
                    Sign Out
                  </button>
                </form>
              </div>
            </div>

            {notice ? (
              <div
                className={`admin-banner${
                  notice.type === "error" ? " admin-banner--error" : ""
                }`}
              >
                {notice.message}
              </div>
            ) : null}

            {children}
          </div>
        </div>
      </section>
    </div>
  );
}
