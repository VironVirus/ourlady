import { redirect } from "next/navigation";
import { loginAction } from "@/app/admin/actions";
import { getAdminDefaults, isAdminAuthenticated } from "@/lib/auth";

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
  const defaults = getAdminDefaults();

  return (
    <div className="page">
      <section className="section">
        <div className="container admin-login-wrap">
          <div className="admin-login-card">
            <div className="eyebrow">Admin Login</div>
            <h1>Manage parish website content</h1>
            <p>Sign in to update parish content, images, notices, and schedules.</p>
            {params.error === "invalid" ? (
              <div className="admin-banner admin-banner--error">
                The login details were not correct. Please try again.
              </div>
            ) : null}
            <form action={loginAction} className="admin-form">
              <label className="admin-field">
                <span>Username</span>
                <input name="username" defaultValue={defaults.username} />
              </label>
              <label className="admin-field">
                <span>Password</span>
                <input
                  name="password"
                  type="password"
                  defaultValue={defaults.password}
                />
              </label>
              <button type="submit" className="button button--primary">
                Sign In
              </button>
            </form>
            <p className="admin-hint">Use the admin details provided for the parish site.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
