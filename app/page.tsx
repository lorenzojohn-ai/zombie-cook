"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useMe } from "@/lib/useMe";
import { detectAllergens } from "@/lib/allergens";
import type { Recipe } from "@/lib/db";

export default function RecipeBox() {
  const me = useMe();
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [q, setQ] = useState("");
  const [tag, setTag] = useState("");

  useEffect(() => {
    if (!me) return;
    const qs = new URLSearchParams({ owner: me, q, tag });
    fetch(`/api/recipes?${qs}`).then((r) => r.json()).then(setRecipes);
  }, [me, q, tag]);

  const allTags = [...new Set((recipes ?? []).flatMap((r) => r.tags))].sort();

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Recipe box</h1>
          <p className="sub">Your recipes, newest first.</p>
        </div>
        <div className="row">
          <Link href="/recipes/new" className="btn">Add a recipe</Link>
          <Link href="/recipes/new?import=1" className="btn ghost">Import from a URL</Link>
        </div>
      </div>

      <div className="row" style={{ marginBottom: 16 }}>
        <input placeholder="Search by title, ingredient or tag" value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 320 }} />
        <select value={tag} onChange={(e) => setTag(e.target.value)} style={{ width: "auto" }}>
          <option value="">All tags</option>
          {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {recipes === null && <p className="muted">Loading...</p>}
      {recipes?.length === 0 && (
        <div className="card empty">
          <strong>No recipes found.</strong>
          <span className="muted">Add one, or clear the search.</span>
        </div>
      )}
      <div className="grid">
        {recipes?.map((r) => {
          const allergens = detectAllergens(r.ingredients);
          return (
            <Link key={r.id} href={`/recipes/${r.id}`} className="card stack recipe-card">
              <strong>{r.title}</strong>
              <span className="muted small">{r.minutes} min · serves {r.servings} · {r.ingredients.length} ingredients</span>
              <span className="row">{r.tags.map((t) => <span key={t} className="pill">{t}</span>)}</span>
              {allergens.length > 0 && (
                <span className="row">
                  {allergens.map((a) => (
                    <span key={a} className="allergen-badge">{a}</span>
                  ))}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </>
  );
}
