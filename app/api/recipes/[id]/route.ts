import { NextResponse } from "next/server";
import { getRecipeById, updateRecipe, deleteRecipe } from "@/lib/db";
import { cleanRecipe } from "@/lib/recipe";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const recipe = getRecipeById(id);
  if (!recipe) return NextResponse.json({ error: "Recipe not found." }, { status: 404 });
  return NextResponse.json(recipe);
}

export async function PUT(req: Request, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const existing = getRecipeById(id);
  if (!existing) return NextResponse.json({ error: "Recipe not found." }, { status: 404 });
  const updated = updateRecipe(id, cleanRecipe(body));
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const ok = deleteRecipe(id);
  if (!ok) return NextResponse.json({ error: "Recipe not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
