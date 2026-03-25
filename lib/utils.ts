// Shared utility functions used across interview pages and components

/** Format a grade level number as a display string. */
export function gradeLabel(g: number): string {
  return g === 0 ? "K" : `${g}`;
}

/** Return today's date as a YYYY-MM-DD string. */
export function getTodayISO(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Group items by their `number` field (sub-group key).
 * Returns ordered entries: [subGroupLabel, items[]]
 */
export function groupBySubLevel<T extends { number: string }>(
  items: T[]
): [string, T[]][] {
  const map = new Map<string, T[]>();
  items.forEach((item) => {
    if (!map.has(item.number)) map.set(item.number, []);
    map.get(item.number)!.push(item);
  });
  return Array.from(map.entries());
}

/** Build a validation error message with correct pluralisation. */
export function requiredItemsMessage(count: number, action: "continuing" | "submitting" = "continuing"): string {
  return `Please answer all ${count} required item${count !== 1 ? "s" : ""} before ${action}.`;
}

/** Return a Tailwind bg colour class based on a score percentage. */
export function scoreColor(correct: number, total: number): string {
  if (total === 0) return "bg-gray-100 text-gray-500";
  const pct = correct / total;
  if (pct >= 0.75) return "bg-green-200 text-green-800";
  if (pct >= 0.5)  return "bg-yellow-200 text-yellow-800";
  return "bg-red-100 text-red-700";
}
