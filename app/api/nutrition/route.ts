import { NextResponse } from "next/server";
import { getRecipeById } from "@/lib/db";
import { fetchNutrition } from "@/lib/nutrition";

export async function POST(req: Request) {
  const { recipeId } = await req.json().catch(() => ({ recipeId: "" }));
  const recipe = getRecipeById(recipeId);
  if (!recipe) return NextResponse.json({ error: "Recipe not found." }, { status: 404 });

  const nutrition = await fetchNutrition(recipe);
  if (!nutrition) {
    return NextResponse.json({ error: "Nutrition unavailable." });
  }
  return NextResponse.json(nutrition);
}
