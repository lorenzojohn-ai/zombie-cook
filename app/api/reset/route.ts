import { NextResponse } from "next/server";
import { resetToSeed } from "@/lib/db";

export async function POST() {
  resetToSeed();
  return NextResponse.json({ ok: true });
}
