"use client";
import { Suspense } from "react";
import RecipeForm from "@/components/RecipeForm";

export default function NewRecipePage() {
  return (
    <>
      <h1>Add a recipe</h1>
      <Suspense fallback={<p className="muted">Loading...</p>}>
        <RecipeForm />
      </Suspense>
    </>
  );
}
