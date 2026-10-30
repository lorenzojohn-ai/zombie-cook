import { NextResponse } from "next/server";
import { getUsers, seedIfEmpty } from "@/lib/db";

export async function GET() {
  seedIfEmpty();
  return NextResponse.json(getUsers());
}
