"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import RecipeForm from "@/components/RecipeForm";
import type { Recipe } from "@/lib/db";

export default function EditRecipePage() {
  const { id } = useParams() as { id: string };
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    fetch(`/api/recipes/${id}`).then((r) => r.json()).then((data) => {
      if (!data.error) setRecipe(data);
    });
  }, [id]);

  if (!recipe) return <p className="muted">Loading...</p>;
  return (
    <>
      <h1>Edit recipe</h1>
      <RecipeForm recipe={recipe} />
    </>
  );
}
