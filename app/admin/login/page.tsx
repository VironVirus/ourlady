import { redirect } from "next/navigation";
import { loginAction } from "@/app/admin/actions";
import { isAdminAuthenticated, isAdminConfigured } from "@/lib/auth";

type AdminLoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function AdminLoginPage({
  searchParams
}: AdminLoginPageProps) {
  const authenticated = await isAdminAuthenticated();

  if (authenticated) {
    redirect("/admin");
  }

  const params = await searchParams;
  const adminConfigured = isAdminConfigured();

  return (
    <div className="page">
      <section className="section">
        <div className="container admin-login-wrap">
          <div className="admin-login-card">
            <div className="eyebrow">Admin Login</div>
            <h1>Administrator Access</h1>
            <p>Sign in to manage protected website content.</p>
            {params.error === "invalid" ? (
              <div className="admin-banner admin-banner--error">
                Access was not granted. Please try again.
              </div>
            ) : null}
            {adminConfigured ? (
              <form action={loginAction} className="admin-form">
                <label className="admin-field">
                  <span>Username</span>
                  <input name="username" autoComplete="username" />
                </label>
                <label className="admin-field">
                  <span>Password</span>
                  <input
                    name="password"
                    type="password"
                    autoComplete="current-password"
                  />
                </label>
                <button type="submit" className="button button--primary">
                  Sign In
                </button>
              </form>
            ) : (
              <div className="admin-banner admin-banner--error">
                Secure admin credentials have not been configured yet.
              </div>
            )}
            <p className="admin-hint">Administrator access only.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
