import assert from "node:assert/strict";
import test from "node:test";
import { MaxHeap, alertScore } from "./heap.ts";
import { TxList } from "./list.ts";
import { binarySearch, linearSearch } from "./search.ts";
import { TickerHash } from "./hash.ts";
import { bfs, dfs, kruskal } from "./graph.ts";
import { sortFrames } from "./sort.ts";
import { buildTree, searchTree } from "./tree.ts";
import { Queue, Stack } from "./linear.ts";
import type { StockRow } from "./types.ts";

const rows: StockRow[] = [
  { symbol: "MSFT", name: "Microsoft", price: 400, changePct: 0.01, volume: 2e7, sector: "Technology" },
  { symbol: "AAPL", name: "Apple", price: 180, changePct: -0.02, volume: 5e7, sector: "Technology" },
  { symbol: "XOM", name: "Exxon", price: 110, changePct: 0.03, volume: 1e7, sector: "Energy" },
  { symbol: "JPM", name: "JPMorgan", price: 200, changePct: 0.005, volume: 8e6, sector: "Finance" },
];

test("max heap extracts highest score first", () => {
  const heap = new MaxHeap();
  heap.insert({ symbol: "A", name: "A", score: 1, changePct: 0, volume: 0 });
  heap.insert({ symbol: "C", name: "C", score: 3, changePct: 0, volume: 0 });
  heap.insert({ symbol: "B", name: "B", score: 2, changePct: 0, volume: 0 });
  assert.equal(heap.peek()?.symbol, "C");
  assert.equal(heap.extract()?.symbol, "C");
  assert.equal(heap.extract()?.symbol, "B");
  assert.equal(heap.extract()?.symbol, "A");
  assert.equal(heap.extract(), null);
  assert.ok(alertScore(0.05, 1e7) > alertScore(0.01, 1e6));
});

test("linked list stays chronological and finds a ticker", () => {
  const list = new TxList();
  list.insert({ id: "2", name: "Apple", symbol: "AAPL", type: "sell", quantity: 1, price: 190, at: 20 });
  list.insert({ id: "1", name: "Apple", symbol: "AAPL", type: "buy", quantity: 2, price: 170, at: 10 });
  assert.deepEqual(list.toArray().map((t) => t.id), ["1", "2"]);
  assert.equal(list.find("aapl")?.type, "buy");
  assert.equal(list.remove("1"), true);
  assert.equal(list.toArray().length, 1);
  assert.equal(list.find("missing"), null);
});

test("binary search uses fewer comparisons than a late linear hit", () => {
  const many = Array.from({ length: 16 }, (_, i) => ({
    symbol: String.fromCharCode(65 + i),
    name: `Name ${i}`,
    price: i,
    changePct: 0,
    volume: 1,
    sector: "Technology",
  }));
  const linear = linearSearch(many, "P");
  const binary = binarySearch(many, "P");
  assert.equal(binary.steps.at(-1)?.found, true);
  assert.ok(binary.steps.at(-1)!.comparisons < linear.at(-1)!.comparisons);
  assert.equal(binarySearch(many, "ZZ").steps.at(-1)?.found, false);
});

test("hash chaining stores colliding keys in one bucket", () => {
  const table = new TickerHash(1);
  const a = table.insert(rows[0]!);
  const b = table.insert(rows[1]!);
  assert.equal(a.bucket, 0);
  assert.equal(b.collisions, 1);
  assert.equal(table.search("AAPL").found, true);
  assert.equal(table.remove("AAPL").found, true);
  assert.equal(table.search("AAPL").found, false);
});

test("bfs and dfs visit every neighbor and kruskal rejects a cycle", () => {
  const adj = new Map<string, { to: string }[]>([
    ["A", [{ to: "B" }, { to: "C" }]],
    ["B", [{ to: "A" }, { to: "C" }]],
    ["C", [{ to: "A" }, { to: "B" }]],
  ]);
  const b = bfs(adj, "A");
  const d = dfs(adj, "A");
  assert.deepEqual(b.at(-1)?.seen.sort(), ["A", "B", "C"]);
  assert.deepEqual(d.at(-1)?.seen.sort(), ["A", "B", "C"]);
  const frames = kruskal(
    ["A", "B", "C"],
    [
      { a: "A", b: "B", weight: 1, sameSector: true },
      { a: "B", b: "C", weight: 2, sameSector: true },
      { a: "A", b: "C", weight: 5, sameSector: true },
    ],
  );
  assert.equal(frames.filter((f) => f.accepted).length, 2);
  assert.equal(frames.some((f) => !f.accepted), true);
  assert.equal(Number(frames.at(-1)!.total.toFixed(2)), 3);
});

test("sorts finish in nondecreasing order", () => {
  for (const name of ["bubble", "selection", "insertion", "merge", "quick", "heap"] as const) {
    const frames = sortFrames(rows, name, "price");
    const values = frames.at(-1)!.values.map((v) => v.value);
    const sorted = [...values].sort((a, b) => a - b);
    assert.deepEqual(values, sorted);
  }
});

test("avl stays balanced and bst search follows the key", () => {
  const { root } = buildTree(rows, true);
  function walk(n: typeof root): number {
    if (!n) return 0;
    const b = Math.abs((n.left?.height ?? 0) - (n.right?.height ?? 0));
    assert.ok(b <= 1);
    return 1 + walk(n.left) + walk(n.right);
  }
  assert.equal(walk(root), rows.length);
  assert.equal(searchTree(root, "XOM").at(-1), "XOM");
});

test("stack and queue", () => {
  const s = new Stack<string>();
  s.push("AAPL");
  s.push("MSFT");
  assert.equal(s.peek(), "MSFT");
  assert.equal(s.pop(), "MSFT");
  const q = new Queue<string>();
  q.enqueue("NVDA");
  q.enqueue("AMD");
  assert.equal(q.dequeue(), "NVDA");
  assert.equal(q.peek(), "AMD");
});
