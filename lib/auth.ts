import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { adminCredentials, sessionSecret } from "./config";

export const SESSION_COOKIE = "bs_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 días

function sign(payload: string) {
  return createHmac("sha256", sessionSecret()).update(payload).digest("hex");
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function checkCredentials(username: string, password: string) {
  const creds = adminCredentials();
  return safeEqual(username.trim(), creds.username) && safeEqual(password, creds.password);
}

export function createSessionToken() {
  const exp = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = `${adminCredentials().username}.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined) {
  if (!token) return false;
  const lastDot = token.lastIndexOf(".");
  if (lastDot < 0) return false;
  const payload = token.slice(0, lastDot);
  const signature = token.slice(lastDot + 1);
  if (!safeEqual(signature, sign(payload))) return false;
  const exp = Number(payload.split(".").pop());
  return Number.isFinite(exp) && exp > Date.now();
}

export async function isAdmin() {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE_SECONDS,
};
