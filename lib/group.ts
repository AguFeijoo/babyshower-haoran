// Agrupa respetando el orden de la lista; los regalos sin categoría van al final como "Otros".
export function groupByCategory<T extends { category: string }>(items: T[]) {
  const map = new Map<string, T[]>();
  for (const it of items) {
    const key = it.category.trim();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(it);
  }
  const named = [...map.entries()].filter(([k]) => k).map(([name, items]) => ({ name, items }));
  const other = map.get("");
  return other ? [...named, { name: named.length ? "🎁 Otros" : "", items: other }] : named;
}
