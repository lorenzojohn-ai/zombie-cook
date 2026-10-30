import { getRecipes, getPlan, getChecked } from "@/lib/db";
import { scaleAmount } from "@/lib/scale";

export type GroceryItem = {
  key: string;
  name: string;
  amount: number;
  unit: string;
  checked: boolean;
};

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

function normalizeUnit(unit: string): string {
  const u = unit.trim().toLowerCase();
  if (["tsp", "teaspoon", "teaspoons"].includes(u)) return "tsp";
  if (["tbsp", "tablespoon", "tablespoons"].includes(u)) return "tbsp";
  if (["cup", "cups"].includes(u)) return "cup";
  if (["oz", "ounce", "ounces"].includes(u)) return "oz";
  if (["lb", "pound", "pounds"].includes(u)) return "lb";
  if (["g", "gram", "grams"].includes(u)) return "g";
  if (["kg", "kilogram", "kilograms"].includes(u)) return "kg";
  if (["ml", "milliliter", "milliliters"].includes(u)) return "ml";
  if (["l", "liter", "liters"].includes(u)) return "l";
  return u;
}

export function buildGrocery(userId: string): GroceryItem[] {
  const plan = getPlan(userId);
  const recipes = getRecipes();
  const checked = getChecked(userId);
  const items = new Map<string, GroceryItem>();

  for (const slot of plan) {
    const recipe = recipes.find((r) => r.id === slot.recipeId);
    if (!recipe) continue;
    const slotServings = slot.servings ?? recipe.servings;
    for (const ing of recipe.ingredients) {
      const name = normalizeName(ing.name);
      const unit = normalizeUnit(ing.unit);
      const key = `${name}::${unit}`;
      const amount = ing.fixed ? ing.amount : scaleAmount(ing.amount, recipe.servings, slotServings);
      const have = items.get(key);
      if (have) {
        have.amount += amount;
      } else {
        items.set(key, { key, name: ing.name, amount, unit: ing.unit, checked: false });
      }
    }
  }

  return [...items.values()].map((i) => ({
    ...i,
    checked: checked.includes(i.key),
  }));
}
