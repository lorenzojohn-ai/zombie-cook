import type { Recipe, Ingredient } from "@/lib/db";
import { parseAmount } from "@/lib/scale";

export function cleanRecipe(body: Record<string, unknown>): Omit<Recipe, "id" | "ownerId"> {
  const title = String(body.title ?? "").trim();
  const servings = Math.max(1, Math.round(Number(body.servings) || 4));
  const minutes = Math.max(1, Math.round(Number(body.minutes) || 30));
  const tags = Array.isArray(body.tags)
    ? body.tags.map(String).map((s) => s.trim()).filter(Boolean)
    : String(body.tags ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
  const ingredients: Ingredient[] = (Array.isArray(body.ingredients) ? body.ingredients : []).map(
    (i: { amount?: unknown; unit?: unknown; name?: unknown; fixed?: unknown }) => ({
      amount: parseAmount(String(i.amount ?? "")),
      unit: String(i.unit ?? "").trim(),
      name: String(i.name ?? "").trim(),
      fixed: Boolean(i.fixed),
    })
  );
  const steps = (Array.isArray(body.steps) ? body.steps : [])
    .map(String)
    .map((s) => s.trim())
    .filter(Boolean);
  const notes = String(body.notes ?? "").trim();
  const source = String(body.source ?? "").trim();

  return {
    title,
    servings,
    minutes,
    tags,
    ingredients,
    steps,
    notes,
    source,
    nutritionCache: null,
  };
}
