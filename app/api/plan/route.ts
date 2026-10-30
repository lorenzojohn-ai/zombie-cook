import { NextResponse } from "next/server";
import { getPlan, setPlanSlot, clearPlan, getRecipes, getProfile } from "@/lib/db";
import type { Meal } from "@/lib/db";

export async function GET(req: Request) {
  const owner = new URL(req.url).searchParams.get("owner") ?? "";
  return NextResponse.json(getPlan(owner));
}

export async function PUT(req: Request) {
  const { userId, day, meal, recipeId, servings } = await req.json().catch(() => ({}));
  const dayNum = Number(day);
  if (!Number.isFinite(dayNum) || dayNum < 0 || dayNum > 6) {
    return NextResponse.json({ error: "Day must be 0-6." }, { status: 400 });
  }
  const validMeals: Meal[] = ["breakfast", "lunch", "dinner", "snack", "dessert"];
  if (!validMeals.includes(meal)) {
    return NextResponse.json({ error: "Invalid meal slot." }, { status: 400 });
  }
  if (recipeId) {
    const recipes = getRecipes();
    if (!recipes.some((r) => r.id === recipeId)) {
      return NextResponse.json({ error: "Recipe not found." }, { status: 400 });
    }
  }

  const profile = getProfile(userId);
  const plan = getPlan(userId);
  const daysUsed = new Set(plan.map((s) => s.day)).size;
  if (!profile.paid && daysUsed >= 3 && !plan.some((s) => s.day === dayNum)) {
    return NextResponse.json({ error: "Free tier limited to 3 days. Upgrade to plan more." }, { status: 403 });
  }

  setPlanSlot({ userId, day: dayNum, meal: meal as Meal, recipeId, servings });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const owner = new URL(req.url).searchParams.get("owner") ?? "";
  clearPlan(owner);
  return NextResponse.json({ ok: true });
}
