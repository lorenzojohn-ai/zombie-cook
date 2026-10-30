import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(req: Request) {
  const { url } = await req.json().catch(() => ({ url: "" }));
  if (!url || !url.startsWith("http")) {
    return NextResponse.json({ error: "Please provide a valid URL." }, { status: 400 });
  }

  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) throw new Error("Failed to fetch");
    const html = await res.text();
    const $ = cheerio.load(html);

    let recipe: any = null;
    $("script[type='application/ld+json']").each((_, el) => {
      try {
        const data = JSON.parse($(el).text());
        const candidates = Array.isArray(data) ? data : [data];
        for (const item of candidates) {
          if (item["@type"] === "Recipe" || (Array.isArray(item["@type"]) && item["@type"].includes("Recipe"))) {
            recipe = item;
            break;
          }
          if (item["@graph"]) {
            for (const sub of item["@graph"]) {
              if (sub["@type"] === "Recipe" || (Array.isArray(sub["@type"]) && sub["@type"].includes("Recipe"))) {
                recipe = sub;
                break;
              }
            }
          }
        }
      } catch {}
    });

    if (!recipe) {
      const title = $('meta[property="og:title"]').attr("content") || $("title").text();
      const description = $('meta[property="og:description"]').attr("content") || "";
      recipe = { name: title, description };
    }

    if (!recipe || !recipe.recipeIngredient) {
      const ingredients: string[] = [];
      $('[itemprop="recipeIngredient"]').each((_, el) => {
        ingredients.push($(el).text().trim());
      });
      if (ingredients.length) recipe = { ...recipe, recipeIngredient: ingredients };
    }

    if (!recipe || (!recipe.recipeIngredient && !recipe.name)) {
      return NextResponse.json({
        error: "Could not read this page. Paste the ingredients and steps manually.",
        source: url,
      }, { status: 422 });
    }

    const ingredients = (recipe.recipeIngredient || []).map((line: string) => {
      const match = line.match(/^([\d\s./½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]+)?\s*(\S+)?\s*(.+)?$/);
      return {
        amount: match?.[1] || "",
        unit: match?.[2] || "",
        name: match?.[3] || line,
      };
    });

    return NextResponse.json({
      title: recipe.name || recipe.headline || "Imported recipe",
      ingredients,
      steps: (recipe.recipeInstructions || []).map((s: any) =>
        typeof s === "string" ? s : s.text
      ),
      source: url,
      notes: recipe.description || "",
    });
  } catch (e) {
    return NextResponse.json({
      error: "Could not read this page. Paste the ingredients and steps manually.",
      source: url,
    }, { status: 422 });
  }
}
