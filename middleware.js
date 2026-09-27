import { NextResponse } from "next/server";
import { hashPasscode, AUTH_COOKIE } from "./lib/auth";

// Paths that must stay reachable without being logged in yet.
const PUBLIC_PATHS = ["/login", "/api/auth"];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p)) || pathname.startsWith("/_next") || pathname.startsWith("/app-logic.js")) {
    return NextResponse.next();
  }

  const cookieValue = request.cookies.get(AUTH_COOKIE)?.value;
  const expected = await hashPasscode(process.env.ZENFUND_PASSCODE || "");

  if (cookieValue && cookieValue === expected) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
