import type { StockRow } from "./types";

export type HashOp = {
  action: "insert" | "search" | "delete";
  key: string;
  bucket: number;
  chain: string[];
  found: boolean;
  collisions: number;
};

/** Separate chaining. Capacity stays small so collisions are visible. */
export class TickerHash {
  readonly capacity: number;
  buckets: StockRow[][];

  constructor(capacity = 7) {
    this.capacity = capacity;
    this.buckets = Array.from({ length: capacity }, () => []);
  }

  hash(key: string) {
    let h = 0;
    for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
    return h % this.capacity;
  }

  insert(row: StockRow): HashOp {
    const bucket = this.hash(row.symbol);
    const chain = this.buckets[bucket]!;
    const existing = chain.findIndex((x) => x.symbol === row.symbol);
    if (existing >= 0) chain[existing] = row;
    else chain.push(row);
    return {
      action: "insert",
      key: row.symbol,
      bucket,
      chain: chain.map((x) => x.symbol),
      found: true,
      collisions: Math.max(0, chain.length - 1),
    };
  }

  search(symbol: string): HashOp {
    const key = symbol.trim().toUpperCase();
    const bucket = this.hash(key);
    const chain = this.buckets[bucket] ?? [];
    const found = chain.some((x) => x.symbol === key);
    return {
      action: "search",
      key,
      bucket,
      chain: chain.map((x) => x.symbol),
      found,
      collisions: Math.max(0, chain.length - 1),
    };
  }

  remove(symbol: string): HashOp {
    const key = symbol.trim().toUpperCase();
    const bucket = this.hash(key);
    const chain = this.buckets[bucket] ?? [];
    const i = chain.findIndex((x) => x.symbol === key);
    if (i >= 0) chain.splice(i, 1);
    return {
      action: "delete",
      key,
      bucket,
      chain: chain.map((x) => x.symbol),
      found: i >= 0,
      collisions: Math.max(0, chain.length - 1),
    };
  }
}

export function loadHash(rows: StockRow[], capacity = 7) {
  const table = new TickerHash(capacity);
  const ops = rows.map((row) => table.insert(row));
  return { table, ops };
}
