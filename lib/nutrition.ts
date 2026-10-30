import { updateRecipe } from "@/lib/db";
import type { Recipe } from "@/lib/db";

const USDA_API_KEY = process.env.USDA_API_KEY;
const USDA_BASE = "https://api.nal.usda.gov/fdc/v1";

export async function fetchNutrition(recipe: Recipe): Promise<{
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
} | null> {
  if (!USDA_API_KEY) return null;
  if (recipe.nutritionCache) {
    return recipe.nutritionCache;
  }

  let calories = 0;
  let protein = 0;
  let fat = 0;
  let carbs = 0;

  for (const ing of recipe.ingredients) {
    const query = encodeURIComponent(ing.name);
    try {
      const res = await fetch(
        `${USDA_BASE}/foods/search?api_key=${USDA_API_KEY}&query=${query}&pageSize=1`,
        { cache: "no-store" }
      );
      if (!res.ok) continue;
      const data = await res.json();
      const food = data.foods?.[0];
      if (!food) continue;

      const per100g = getMacros(food.foodNutrients);
      const factor = ing.amount / 100;
      calories += (per100g.calories || 0) * factor;
      protein += (per100g.protein || 0) * factor;
      fat += (per100g.fat || 0) * factor;
      carbs += (per100g.carbs || 0) * factor;
    } catch {
      // Skip on error
    }
  }

  const result = {
    calories: Math.round(calories),
    protein: Math.round(protein * 10) / 10,
    fat: Math.round(fat * 10) / 10,
    carbs: Math.round(carbs * 10) / 10,
    fetchedAt: new Date().toISOString(),
  };

  updateRecipe(recipe.id, { nutritionCache: result });
  return result;
}

function getMacros(nutrients: any[]): { calories: number; protein: number; fat: number; carbs: number } {
  let calories = 0;
  let protein = 0;
  let fat = 0;
  let carbs = 0;
  for (const n of nutrients || []) {
    const name = (n.nutrientName || n.nutrient?.name || "").toLowerCase();
    const value = n.value ?? n.amount ?? 0;
    if (name.includes("energy") && name.includes("kcal")) calories = value;
    if (name.includes("protein")) protein = value;
    if (name.includes("total lipid") || name.includes("fat")) fat = value;
    if (name.includes("carbohydrate") && name.includes("total")) carbs = value;
  }
  return { calories, protein, fat, carbs };
}
