import type { StockRow } from "./types";

export type StockEdge = { a: string; b: string; weight: number; sameSector: boolean };

export type WalkFrame = {
  current: string;
  bag: string[];
  order: string[];
  seen: string[];
  note: string;
};

export function buildStockGraph(rows: StockRow[]) {
  const symbols = rows.map((r) => r.symbol);
  const by = new Map(rows.map((r) => [r.symbol, r]));
  const edges: StockEdge[] = [];
  for (let i = 0; i < symbols.length; i++) {
    for (let j = i + 1; j < symbols.length; j++) {
      const a = by.get(symbols[i]!)!;
      const b = by.get(symbols[j]!)!;
      const sameSector = a.sector === b.sector && a.sector !== "Other";
      const gap = Math.abs(a.changePct - b.changePct);
      const weight = Number((gap + (sameSector ? 0 : 1)).toFixed(4));
      edges.push({ a: a.symbol, b: b.symbol, weight, sameSector });
    }
  }
  const same = edges.filter((e) => e.sameSector);
  const cross = edges
    .filter((e) => !e.sameSector)
    .sort((a, b) => a.weight - b.weight)
    .slice(0, 6);
  const kept = [...same, ...cross];
  const adj = new Map<string, { to: string; weight: number }[]>();
  for (const s of symbols) adj.set(s, []);
  for (const e of kept) {
    adj.get(e.a)!.push({ to: e.b, weight: e.weight });
    adj.get(e.b)!.push({ to: e.a, weight: e.weight });
  }
  for (const list of adj.values()) list.sort((x, y) => x.to.localeCompare(y.to));
  return { symbols, edges: kept, adj };
}

export function bfs(adj: Map<string, { to: string }[]>, start: string): WalkFrame[] {
  if (!adj.has(start)) return [];
  const seen = new Set<string>([start]);
  const queue = [start];
  const order: string[] = [];
  const frames: WalkFrame[] = [
    { current: start, bag: [...queue], order: [], seen: [...seen], note: `Enqueue ${start}` },
  ];
  while (queue.length) {
    const u = queue.shift()!;
    order.push(u);
    frames.push({
      current: u,
      bag: [...queue],
      order: [...order],
      seen: [...seen],
      note: `Visit ${u}`,
    });
    for (const { to } of adj.get(u) ?? []) {
      if (seen.has(to)) continue;
      seen.add(to);
      queue.push(to);
      frames.push({
        current: to,
        bag: [...queue],
        order: [...order],
        seen: [...seen],
        note: `Discover ${to} from ${u}`,
      });
    }
  }
  return frames;
}

export function dfs(adj: Map<string, { to: string }[]>, start: string): WalkFrame[] {
  if (!adj.has(start)) return [];
  const seen = new Set<string>();
  const stack = [start];
  const order: string[] = [];
  const frames: WalkFrame[] = [];
  while (stack.length) {
    const u = stack.pop()!;
    if (seen.has(u)) continue;
    seen.add(u);
    order.push(u);
    const next = [...(adj.get(u) ?? [])].reverse();
    for (const { to } of next) if (!seen.has(to)) stack.push(to);
    frames.push({
      current: u,
      bag: [...stack],
      order: [...order],
      seen: [...seen],
      note: `Visit ${u}`,
    });
  }
  return frames;
}

class DSU {
  parent: number[];
  rank: number[];
  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = Array(n).fill(0);
  }
  find(x: number): number {
    let p = this.parent[x]!;
    if (p !== x) {
      p = this.find(p);
      this.parent[x] = p;
    }
    return p;
  }
  union(a: number, b: number) {
    let pa = this.find(a);
    let pb = this.find(b);
    if (pa === pb) return false;
    if (this.rank[pa]! < this.rank[pb]!) [pa, pb] = [pb, pa];
    this.parent[pb] = pa;
    if (this.rank[pa] === this.rank[pb]) this.rank[pa]! += 1;
    return true;
  }
}

export type MstFrame = {
  edge: StockEdge | null;
  accepted: boolean;
  chosen: StockEdge[];
  rejected: StockEdge[];
  total: number;
  note: string;
};

export function kruskal(symbols: string[], edges: StockEdge[]): MstFrame[] {
  const index = new Map(symbols.map((s, i) => [s, i]));
  const sorted = [...edges].sort((a, b) => a.weight - b.weight || a.a.localeCompare(b.a));
  const dsu = new DSU(symbols.length);
  const chosen: StockEdge[] = [];
  const rejected: StockEdge[] = [];
  const frames: MstFrame[] = [];
  let total = 0;
  for (const edge of sorted) {
    const ia = index.get(edge.a);
    const ib = index.get(edge.b);
    if (ia == null || ib == null) continue;
    const ok = dsu.union(ia, ib);
    if (ok) {
      chosen.push(edge);
      total += edge.weight;
      frames.push({
        edge,
        accepted: true,
        chosen: [...chosen],
        rejected: [...rejected],
        total,
        note: `Take ${edge.a}–${edge.b} (${edge.weight})`,
      });
    } else {
      rejected.push(edge);
      frames.push({
        edge,
        accepted: false,
        chosen: [...chosen],
        rejected: [...rejected],
        total,
        note: `Reject ${edge.a}–${edge.b}: cycle`,
      });
    }
  }
  return frames;
}
