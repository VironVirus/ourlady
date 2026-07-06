"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  clearAdminSession,
  isAdminAuthenticated,
  setAdminSession,
  verifyAdminCredentials
} from "@/lib/auth";
import { saveSiteContent, type SiteContent } from "@/lib/content";
import { remoteStorageRequiredMessage } from "@/lib/deployment";

export async function loginAction(formData: FormData) {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const valid = await verifyAdminCredentials(username, password);

  if (!valid) {
    redirect("/admin/login?error=invalid");
  }

  await setAdminSession();
  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function saveSiteContentAction(formData: FormData) {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin/login");
  }

  const payload = formData.get("payload");
  const redirectTo = String(formData.get("redirectTo") ?? "/admin");

  if (typeof payload !== "string") {
    redirect(`${redirectTo}?error=invalid`);
  }

  try {
    const parsed = JSON.parse(payload) as SiteContent;

    await saveSiteContent(parsed);

    [
      "/",
      "/about",
      "/daily-readings",
      "/mass-schedule",
      "/associations",
      "/saints",
      "/priest",
      "/contact",
      "/gallery",
      "/news",
      "/documents",
      "/announcements",
      "/prayers",
      "/reflections",
      "/pastoral",
      "/blog",
      "/dashboard",
      "/admin",
      "/admin/general",
      "/admin/mass",
      "/admin/associations",
      "/admin/announcements",
      "/admin/news",
      "/admin/documents",
      "/admin/saints",
      "/admin/prayers",
      "/admin/reflections",
      "/admin/pastoral",
      "/admin/priests",
      "/admin/gallery"
    ].forEach((route) => revalidatePath(route));

    redirect(`${redirectTo}?saved=1`);
  } catch (error) {
    const errorCode =
      error instanceof Error && error.message === remoteStorageRequiredMessage
        ? "storage"
        : "invalid";

    redirect(`${redirectTo}?error=${errorCode}`);
  }
}
