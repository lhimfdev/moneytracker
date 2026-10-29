import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";

const key = () => new TextEncoder().encode(process.env.AUTH_SECRET ?? "");
const opts = (maxAge: number) => ({
  httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge,
});
const sign = (uid: string, ttl: string) =>
  new SignJWT({}).setProtectedHeader({ alg: "HS256" }).setSubject(uid).setExpirationTime(ttl).sign(key());

export async function createSession(uid: string) {
  cookies().set("lhimf_session", await sign(uid, "7d"), opts(60 * 60 * 24 * 7));
  // Remembers this device so the 4-digit PIN can unlock it later.
  cookies().set("lhimf_device", await sign(uid, "90d"), opts(60 * 60 * 24 * 90));
}

async function read(name: string) {
  const t = cookies().get(name)?.value;
  if (!t) return null;
  try { return (await jwtVerify(t, key())).payload.sub ?? null; } catch { return null; }
}
export const getDeviceUserId = () => read("lhimf_device");

export async function requireUser() {
  const uid = await read("lhimf_session");
  const user = uid ? await db.user.findUnique({ where: { id: uid } }) : null;
  if (!user) redirect("/login");
  return user;
}
