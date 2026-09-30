// Collapses variants like "Milk*" and "Milk (Sheep Milk)" into "Milk".
export function normalizeAllergen(name: string): string {
  return name
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/\*+/g, "")
    .trim();
}
