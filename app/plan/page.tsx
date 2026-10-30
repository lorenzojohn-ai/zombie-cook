"use client";
import { useCallback, useEffect, useState } from "react";
import { useMe } from "@/lib/useMe";
import type { Meal, Recipe, Slot } from "@/lib/db";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MEALS: Meal[] = ["breakfast", "lunch", "dinner", "snack", "dessert"];

export default function PlanPage() {
  const me = useMe();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [plan, setPlan] = useState<Slot[]>([]);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    if (!me) return;
    setRecipes(await (await fetch(`/api/recipes?owner=${me}`)).json());
    setPlan(await (await fetch(`/api/plan?owner=${me}`)).json());
  }, [me]);

  useEffect(() => { load(); }, [load]);

  async function pick(day: number, meal: Meal, recipeId: string, servings?: number) {
    const res = await fetch("/api/plan", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: me, day, meal, recipeId, servings: servings || undefined }),
    });
    if (!res.ok) {
      const data = await res.json();
      setMsg(data.error || "");
    } else {
      setMsg("");
    }
    load();
  }

  async function clearWeek() {
    await fetch(`/api/plan?owner=${me}`, { method: "DELETE" });
    load();
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Meal plan</h1>
          <p className="sub">Pick a recipe for each meal. The grocery list is built from this week.</p>
        </div>
        <button className="ghost" onClick={clearWeek}>Clear the week</button>
      </div>
      {msg && <p className="error">{msg}</p>}
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Day</th>{MEALS.map((m) => <th key={m}>{m}</th>)}</tr>
          </thead>
          <tbody>
            {DAYS.map((d, day) => (
              <tr key={d}>
                <td><strong>{d}</strong></td>
                {MEALS.map((meal) => {
                  const slot = plan.find((s) => s.day === day && s.meal === meal);
                  const missing = slot && !recipes.some((r) => r.id === slot.recipeId);
                  return (
                    <td key={meal}>
                      {missing && <div className="error small">Recipe was deleted</div>}
                      <select
                        value={slot && !missing ? slot.recipeId : ""}
                        onChange={(e) => pick(day, meal, e.target.value)}
                      >
                        <option value="">{missing ? "Pick another" : "-"}</option>
                        {recipes.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
                      </select>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
