import type { StockRow } from "./types";

export type SearchStep = {
  index: number;
  symbol: string;
  comparisons: number;
  found: boolean;
  lo: number;
  hi: number;
};

export function linearSearch(rows: StockRow[], query: string): SearchStep[] {
  const q = query.trim().toUpperCase();
  const steps: SearchStep[] = [];
  if (!q) return steps;
  let comparisons = 0;
  for (let i = 0; i < rows.length; i++) {
    comparisons += 1;
    const row = rows[i]!;
    const found = row.symbol === q || row.name.toUpperCase().includes(q);
    steps.push({ index: i, symbol: row.symbol, comparisons, found, lo: 0, hi: rows.length - 1 });
    if (found) break;
  }
  return steps;
}

export function binarySearch(rows: StockRow[], query: string): { sorted: StockRow[]; steps: SearchStep[] } {
  const q = query.trim().toUpperCase();
  const sorted = [...rows].sort((a, b) => a.symbol.localeCompare(b.symbol));
  const steps: SearchStep[] = [];
  if (!q) return { sorted, steps };
  let lo = 0;
  let hi = sorted.length - 1;
  let comparisons = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    comparisons += 1;
    const symbol = sorted[mid]!.symbol;
    const cmp = symbol.localeCompare(q);
    steps.push({ index: mid, symbol, comparisons, found: cmp === 0, lo, hi });
    if (cmp === 0) return { sorted, steps };
    if (cmp < 0) lo = mid + 1;
    else hi = mid - 1;
  }
  steps.push({ index: -1, symbol: "", comparisons, found: false, lo, hi });
  return { sorted, steps };
}
