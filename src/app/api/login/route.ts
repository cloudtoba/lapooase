import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "lapo-oase-pos-auth";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 14;

function getCredentials() {
  return {
    username: process.env.LAPO_POS_USERNAME,
    password: process.env.LAPO_POS_PASSWORD
  };
}

function sessionToken(username: string, password: string) {
  return createHmac("sha256", password).update(`${username}:lapo-oase-pos`).digest("hex");
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export async function POST(request: NextRequest) {
  const { username: validUsername, password: validPassword } = getCredentials();

  if (!validUsername || !validPassword) {
    return NextResponse.json({ error: "Login belum dikonfigurasi di environment." }, { status: 500 });
  }

  const body = (await request.json().catch(() => null)) as { username?: string; password?: string } | null;
  const username = body?.username ?? "";
  const password = body?.password ?? "";

  if (!safeCompare(username, validUsername) || !safeCompare(password, validPassword)) {
    return NextResponse.json({ error: "Username atau password salah." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set({
    name: COOKIE_NAME,
    value: sessionToken(validUsername, validPassword),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE,
    path: "/"
  });

  return response;
}
