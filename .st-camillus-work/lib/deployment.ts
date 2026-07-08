export const remoteStorageRequiredMessage =
  "Supabase is required for admin changes on a Netlify production deploy.";

export function isNetlifyProduction() {
  return process.env.NETLIFY === "true" && process.env.NODE_ENV === "production";
}
