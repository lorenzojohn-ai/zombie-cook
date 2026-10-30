import { getRecipeById, seedIfEmpty } from "@/lib/db";
import { showAmount, convertUnit, isStandardUnit } from "@/lib/scale";
import { detectAllergens } from "@/lib/allergens";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SharedRecipe({ params }: { params: Promise<{ id: string }> }) {
  seedIfEmpty();
  const { id } = await params;
  const recipe = getRecipeById(id);
  if (!recipe) return <div className="card"><strong>No recipe at this link.</strong></div>;

  const allergens = detectAllergens(recipe.ingredients);

  return (
    <div className="card stack" style={{ maxWidth: 640 }}>
      <h1>{recipe.title}</h1>
      <p className="sub">{recipe.minutes} min · serves {recipe.servings}</p>
      {allergens.length > 0 && (
        <div className="row">
          {allergens.map((a) => (
            <span key={a} className="allergen-badge">{a}</span>
          ))}
          <span className="muted small">Auto-detected from ingredients</span>
        </div>
      )}
      <ul className="ingredients">
        {recipe.ingredients.map((i, n) => {
          const converted = isStandardUnit(i.unit) ? convertUnit(i.amount, i.unit) : { amount: i.amount, unit: i.unit };
          return (
            <li key={n}>
              <strong>{showAmount(converted.amount)}</strong> {converted.unit} {i.name}
              {i.fixed && <span className="fixed-indicator" title="Does not scale with servings"> ℹ</span>}
            </li>
          );
        })}
      </ul>
      <ol className="steps">{recipe.steps.map((s, n) => <li key={n}>{s}</li>)}</ol>
      {recipe.notes && <p className="muted">{recipe.notes}</p>}
      {recipe.source && (
        <p className="muted small">
          From: {recipe.source.startsWith("http") ? <Link href={recipe.source}>{recipe.source}</Link> : recipe.source}
        </p>
      )}
      <div className="row">
        <Link href={`/recipes/new?importRecipe=${recipe.id}`} className="btn">Import into my box</Link>
      </div>
    </div>
  );
}
