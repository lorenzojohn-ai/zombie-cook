import Database from "better-sqlite3";
import path from "path";
import seed from "@/data/seed.json";

export type Ingredient = {
  amount: number;
  unit: string;
  name: string;
  fixed?: boolean;
};

export type NutritionCache = {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fetchedAt: string;
} | null;

export type Recipe = {
  id: string;
  ownerId: string;
  title: string;
  servings: number;
  minutes: number;
  tags: string[];
  ingredients: Ingredient[];
  steps: string[];
  notes: string;
  source: string;
  nutritionCache: NutritionCache;
};

export type Meal = "breakfast" | "lunch" | "dinner" | "snack" | "dessert";
export type Slot = {
  userId: string;
  day: number;
  meal: Meal;
  recipeId: string;
  servings?: number;
};

export type User = { id: string; name: string; color: string };

const DB_PATH = process.env.VERCEL
  ? "/tmp/zombie-cook.db"
  : path.join(process.cwd(), "data", "zombie-cook.db");

let dbInstance: Database.Database | null = null;

function getDb(): Database.Database {
  if (!dbInstance) {
    dbInstance = new Database(DB_PATH);
    dbInstance.pragma("journal_mode = WAL");
    initSchema(dbInstance);
  }
  return dbInstance;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS recipes (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      title TEXT NOT NULL,
      servings INTEGER NOT NULL,
      minutes INTEGER NOT NULL,
      tags TEXT NOT NULL DEFAULT '[]',
      ingredients TEXT NOT NULL DEFAULT '[]',
      steps TEXT NOT NULL DEFAULT '[]',
      notes TEXT NOT NULL DEFAULT '',
      source TEXT NOT NULL DEFAULT '',
      nutrition_cache TEXT
    );
    CREATE TABLE IF NOT EXISTS plan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      day INTEGER NOT NULL,
      meal TEXT NOT NULL,
      recipe_id TEXT NOT NULL,
      servings INTEGER
    );
    CREATE TABLE IF NOT EXISTS checked_items (
      user_id TEXT NOT NULL,
      key TEXT NOT NULL,
      PRIMARY KEY (user_id, key)
    );
    CREATE TABLE IF NOT EXISTS profiles (
      user_id TEXT PRIMARY KEY,
      paid INTEGER NOT NULL DEFAULT 0
    );
  `);
}

export function seedIfEmpty() {
  const db = getDb();
  const userCount = (db.prepare("SELECT COUNT(*) as c FROM users").get() as { c: number }).c;
  if (userCount === 0) {
    const insertUser = db.prepare("INSERT INTO users (id, name, color) VALUES (?, ?, ?)");
    const insertRecipe = db.prepare(
      "INSERT INTO recipes (id, owner_id, title, servings, minutes, tags, ingredients, steps, notes, source, nutrition_cache) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    const insertPlan = db.prepare(
      "INSERT INTO plan (user_id, day, meal, recipe_id, servings) VALUES (?, ?, ?, ?, ?)"
    );
    const insertProfile = db.prepare("INSERT OR IGNORE INTO profiles (user_id, paid) VALUES (?, 0)");

    const tx = db.transaction(() => {
      for (const u of seed.users) insertUser.run(u.id, u.name, u.color);
      for (const r of seed.recipes) {
        insertRecipe.run(
          r.id,
          r.ownerId,
          r.title,
          r.servings,
          r.minutes,
          JSON.stringify(r.tags),
          JSON.stringify(r.ingredients),
          JSON.stringify(r.steps),
          r.notes,
          r.source,
          r.nutritionCache ? JSON.stringify(r.nutritionCache) : null
        );
      }
      for (const p of seed.plan) {
        insertPlan.run(p.userId, p.day, p.meal, p.recipeId, (p as any).servings ?? null);
      }
      for (const u of seed.users) insertProfile.run(u.id);
    });
    tx();
  }
}

export function getUsers(): User[] {
  return getDb().prepare("SELECT id, name, color FROM users").all() as User[];
}

export function getRecipes(owner?: string, q?: string, tag?: string): Recipe[] {
  const db = getDb();
  let sql = "SELECT * FROM recipes";
  const params: (string | number)[] = [];
  const where: string[] = [];

  if (owner) {
    where.push("owner_id = ?");
    params.push(owner);
  }
  if (tag) {
    where.push("tags LIKE ?");
    params.push(`%"${tag}"%`);
  }
  if (where.length) sql += " WHERE " + where.join(" AND ");
  sql += " ORDER BY id DESC";

  const rows = db.prepare(sql).all(...params) as any[];
  const recipes = rows.map(rowToRecipe);

  if (q) {
    const low = q.toLowerCase();
    return recipes.filter(
      (r) =>
        r.title.toLowerCase().includes(low) ||
        r.ingredients.some((i) => i.name.toLowerCase().includes(low)) ||
        r.tags.some((t) => t.toLowerCase().includes(low))
    );
  }
  return recipes;
}

export function getRecipeById(id: string): Recipe | undefined {
  const row = getDb().prepare("SELECT * FROM recipes WHERE id = ?").get(id) as any;
  return row ? rowToRecipe(row) : undefined;
}

export function insertRecipe(recipe: Recipe): Recipe {
  const db = getDb();
  db.prepare(
    "INSERT INTO recipes (id, owner_id, title, servings, minutes, tags, ingredients, steps, notes, source, nutrition_cache) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(
    recipe.id,
    recipe.ownerId,
    recipe.title,
    recipe.servings,
    recipe.minutes,
    JSON.stringify(recipe.tags),
    JSON.stringify(recipe.ingredients),
    JSON.stringify(recipe.steps),
    recipe.notes,
    recipe.source,
    recipe.nutritionCache ? JSON.stringify(recipe.nutritionCache) : null
  );
  return recipe;
}

export function updateRecipe(id: string, patch: Partial<Recipe>): Recipe | undefined {
  const db = getDb();
  const existing = getRecipeById(id);
  if (!existing) return undefined;
  const updated = { ...existing, ...patch };
  db.prepare(
    "UPDATE recipes SET title = ?, servings = ?, minutes = ?, tags = ?, ingredients = ?, steps = ?, notes = ?, source = ?, nutrition_cache = ? WHERE id = ?"
  ).run(
    updated.title,
    updated.servings,
    updated.minutes,
    JSON.stringify(updated.tags),
    JSON.stringify(updated.ingredients),
    JSON.stringify(updated.steps),
    updated.notes,
    updated.source,
    updated.nutritionCache ? JSON.stringify(updated.nutritionCache) : null,
    id
  );
  return updated;
}

export function deleteRecipe(id: string): boolean {
  const db = getDb();
  const result = db.prepare("DELETE FROM recipes WHERE id = ?").run(id);
  if (result.changes > 0) {
    db.prepare("DELETE FROM plan WHERE recipe_id = ?").run(id);
    return true;
  }
  return false;
}

export function getPlan(userId: string): Slot[] {
  return getDb()
    .prepare("SELECT user_id as userId, day, meal, recipe_id as recipeId, servings FROM plan WHERE user_id = ?")
    .all(userId) as Slot[];
}

export function setPlanSlot(slot: Slot): void {
  const db = getDb();
  db.prepare("DELETE FROM plan WHERE user_id = ? AND day = ? AND meal = ?").run(slot.userId, slot.day, slot.meal);
  if (slot.recipeId) {
    db.prepare("INSERT INTO plan (user_id, day, meal, recipe_id, servings) VALUES (?, ?, ?, ?, ?)").run(
      slot.userId,
      slot.day,
      slot.meal,
      slot.recipeId,
      slot.servings ?? null
    );
  }
}

export function clearPlan(userId: string): void {
  getDb().prepare("DELETE FROM plan WHERE user_id = ?").run(userId);
}

export function getChecked(userId: string): string[] {
  return (getDb().prepare("SELECT key FROM checked_items WHERE user_id = ?").all(userId) as { key: string }[]).map(
    (r) => r.key
  );
}

export function toggleChecked(userId: string, key: string): void {
  const db = getDb();
  const exists = db.prepare("SELECT 1 FROM checked_items WHERE user_id = ? AND key = ?").get(userId, key);
  if (exists) {
    db.prepare("DELETE FROM checked_items WHERE user_id = ? AND key = ?").run(userId, key);
  } else {
    db.prepare("INSERT INTO checked_items (user_id, key) VALUES (?, ?)").run(userId, key);
  }
}

export function getProfile(userId: string): { paid: boolean } {
  const row = getDb().prepare("SELECT paid FROM profiles WHERE user_id = ?").get(userId) as any;
  if (!row) {
    getDb().prepare("INSERT OR IGNORE INTO profiles (user_id, paid) VALUES (?, 0)").run(userId);
    return { paid: false };
  }
  return { paid: !!row.paid };
}

export function setProfilePaid(userId: string, paid: boolean): void {
  getDb().prepare("INSERT OR REPLACE INTO profiles (user_id, paid) VALUES (?, ?)").run(userId, paid ? 1 : 0);
}

export function resetToSeed(): void {
  const db = getDb();
  db.prepare("DELETE FROM recipes").run();
  db.prepare("DELETE FROM plan").run();
  db.prepare("DELETE FROM checked_items").run();
  db.prepare("DELETE FROM profiles").run();
  seedIfEmpty();
}

function rowToRecipe(row: any): Recipe {
  return {
    id: row.id,
    ownerId: row.owner_id,
    title: row.title,
    servings: row.servings,
    minutes: row.minutes,
    tags: JSON.parse(row.tags),
    ingredients: JSON.parse(row.ingredients),
    steps: JSON.parse(row.steps),
    notes: row.notes,
    source: row.source,
    nutritionCache: row.nutrition_cache ? JSON.parse(row.nutrition_cache) : null,
  };
}

export function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
