import { NextResponse } from "next/server";
import { hashPasscode, AUTH_COOKIE } from "../../../lib/auth";

export async function POST(request) {
  const { passcode } = await request.json();
  const expectedPasscode = process.env.ZENFUND_PASSCODE || "";

  if (!expectedPasscode) {
    return NextResponse.json(
      { error: "ZENFUND_PASSCODE is not set on the server." },
      { status: 500 }
    );
  }

  if (passcode !== expectedPasscode) {
    return NextResponse.json({ error: "Passcode salah." }, { status: 401 });
  }

  const hashed = await hashPasscode(passcode);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE, hashed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return response;
}
