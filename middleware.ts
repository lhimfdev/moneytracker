import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC = ["/login", "/register", "/pin"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.some((p) => pathname.startsWith(p))) return NextResponse.next();
  const t = req.cookies.get("lhimf_session")?.value;
  try {
    if (!t) throw new Error("no session");
    await jwtVerify(t, new TextEncoder().encode(process.env.AUTH_SECRET ?? ""));
    return NextResponse.next();
  } catch {
    const to = req.cookies.get("lhimf_device") ? "/pin" : "/login";
    return NextResponse.redirect(new URL(to, req.url));
  }
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
