import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME = "lapo-oase-pos-auth";

function sessionToken(username: string, password: string) {
  return createHmac("sha256", password).update(`${username}:lapo-oase-pos`).digest("hex");
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export async function GET() {
  const username = process.env.LAPO_POS_USERNAME;
  const password = process.env.LAPO_POS_PASSWORD;

  if (!username || !password) {
    return NextResponse.json({ authenticated: false });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value ?? "";
  const expectedToken = sessionToken(username, password);

  return NextResponse.json({ authenticated: safeCompare(token, expectedToken) });
}
