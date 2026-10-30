"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { scaleAmount, showAmount, convertUnit, isStandardUnit } from "@/lib/scale";
import { detectAllergens } from "@/lib/allergens";
import type { Recipe } from "@/lib/db";

export default function RecipeView({ recipe }: { recipe: Recipe }) {
  const router = useRouter();
  const [servings, setServings] = useState(String(recipe.servings));
  const [nutrition, setNutrition] = useState<any>(null);
  const [nutritionMsg, setNutritionMsg] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);

  const allergens = detectAllergens(recipe.ingredients);
  const servingsNum = Math.max(1, Number(servings) || 1);

  async function fetchNutrition() {
    const res = await fetch("/api/nutrition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipeId: recipe.id }),
    });
    const data = await res.json();
    if (data.error) setNutritionMsg(data.error);
    else setNutrition(data);
  }

  async function remove() {
    await fetch(`/api/recipes/${recipe.id}`, { method: "DELETE" });
    router.push("/");
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{recipe.title}</h1>
          <p className="sub">{recipe.minutes} min · {recipe.tags.join(", ") || "no tags"}</p>
        </div>
        <div className="row">
          <Link href={`/recipes/${recipe.id}/edit`} className="btn ghost">Edit</Link>
          <button className="ghost" onClick={remove}>Delete</button>
        </div>
      </div>

      {allergens.length > 0 && (
        <div className="row" style={{ marginBottom: 12 }}>
          {allergens.map((a) => (
            <span key={a} className="allergen-badge">{a}</span>
          ))}
          <span className="muted small">Auto-detected from ingredients</span>
        </div>
      )}

      <div className="two-col">
        <div className="card stack">
          <label>
            Servings
            <input
              value={servings}
              onChange={(e) => setServings(e.target.value)}
              style={{ maxWidth: 120 }}
            />
          </label>
          <span className="muted small">Written for {recipe.servings}. Change the number to scale it.</span>
          <ul className="ingredients">
            {recipe.ingredients.map((i, n) => {
              const scaled = i.fixed ? i.amount : scaleAmount(i.amount, recipe.servings, servingsNum);
              const converted = isStandardUnit(i.unit) ? convertUnit(scaled, i.unit) : { amount: scaled, unit: i.unit };
              return (
                <li key={n}>
                  <strong>{showAmount(converted.amount)}</strong> {converted.unit} {i.name}
                  {i.fixed && <span className="fixed-indicator" title="Does not scale with servings"> ℹ</span>}
                </li>
              );
            })}
          </ul>
        </div>
        <div className="card stack">
          <strong>Steps</strong>
          <ol className="steps">{recipe.steps.map((s, n) => <li key={n}>{s}</li>)}</ol>
          {recipe.notes && <p className="muted">Notes: {recipe.notes}</p>}
          {recipe.source && (
            <p className="muted small">
              From: {recipe.source.startsWith("http") ? <Link href={recipe.source}>{recipe.source}</Link> : recipe.source}
            </p>
          )}
        </div>
      </div>

      <div className="card stack" style={{ marginTop: 16 }}>
        <div className="row">
          <button className="ghost small-btn" onClick={fetchNutrition}>Show nutrition</button>
          <span className="muted small">Share link: <Link href={`/r/${recipe.id}`}>/r/{recipe.id}</Link></span>
        </div>
        {nutrition && (
          <div className="row" style={{ marginTop: 8 }}>
            <span className="pill">{nutrition.calories} kcal</span>
            <span className="pill">P {nutrition.protein}g</span>
            <span className="pill">F {nutrition.fat}g</span>
            <span className="pill">C {nutrition.carbs}g</span>
            <span className="muted small">Not medical advice.</span>
          </div>
        )}
        {nutritionMsg && <span className="error small">{nutritionMsg}</span>}
      </div>

      {showUpgrade && (
        <div className="upgrade-modal">
          <div className="card stack">
            <strong>Upgrade required</strong>
            <p className="muted">This feature is available on the paid plan.</p>
            <Link href="/pricing" className="btn">See pricing</Link>
            <button className="ghost" onClick={() => setShowUpgrade(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}
