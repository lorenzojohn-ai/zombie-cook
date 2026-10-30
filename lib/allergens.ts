const ALLERGEN_PATTERNS: Record<string, RegExp> = {
  milk: /\bmilk\b|\bcheese\b|\bbutter\b|\bcream\b|\byogurt\b|\bghee\b|\bhalf-and-half\b/i,
  eggs: /\begg\b|\beggs\b/i,
  fish: /\bsalmon\b|\btuna\b|\bcod\b|\bhalibut\b|\btrout\b|\bmackerel\b|\banchov|\bsardine\b|\bfish\b/i,
  shellfish: /\bshrimp\b|\bprawn\b|\bcrab\b|\blobster\b|\bcrawfish\b|\bscallop\b|\bclam\b|\boyster\b|\bmussel\b|\bshellfish\b/i,
  "tree nuts": /\balmond\b|\bcashew\b|\bwalnut\b|\bpecan\b|\bpistachio\b|\bhazelnut\b|\bmacadamia\b|\bbrazil nut\b|\bpine nut\b|\bchestnut\b/i,
  peanuts: /\bpeanut\b|\bpeanuts\b/i,
  wheat: /\bwheat\b|\bflour\b|\bbread\b|\bpasta\b|\bcouscous\b|\bsemolina\b|\bspelt\b|\bbulgur\b|\bfarro\b/i,
  soybeans: /\bsoy\b|\bsoybean\b|\btofu\b|\btempeh\b|\bedamame\b|\bmiso\b/i,
  sesame: /\bsesame\b|\btahini\b/i,
};

export function detectAllergens(ingredients: { name: string }[]): string[] {
  const found = new Set<string>();
  for (const ing of ingredients) {
    for (const [allergen, pattern] of Object.entries(ALLERGEN_PATTERNS)) {
      if (pattern.test(ing.name)) found.add(allergen);
    }
  }
  return Array.from(found).sort();
}
