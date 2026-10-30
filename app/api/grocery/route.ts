import { NextResponse } from "next/server";
import { buildGrocery } from "@/lib/grocery";
import { toggleChecked } from "@/lib/db";

export async function GET(req: Request) {
  const owner = new URL(req.url).searchParams.get("owner") ?? "";
  return NextResponse.json(buildGrocery(owner));
}

export async function POST(req: Request) {
  const { key, userId } = await req.json().catch(() => ({ key: "", userId: "" }));
  const owner = userId || "";
  toggleChecked(owner, key);
  return NextResponse.json({ ok: true });
}
