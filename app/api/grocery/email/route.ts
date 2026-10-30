import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "Email not configured yet." });
}
