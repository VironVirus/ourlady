import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_COOKIE = "our_lady_admin_session";
const allowDevelopmentFallback = process.env.NODE_ENV !== "production";
const ADMIN_USERNAME =
  process.env.ADMIN_USERNAME?.trim() ||
  (allowDevelopmentFallback ? "admin@ourlady.local" : "");
const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD?.trim() ||
  (allowDevelopmentFallback ? "lourdes-admin" : "");
const ADMIN_SECRET =
  process.env.ADMIN_SECRET?.trim() ||
  (allowDevelopmentFallback ? "our-lady-of-lourdes-secret" : "");

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export function isAdminConfigured() {
  return Boolean(ADMIN_USERNAME && ADMIN_PASSWORD && ADMIN_SECRET);
}

function createSessionValue() {
  return crypto
    .createHash("sha256")
    .update(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}:${ADMIN_SECRET}`)
    .digest("hex");
}

export async function verifyAdminCredentials(username: string, password: string) {
  if (!isAdminConfigured()) {
    return false;
  }

  return safeEqual(username, ADMIN_USERNAME) && safeEqual(password, ADMIN_PASSWORD);
}

export async function setAdminSession() {
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_COOKIE, createSessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;

  return token === createSessionValue();
}

export async function requireAdmin() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin/login");
  }
}
