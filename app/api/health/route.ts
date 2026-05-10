import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    turso_url_set: !!process.env.TURSO_DATABASE_URL,
    turso_token_set: !!process.env.TURSO_AUTH_TOKEN,
    gemini_set: !!process.env.GEMINI_API_KEY,
    turso_url_prefix: process.env.TURSO_DATABASE_URL?.slice(0, 20) ?? "NOT SET",
  });
}
