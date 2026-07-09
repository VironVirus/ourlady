const localhostUrl = "http://localhost:3000";
const officialSiteUrl = "https://ollpenugu.com";

function normalizeUrl(value: string) {
  try {
    return new URL(value).origin;
  } catch {
    return localhostUrl;
  }
}

export function getSiteUrl() {
  const candidate =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.URL ||
    process.env.DEPLOY_PRIME_URL ||
    (process.env.NODE_ENV === "development" ? localhostUrl : officialSiteUrl);

  return normalizeUrl(candidate);
}

export function toAbsoluteSiteUrl(path = "/") {
  return new URL(path, getSiteUrl()).toString();
}

export function toAbsoluteMediaUrl(value?: string) {
  if (!value) {
    return "";
  }

  try {
    return new URL(value).toString();
  } catch {
    return new URL(value.startsWith("/") ? value : `/${value}`, getSiteUrl()).toString();
  }
}
