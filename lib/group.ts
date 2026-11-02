// Agrupa respetando el orden de la lista; los regalos sin categoría van al final como "Otros".
// Los aportes en dinero siempre van primero (su categoría queda al inicio y la tarjeta arriba de todo).
export function groupByCategory<T extends { category: string; mode?: string }>(items: T[]) {
  const isMoney = (it: T) => it.mode === "money";
  const ordered = [...items.filter(isMoney), ...items.filter((it) => !isMoney(it))];
  const map = new Map<string, T[]>();
  for (const it of ordered) {
    const key = it.category.trim();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(it);
  }
  const named = [...map.entries()].filter(([k]) => k).map(([name, items]) => ({ name, items }));
  const other = map.get("");
  if (!other) return named;
  const otherGroup = { name: named.length ? "🎁 Otros" : "", items: other };
  // Si el aporte no tiene categoría, el grupo "Otros" también va primero.
  return other.some(isMoney) ? [otherGroup, ...named] : [...named, otherGroup];
}
