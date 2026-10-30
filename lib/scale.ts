const VULGAR_MAP: Record<string, string> = {
  "½": "1/2",
  "⅓": "1/3",
  "⅔": "2/3",
  "¼": "1/4",
  "¾": "3/4",
  "⅕": "1/5",
  "⅖": "2/5",
  "⅗": "3/5",
  "⅘": "4/5",
  "⅙": "1/6",
  "⅚": "5/6",
  "⅛": "1/8",
  "⅜": "3/8",
  "⅝": "5/8",
  "⅞": "7/8",
};

export function parseAmount(input: string | number): number {
  if (typeof input === "number") return input;
  let s = input.trim();
  if (!s) return 0;
  for (const [vulgar, frac] of Object.entries(VULGAR_MAP)) {
    s = s.replaceAll(vulgar, frac);
  }
  const mixed = s.match(/^(\d+)\s+(\d+\/\d+)$/);
  if (mixed) {
    const whole = parseInt(mixed[1], 10);
    const frac = parseFraction(mixed[2]);
    return whole + frac;
  }
  if (/^\d+\/\d+$/.test(s)) {
    return parseFraction(s);
  }
  const n = parseFloat(s);
  return Number.isNaN(n) ? 0 : n;
}

function parseFraction(s: string): number {
  const [num, den] = s.split("/").map((x) => parseInt(x.trim(), 10));
  if (!den || den === 0) return 0;
  return num / den;
}

export function scaleAmount(amount: number, from: number, to: number): number {
  if (from <= 0 || to <= 0 || !Number.isFinite(from) || !Number.isFinite(to)) return amount;
  return (amount * to) / from;
}

export function showAmount(n: number): string {
  if (!Number.isFinite(n)) return String(n);
  const rounded = Math.round(n * 1000) / 1000;
  return String(rounded);
}

const STANDARD_UNITS = new Set([
  "tsp", "teaspoon", "teaspoons",
  "tbsp", "tablespoon", "tablespoons",
  "cup", "cups",
  "oz", "ounce", "ounces",
  "lb", "pound", "pounds",
  "g", "gram", "grams",
  "kg", "kilogram", "kilograms",
  "ml", "milliliter", "milliliters",
  "l", "liter", "liters",
  "pinch", "pinches",
  "dash", "dashes",
]);

export function isStandardUnit(unit: string): boolean {
  return STANDARD_UNITS.has(unit.toLowerCase().trim());
}

export function convertUnit(amount: number, unit: string): { amount: number; unit: string } {
  const u = unit.toLowerCase().trim();
  if (["tsp", "teaspoon", "teaspoons"].includes(u)) {
    if (amount >= 3) {
      const tbsp = amount / 3;
      if (Math.abs(tbsp - Math.round(tbsp)) < 0.001) {
        return { amount: Math.round(tbsp), unit: "tbsp" };
      }
    }
  }
  if (["tbsp", "tablespoon", "tablespoons"].includes(u)) {
    if (amount >= 16) {
      const cups = amount / 16;
      if (Math.abs(cups - Math.round(cups)) < 0.001) {
        return { amount: Math.round(cups), unit: "cup" };
      }
    }
  }
  return { amount, unit };
}
