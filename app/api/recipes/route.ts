import { NextResponse } from "next/server";
import { newId, getRecipes, insertRecipe, seedIfEmpty } from "@/lib/db";
import { cleanRecipe } from "@/lib/recipe";

export async function GET(req: Request) {
  seedIfEmpty();
  const url = new URL(req.url);
  const owner = url.searchParams.get("owner") ?? undefined;
  const q = url.searchParams.get("q") ?? undefined;
  const tag = url.searchParams.get("tag") ?? undefined;
  const list = getRecipes(owner, q, tag);
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  seedIfEmpty();
  const body = await req.json().catch(() => ({}));
  const recipe = { id: newId(), ownerId: String(body.ownerId), ...cleanRecipe(body) };
  insertRecipe(recipe);
  return NextResponse.json(recipe, { status: 201 });
}
