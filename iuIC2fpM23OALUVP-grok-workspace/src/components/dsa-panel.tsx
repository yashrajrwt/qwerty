import { useQuery } from "@tanstack/react-query";
import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { alertScore, MaxHeap, type HeapItem } from "@/lib/dsa/heap";
import { loadHash } from "@/lib/dsa/hash";
import { bfs, buildStockGraph, dfs, kruskal, type MstFrame, type WalkFrame } from "@/lib/dsa/graph";
import { Queue, Stack } from "@/lib/dsa/linear";
import { TxList, type Tx } from "@/lib/dsa/list";
import { binarySearch, linearSearch } from "@/lib/dsa/search";
import { sortFrames, type SortKey, type SortName } from "@/lib/dsa/sort";
import { buildTree, searchTree } from "@/lib/dsa/tree";
import { sectorOf, type StockRow } from "@/lib/dsa/types";
import { BOARD, fetchWatchQuotes } from "@/lib/market";
import { useDesk } from "@/lib/store";
import { cn, formatCompact, formatNumber, formatPct } from "@/lib/utils";

const CONCEPTS = [
  { id: "heap", title: "Priority queue", cost: "Insert / extract O(log n)", space: "O(n)" },
  { id: "list", title: "Linked list", cost: "Insert O(n)", space: "O(n)" },
  { id: "search", title: "Binary search", cost: "O(log n) after sort", space: "O(n)" },
  { id: "hash", title: "Hash table", cost: "Average O(1)", space: "O(n)" },
  { id: "graph", title: "Graph, BFS, DFS", cost: "O(V + E)", space: "O(V + E)" },
  { id: "mst", title: "Kruskal MST", cost: "O(E log E)", space: "O(V)" },
  { id: "sort", title: "Sorting", cost: "O(n log n) best of these", space: "O(n)" },
  { id: "tree", title: "BST and AVL", cost: "AVL search O(log n)", space: "O(n)" },
  { id: "stack", title: "Stack", cost: "Push / pop O(1)", space: "O(n)" },
  { id: "queue", title: "Queue", cost: "Enqueue / dequeue O(1)", space: "O(n)" },
] as const;

type ConceptId = (typeof CONCEPTS)[number]["id"];

const GUIDE: {
  id: ConceptId;
  title: string;
  used: string;
  how: string;
  cost: string;
}[] = [
  {
    id: "heap",
    title: "Priority queue (max heap)",
    used: "Ranks live alerts. A bigger percent move and heavier volume get a higher score.",
    how: "The hottest symbol sits at the root. Insert sifts a new score up. Extract-max removes the root and sifts the last node down. Delete restores the heap after a name is removed. Peek reads the root without removing it.",
    cost: "Insert and extract O(log n). Peek O(1). Space O(n).",
  },
  {
    id: "list",
    title: "Linked list",
    used: "Holds the buy and sell blotter, including lots already booked on the Portfolio tab.",
    how: "Each node stores the company name, ticker, buy or sell, quantity, price, and time. Insert walks the list until the timestamp fits, so history stays chronological. Delete unlinks a node. Search walks from the head. Previous and next move one trade at a time.",
    cost: "Insert and search O(n). Space O(n).",
  },
  {
    id: "search",
    title: "Linear search and binary search",
    used: "Finds a ticker on the live board and counts every comparison. The latest-news feed uses the same linear scan to skip a headline id it has already kept.",
    how: "Linear search checks names in the order they arrive and stops at the first hit. Binary search first sorts the tickers, then halves the window: if the middle symbol is too small, search the right half, otherwise the left. The step counter shows why the sorted search does less work.",
    cost: "Linear O(n). Binary O(log n) after an O(n log n) sort. Space O(n).",
  },
  {
    id: "hash",
    title: "Hash table (separate chaining)",
    used: "Looks up a ticker without scanning the whole board.",
    how: "The key is the symbol. The hash is h = (h × 31 + character) mod 7. A small table is deliberate so two symbols can land in the same bucket. Those collisions sit in a chain. Insert, search, and delete all start at that bucket.",
    cost: "Average O(1). Worst case O(n) if every key collides. Space O(n).",
  },
  {
    id: "graph",
    title: "Graph (adjacency list)",
    used: "Connects companies that share a sector, plus a few cross-sector links.",
    how: "Each stock is a vertex. An edge weight is the gap between today’s percent changes. Same-sector pairs have no extra penalty. A different sector adds 1, so those links are weaker. The adjacency list stores each neighbor once per endpoint.",
    cost: "Build O(V²) for this small board. Space O(V + E).",
  },
  {
    id: "graph",
    title: "Breadth-first search",
    used: "Walks related companies level by level from a stock you pick.",
    how: "BFS keeps a queue. It visits a symbol, then enqueues every unseen neighbor. Near peers are seen before distant ones. The drawing highlights visited vertices and shows the queue.",
    cost: "O(V + E) time and space.",
  },
  {
    id: "graph",
    title: "Depth-first search",
    used: "Follows one chain of related companies as far as it can, then backtracks.",
    how: "DFS uses a stack. It visits a symbol and pushes its unseen neighbors. One path is finished before the next branch starts. The same graph makes the difference from BFS visible.",
    cost: "O(V + E) time and space.",
  },
  {
    id: "mst",
    title: "Kruskal’s algorithm and disjoint set",
    used: "Builds a minimum spanning tree of the relationship graph.",
    how: "Edges are sorted by weight. A disjoint-set structure, with path compression and union by rank, checks whether two symbols are already connected. A lighter edge that joins two components is kept. An edge that would close a cycle is rejected. The total weight is the sum of the kept edges. This tree maps similar moves. It is not a portfolio to buy.",
    cost: "O(E log E) to sort. Union-find is nearly O(1) per edge. Space O(V).",
  },
  {
    id: "sort",
    title: "Sorting",
    used: "Orders the live board by price, percent change, or volume. The latest-news list is also sorted, newest publish time first.",
    how: "Bubble sort swaps neighbors. Selection sort places the next minimum. Insertion sort slides a value into the sorted prefix. Merge sort combines sorted halves. Quick sort partitions around a pivot. Heap sort extracts the max from a heap. Market cap is not a key because this quote feed does not include it.",
    cost: "Bubble, selection, and insertion are O(n²). Merge and heap are O(n log n). Quick sort is O(n log n) on average.",
  },
  {
    id: "tree",
    title: "Binary search tree",
    used: "Stores tickers so a search can ignore half the records.",
    how: "A smaller symbol goes left. A larger symbol goes right. Search follows that rule and records the path. If symbols are inserted already sorted, a plain BST becomes a line and search falls back to O(n).",
    cost: "Average O(log n). Worst case O(n). Space O(n).",
  },
  {
    id: "tree",
    title: "AVL tree",
    used: "Keeps the same ticker index balanced after every insert.",
    how: "The balance factor is the height of the left subtree minus the height of the right. If it is more than 1, the tree rotates left or right. The same sorted load that unbalances a BST stays near O(log n) here. The small number under each node is that balance factor.",
    cost: "Search and insert O(log n). Space O(n).",
  },
  {
    id: "stack",
    title: "Stack",
    used: "Keeps recently viewed symbols. The last one you opened is the first one you return to.",
    how: "Push adds a ticker on top. Pop removes it. Peek reads the top without removing it. The History tab is the same idea: newest lookup first.",
    cost: "Push, pop, and peek O(1). Space O(n).",
  },
  {
    id: "queue",
    title: "Queue",
    used: "Holds pending stock-analysis requests in arrival order.",
    how: "Enqueue adds a symbol at the back. Dequeue removes the one at the front. The oldest request is handled first. This is the opposite of the stack.",
    cost: "Enqueue and dequeue O(1). Space O(n).",
  },
];

const WHY: Record<ConceptId, string> = {
  heap: "A desk ranks alerts by how violent the move is. A max-heap keeps the hottest name at the root without sorting the whole book on every tick.",
  list: "A trade blotter grows from the front of the day. A linked list inserts a fill in time order and walks history without shifting an array.",
  search: "Once symbols are sorted, binary search halves the book each comparison. Linear search still checks every name until it hits. The headline list uses that linear check so the same story is not shown twice.",
  hash: "Ticker lookup should not scan the watchlist. The hash of the symbol picks a bucket; separate chaining holds the names that collide.",
  graph: "Companies in one sector move together. An adjacency list stores those links. BFS walks sector peers level by level; DFS follows one chain before backtracking.",
  mst: "Kruskal keeps the lightest relationship edges that do not form a cycle. The tree is a map of similar moves, not a portfolio to buy.",
  sort: "Screens sort the board by price, percent change, or volume. The latest headlines are sorted the same way, newest time first. The six sorts below show the steps.",
  tree: "A binary search tree stores symbols in order. An AVL tree rotates so a sorted load does not collapse into a linked list.",
  stack: "The last symbol you opened is the first one you go back to. That is a stack.",
  queue: "Analysis jobs wait in arrival order. A queue dequeues the oldest request first.",
};

const CODE: Record<ConceptId, string> = {
  heap: "insert(x): push, sift up while parent < child\nextract(): take root, move last up, sift down",
  list: "insert(tx): walk until timestamp fits\nfind(symbol): traverse from head",
  search: "while lo <= hi:\n  mid = (lo + hi) / 2\n  if key < a[mid]: hi = mid - 1 else lo = mid + 1",
  hash: "bucket = hash(symbol) % capacity\nchain = buckets[bucket]   // separate chaining",
  graph: "BFS: dequeue u, enqueue unseen neighbors\nDFS: pop u, push unseen neighbors",
  mst: "sort edges by weight\nfor edge: if find(u) != find(v): union, take edge else reject",
  sort: "bubble / selection / insertion: O(n²)\nmerge / quick / heap: O(n log n) average or worst",
  tree: "BST: go left if smaller, right if larger\nAVL: rotate when |balance| > 1",
  stack: "push(x)  pop()  peek() = top",
  queue: "enqueue(x) at back   dequeue() from front",
};

function StepBar({
  step,
  total,
  playing,
  onPlay,
  onNext,
  onReset,
}: {
  step: number;
  total: number;
  playing: boolean;
  onPlay: () => void;
  onNext: () => void;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" variant="secondary" size="sm" onClick={onPlay} disabled={total === 0}>
        {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
        {playing ? "Pause" : "Play"}
      </Button>
      <Button type="button" variant="secondary" size="sm" onClick={onNext} disabled={total === 0}>
        <SkipForward className="size-4" />
        Next
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onReset}>
        <RotateCcw className="size-4" />
        Reset
      </Button>
      <span className="font-mono text-xs text-muted tabular-nums">
        {total ? `${Math.min(step + 1, total)} / ${total}` : "0 / 0"}
      </span>
    </div>
  );
}

function usePlayer(total: number, token: string) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    setStep(0);
    setPlaying(false);
  }, [token, total]);
  useEffect(() => {
    if (!playing || total === 0) return;
    const id = window.setInterval(() => {
      setStep((n) => {
        if (n >= total - 1) {
          setPlaying(false);
          return n;
        }
        return n + 1;
      });
    }, 520);
    return () => window.clearInterval(id);
  }, [playing, total]);
  return {
    step: total ? Math.min(step, total - 1) : 0,
    playing,
    onPlay: () => setPlaying((p) => !p),
    onNext: () => {
      setPlaying(false);
      setStep((n) => Math.min(total - 1, n + 1));
    },
    onReset: () => {
      setPlaying(false);
      setStep(0);
    },
  };
}

function GraphView({
  symbols,
  edges,
  seen,
  current,
  chosen,
  rejected,
}: {
  symbols: string[];
  edges: { a: string; b: string; weight: number }[];
  seen: string[];
  current: string | null;
  chosen?: { a: string; b: string }[];
  rejected?: { a: string; b: string }[];
}) {
  const pos = symbols.map((symbol, i) => {
    const angle = (i / Math.max(symbols.length, 1)) * Math.PI * 2 - Math.PI / 2;
    return { symbol, x: 50 + 38 * Math.cos(angle), y: 50 + 36 * Math.sin(angle) };
  });
  const at = new Map(pos.map((p) => [p.symbol, p]));
  const seenSet = new Set(seen);
  const taken = new Set((chosen ?? []).map((e) => [e.a, e.b].sort().join("|")));
  const dropped = new Set((rejected ?? []).map((e) => [e.a, e.b].sort().join("|")));
  return (
    <svg viewBox="0 0 100 100" className="h-64 w-full sm:h-80">
      {edges.map((e) => {
        const a = at.get(e.a);
        const b = at.get(e.b);
        if (!a || !b) return null;
        const id = [e.a, e.b].sort().join("|");
        const on = taken.has(id);
        const off = dropped.has(id);
        return (
          <line
            key={id}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={on ? "var(--color-gain)" : off ? "var(--color-loss)" : "var(--color-border-strong)"}
            strokeWidth={on ? 0.8 : 0.35}
            strokeDasharray={off ? "1.2 1" : undefined}
          />
        );
      })}
      {pos.map((p) => (
        <g key={p.symbol}>
          <circle
            cx={p.x}
            cy={p.y}
            r={current === p.symbol ? 4.2 : 3.3}
            fill={seenSet.has(p.symbol) ? "var(--color-accent)" : "var(--color-elevated)"}
            stroke="var(--color-border-strong)"
          />
          <text
            x={p.x}
            y={p.y + 1.1}
            textAnchor="middle"
            fontSize="2.4"
            fill={seenSet.has(p.symbol) ? "var(--color-accent-foreground)" : "var(--color-foreground)"}
          >
            {p.symbol}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function DsaPanel({ history }: { history: string[] }) {
  const [concept, setConcept] = useState<ConceptId | "guide">("guide");
  const board = useQuery({
    queryKey: ["dsa-board"],
    queryFn: () => fetchWatchQuotes({ data: { symbols: [...BOARD] } }),
    staleTime: 60_000,
  });
  const rows = useMemo<StockRow[]>(
    () =>
      (board.data ?? []).map((q) => ({
        symbol: q.symbol,
        name: q.name,
        price: q.price,
        changePct: q.changePct,
        volume: q.volume ?? 0,
        sector: sectorOf(q.symbol),
      })),
    [board.data],
  );

  return (
    <div className="mt-6 space-y-4">
      <div>
        <p className="font-display text-lg tracking-tight">DSA in the market</p>
        <p className="mt-1 max-w-prose text-sm text-muted">
          Open Guide for a written explanation of every structure used on this desk. The other chips run that structure on live quotes.
        </p>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setConcept("guide")}
          className={cn(
            "h-10 shrink-0 rounded-full border px-3 text-sm",
            concept === "guide"
              ? "border-border-strong bg-elevated text-foreground"
              : "border-border text-muted",
          )}
        >
          Guide
        </button>
        {CONCEPTS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setConcept(item.id)}
            className={cn(
              "h-10 shrink-0 rounded-full border px-3 text-sm",
              concept === item.id
                ? "border-border-strong bg-elevated text-foreground"
                : "border-border text-muted",
            )}
          >
            {item.title}
          </button>
        ))}
      </div>
      {concept === "guide" ? (
        <GuideView onOpen={setConcept} />
      ) : (
        <>
          <section className="rounded-[var(--radius-lg)] border border-border bg-elevated p-4">
            <p className="text-sm leading-relaxed">{WHY[concept]}</p>
            <p className="mt-2 font-mono text-xs text-subtle">
              {CONCEPTS.find((c) => c.id === concept)?.cost} · space {CONCEPTS.find((c) => c.id === concept)?.space}
            </p>
            <pre className="mt-3 overflow-x-auto font-mono text-xs leading-relaxed text-muted">{CODE[concept]}</pre>
          </section>
          {board.isLoading && rows.length === 0 ? (
            <p className="text-sm text-muted">Loading the live board…</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-loss">The board did not return quotes. Try again in a moment.</p>
          ) : (
            <>
              {concept === "heap" && <HeapView rows={rows} />}
              {concept === "list" && <ListView rows={rows} />}
              {concept === "search" && <SearchView rows={rows} />}
              {concept === "hash" && <HashView rows={rows} />}
              {concept === "graph" && <WalkView rows={rows} />}
              {concept === "mst" && <MstView rows={rows} />}
              {concept === "sort" && <SortView rows={rows} />}
              {concept === "tree" && <TreeView rows={rows} />}
              {concept === "stack" && <StackView history={history} />}
              {concept === "queue" && <QueueView symbols={rows.map((r) => r.symbol)} />}
            </>
          )}
        </>
      )}
    </div>
  );
}

function GuideView({ onOpen }: { onOpen: (id: ConceptId) => void }) {
  return (
    <div className="space-y-3">
      {GUIDE.map((item) => (
        <article key={item.title} className="nest-card rounded-[var(--radius-lg)] p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h3 className="font-display text-base tracking-tight">{item.title}</h3>
            <button
              type="button"
              onClick={() => onOpen(item.id)}
              className="h-9 rounded-full border border-border px-3 text-xs text-muted hover:text-foreground"
            >
              Run it
            </button>
          </div>
          <p className="mt-2 text-sm leading-relaxed">{item.how}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">Where NestInvest uses it: {item.used}</p>
          <p className="mt-2 font-mono text-xs text-subtle">{item.cost}</p>
        </article>
      ))}
    </div>
  );
}

function HeapView({ rows }: { rows: StockRow[] }) {
  const token = rows.map((r) => `${r.symbol}:${r.changePct}:${r.volume}`).join("|");
  const [heap, setHeap] = useState<MaxHeap>(() => new MaxHeap());
  const [picked, setPicked] = useState<HeapItem[]>([]);
  const [note, setNote] = useState("Heap built from the live board.");
  useEffect(() => {
    const next = new MaxHeap();
    for (const row of rows) {
      next.insert({
        symbol: row.symbol,
        name: row.name,
        score: alertScore(row.changePct, row.volume),
        changePct: row.changePct,
        volume: row.volume,
      });
    }
    setHeap(next);
    setPicked([]);
    setNote("Inserted every board name. Root is the highest-priority alert.");
  }, [token, rows]);
  const snap = heap.snapshot();
  const top = heap.peek();
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          onClick={() => {
            const item = heap.extract();
            setHeap(MaxHeap.from(heap.snapshot()));
            if (!item) setNote("Heap is empty.");
            else {
              setPicked((list) => [...list, item]);
              setNote(`Extracted ${item.symbol}. New root is ${heap.peek()?.symbol ?? "empty"}.`);
            }
          }}
        >
          Extract max
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => {
            if (!top) return;
            heap.removeSymbol(top.symbol);
            setHeap(MaxHeap.from(heap.snapshot()));
            setNote(`Deleted root ${top.symbol} and restored the heap.`);
          }}
        >
          Delete root
        </Button>
      </div>
      <p className="text-sm text-muted">
        Peek: <span className="font-mono text-foreground">{top ? `${top.symbol} · ${top.score.toFixed(2)}` : "empty"}</span>
        . {note}
      </p>
      <div className="flex flex-wrap gap-2">
        {snap.map((item, i) => (
          <div key={item.symbol} className="rounded-[var(--radius-sm)] border border-border bg-card px-3 py-2">
            <p className="font-mono text-xs text-subtle">index {i}{i === 0 ? " · root" : ` · parent ${((i - 1) / 2) | 0}`}</p>
            <p className="font-mono text-sm">{item.symbol}</p>
            <p className="font-mono text-xs text-muted tabular-nums">
              {item.score.toFixed(1)} · {formatPct(item.changePct)} · {formatCompact(item.volume)}
            </p>
          </div>
        ))}
      </div>
      {picked.length > 0 && (
        <p className="font-mono text-xs text-muted">Alert order: {picked.map((p) => p.symbol).join(" → ")}</p>
      )}
    </div>
  );
}

function ListView({ rows }: { rows: StockRow[] }) {
  const portfolio = useDesk((s) => s.portfolio);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [symbol, setSymbol] = useState(rows[0]?.symbol ?? "AAPL");
  const [qty, setQty] = useState("10");
  const [kind, setKind] = useState<"buy" | "sell">("buy");
  const [cursor, setCursor] = useState(0);
  const [query, setQuery] = useState("");
  const [hit, setHit] = useState("");
  useEffect(() => {
    const list = new TxList();
    portfolio.forEach((lot, i) => {
      const row = rows.find((r) => r.symbol === lot.symbol);
      list.insert({
        id: lot.id,
        name: row?.name ?? lot.symbol,
        symbol: lot.symbol,
        type: "buy",
        quantity: lot.quantity,
        price: lot.cost,
        at: Date.now() - (portfolio.length - i) * 60_000,
      });
    });
    setTxs(list.toArray());
    setCursor(0);
  }, [portfolio, rows]);
  const focus = txs[cursor] ?? null;
  return (
    <div className="space-y-3">
      <form
        className="grid gap-2 sm:grid-cols-5"
        onSubmit={(e) => {
          e.preventDefault();
          const row = rows.find((r) => r.symbol === symbol.trim().toUpperCase());
          const quantity = Number(qty);
          if (!row || !Number.isFinite(quantity) || quantity <= 0) return;
          const list = TxList.from(txs);
          list.insert({
            id: `${Date.now()}`,
            name: row.name,
            symbol: row.symbol,
            type: kind,
            quantity,
            price: row.price,
            at: Date.now(),
          });
          const next = list.toArray();
          setTxs(next);
          setCursor(next.length - 1);
        }}
      >
        <Input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} aria-label="Trade ticker" />
        <Input value={qty} onChange={(e) => setQty(e.target.value)} inputMode="decimal" aria-label="Quantity" />
        <Button type="button" variant={kind === "buy" ? "default" : "secondary"} onClick={() => setKind("buy")}>
          Buy
        </Button>
        <Button type="button" variant={kind === "sell" ? "default" : "secondary"} onClick={() => setKind("sell")}>
          Sell
        </Button>
        <Button type="submit">Insert</Button>
      </form>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="secondary" onClick={() => setCursor((n) => Math.max(0, n - 1))}>
          Previous
        </Button>
        <Button type="button" size="sm" variant="secondary" onClick={() => setCursor((n) => Math.min(txs.length - 1, n + 1))}>
          Next trade
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={!focus}
          onClick={() => {
            if (!focus) return;
            const list = TxList.from(txs);
            list.remove(focus.id);
            const next = list.toArray();
            setTxs(next);
            setCursor((n) => Math.max(0, Math.min(n, next.length - 1)));
          }}
        >
          Delete node
        </Button>
      </div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const found = TxList.from(txs).find(query);
          setHit(found ? `${found.type} ${found.symbol} @ ${found.price}` : "No match in the list.");
        }}
      >
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search the blotter" aria-label="Search trades" />
        <Button type="submit" variant="secondary">
          Traverse
        </Button>
      </form>
      {hit && <p className="text-sm text-muted">{hit}</p>}
      {txs.length === 0 ? (
        <p className="text-sm text-subtle">No trades yet. Add a buy or sell, or book a lot on the Portfolio tab.</p>
      ) : (
        <ol className="flex gap-2 overflow-x-auto pb-1">
          {txs.map((tx, i) => (
            <li key={tx.id}>
              <button
                type="button"
                onClick={() => setCursor(i)}
                className={cn(
                  "min-w-36 rounded-[var(--radius-sm)] border px-3 py-2 text-left",
                  i === cursor ? "border-border-strong bg-card" : "border-border",
                )}
              >
                <p className="font-mono text-xs text-subtle">{i === 0 ? "head" : `node ${i}`}</p>
                <p className="font-mono text-sm">{tx.symbol}</p>
                <p className="text-xs text-muted">
                  {tx.type} {formatNumber(tx.quantity, 2)} @ {formatNumber(tx.price, 2)}
                </p>
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function SearchView({ rows }: { rows: StockRow[] }) {
  const [query, setQuery] = useState(rows[0]?.symbol ?? "AAPL");
  const [run, setRun] = useState(0);
  const linear = useMemo(() => linearSearch(rows, query), [rows, query, run]);
  const binary = useMemo(() => binarySearch(rows, query), [rows, query, run]);
  const player = usePlayer(Math.max(linear.length, binary.steps.length), `${query}:${run}`);
  const l = linear[Math.min(player.step, linear.length - 1)];
  const b = binary.steps[Math.min(player.step, binary.steps.length - 1)];
  return (
    <div className="space-y-3">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setRun((n) => n + 1);
        }}
      >
        <Input value={query} onChange={(e) => setQuery(e.target.value.toUpperCase())} aria-label="Search symbol" />
        <Button type="submit">Search</Button>
      </form>
      <StepBar {...player} total={Math.max(linear.length, binary.steps.length)} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-[var(--radius-md)] bg-card p-3">
          <p className="text-xs tracking-wide text-subtle uppercase">Linear</p>
          <p className="mt-2 font-mono text-sm">
            {l ? `${l.symbol} · comparisons ${l.comparisons}${l.found ? " · found" : ""}` : "Enter a symbol."}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {rows.map((row, i) => (
              <span
                key={row.symbol}
                className={cn(
                  "rounded-full border px-2 py-1 font-mono text-xs",
                  l && i === l.index ? "border-border-strong bg-elevated" : "border-border text-muted",
                )}
              >
                {row.symbol}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-[var(--radius-md)] bg-card p-3">
          <p className="text-xs tracking-wide text-subtle uppercase">Binary, sorted by ticker</p>
          <p className="mt-2 font-mono text-sm">
            {b
              ? `${b.found ? b.symbol : "miss"} · comparisons ${b.comparisons} · window ${b.lo}–${b.hi}`
              : "Enter a symbol."}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {binary.sorted.map((row, i) => (
              <span
                key={row.symbol}
                className={cn(
                  "rounded-full border px-2 py-1 font-mono text-xs",
                  b && i === b.index ? "border-border-strong bg-elevated" : "border-border text-muted",
                  b && i >= b.lo && i <= b.hi ? "text-foreground" : "",
                )}
              >
                {row.symbol}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function HashView({ rows }: { rows: StockRow[] }) {
  const token = rows.map((r) => r.symbol).join(",");
  const [{ table, ops }, setBook] = useState(() => loadHash(rows, 7));
  const [key, setKey] = useState("");
  const [last, setLast] = useState(ops.at(-1) ?? null);
  useEffect(() => {
    const loaded = loadHash(rows, 7);
    setBook(loaded);
    setLast(loaded.ops.at(-1) ?? null);
  }, [token, rows]);
  return (
    <div className="space-y-3">
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setLast(table.search(key));
          setBook({ table, ops });
        }}
      >
        <Input value={key} onChange={(e) => setKey(e.target.value.toUpperCase())} placeholder="Ticker" aria-label="Hash key" />
        <Button type="submit" variant="secondary">
          Search
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setLast(table.remove(key));
            setBook({ table, ops });
          }}
        >
          Delete
        </Button>
      </form>
      {last && (
        <p className="text-sm text-muted">
          {last.action} {last.key || "—"} → bucket {last.bucket}. Chain [{last.chain.join(" → ") || "empty"}].
          Collisions in bucket: {last.collisions}. {last.action !== "insert" && (last.found ? "Hit." : "Miss.")}
        </p>
      )}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {table.buckets.map((chain, i) => (
          <div
            key={i}
            className={cn(
              "min-h-24 rounded-[var(--radius-sm)] border p-2",
              last?.bucket === i ? "border-border-strong bg-card" : "border-border",
            )}
          >
            <p className="font-mono text-xs text-subtle">bucket {i}</p>
            <ul className="mt-1 space-y-1">
              {chain.map((row) => (
                <li key={row.symbol} className="font-mono text-xs">
                  {row.symbol}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="text-xs text-subtle">Hash: h = (h × 31 + char) mod 7. A chain longer than one name is a collision.</p>
    </div>
  );
}

function WalkView({ rows }: { rows: StockRow[] }) {
  const graph = useMemo(() => buildStockGraph(rows), [rows]);
  const [mode, setMode] = useState<"bfs" | "dfs">("bfs");
  const [start, setStart] = useState(rows[0]?.symbol ?? "AAPL");
  const frames = useMemo(() => {
    const fn = mode === "bfs" ? bfs : dfs;
    return fn(graph.adj, start.trim().toUpperCase());
  }, [graph, mode, start]);
  const player = usePlayer(frames.length, `${mode}:${start}:${rows.length}`);
  const frame: WalkFrame | undefined = frames[player.step];
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant={mode === "bfs" ? "default" : "secondary"} onClick={() => setMode("bfs")}>
          BFS
        </Button>
        <Button type="button" size="sm" variant={mode === "dfs" ? "default" : "secondary"} onClick={() => setMode("dfs")}>
          DFS
        </Button>
        <select
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="h-9 rounded-[var(--radius-xs)] border border-border bg-card px-2 font-mono text-sm"
          aria-label="Start symbol"
        >
          {graph.symbols.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <StepBar {...player} total={frames.length} />
      <GraphView
        symbols={graph.symbols}
        edges={graph.edges}
        seen={frame?.seen ?? []}
        current={frame?.current ?? null}
      />
      <p className="text-sm text-muted">
        {frame?.note ?? "Pick a start."} {mode === "bfs" ? "Queue" : "Stack"}: {frame?.bag.join(" ") || "—"}. Order:{" "}
        {frame?.order.join(" → ") || "—"}
      </p>
    </div>
  );
}

function MstView({ rows }: { rows: StockRow[] }) {
  const graph = useMemo(() => buildStockGraph(rows), [rows]);
  const frames = useMemo(() => kruskal(graph.symbols, graph.edges), [graph]);
  const player = usePlayer(frames.length, graph.symbols.join(","));
  const frame: MstFrame | undefined = frames[player.step];
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">
        Edge weight is the gap in today’s percent change. Same-sector pairs have no extra penalty. A different sector adds 1. Light edges are similar moves.
      </p>
      <StepBar {...player} total={frames.length} />
      <GraphView
        symbols={graph.symbols}
        edges={graph.edges}
        seen={frame ? [...new Set(frame.chosen.flatMap((e) => [e.a, e.b]))] : []}
        current={frame?.edge?.a ?? null}
        chosen={frame?.chosen}
        rejected={frame?.rejected}
      />
      <p className="text-sm text-muted">
        {frame?.note ?? "No edges."} Total weight {frame ? frame.total.toFixed(3) : "0"}. Green edges are in the tree. Red dashed edges were rejected.
      </p>
    </div>
  );
}

function SortView({ rows }: { rows: StockRow[] }) {
  const [name, setName] = useState<SortName>("quick");
  const [key, setKey] = useState<SortKey>("changePct");
  const frames = useMemo(() => sortFrames(rows, name, key), [rows, name, key]);
  const player = usePlayer(frames.length, `${name}:${key}:${rows.length}`);
  const frame = frames[player.step];
  const max = Math.max(...(frame?.values.map((v) => Math.abs(v.value)) ?? [1]), 1);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {(["bubble", "selection", "insertion", "merge", "quick", "heap"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setName(item)}
            className={cn(
              "h-9 rounded-full border px-3 text-xs capitalize",
              name === item ? "border-border-strong bg-card" : "border-border text-muted",
            )}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["price", "Price"],
            ["changePct", "Percent"],
            ["volume", "Volume"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setKey(id)}
            className={cn(
              "h-9 rounded-full border px-3 text-xs",
              key === id ? "border-border-strong bg-card" : "border-border text-muted",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <StepBar {...player} total={frames.length} />
      <p className="text-sm text-muted">
        {frame?.note}. Comparisons {frame?.comparisons ?? 0}. Moves {frame?.swaps ?? 0}. Market cap is not in this feed, so it is not a sort key.
      </p>
      <ul className="space-y-1">
        {frame?.values.map((item, i) => (
          <li key={`${item.symbol}-${i}`} className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-2">
            <span className="font-mono text-xs">{item.symbol}</span>
            <span className="h-2 rounded-full bg-border">
              <span
                className={cn("block h-2 rounded-full", frame.highlight.includes(i) ? "bg-accent" : "bg-chart")}
                style={{ width: `${Math.max(4, (Math.abs(item.value) / max) * 100)}%` }}
              />
            </span>
            <span className="font-mono text-xs text-muted tabular-nums">
              {key === "changePct" ? formatPct(item.value) : key === "volume" ? formatCompact(item.value) : formatNumber(item.value, 2)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TreeView({ rows }: { rows: StockRow[] }) {
  const [avl, setAvl] = useState(true);
  const [query, setQuery] = useState(rows[0]?.symbol ?? "AAPL");
  const built = useMemo(() => buildTree(rows, avl), [rows, avl]);
  const player = usePlayer(built.frames.length, `${avl}:${rows.length}`);
  const nodes = built.frames[player.step] ?? [];
  const path = searchTree(built.root, query.trim().toUpperCase());
  const width = Math.max(nodes.length, 1);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant={avl ? "default" : "secondary"} onClick={() => setAvl(true)}>
          AVL
        </Button>
        <Button type="button" size="sm" variant={!avl ? "default" : "secondary"} onClick={() => setAvl(false)}>
          BST
        </Button>
      </div>
      <StepBar {...player} total={built.frames.length} />
      <div className="relative h-56 overflow-x-auto">
        <div className="relative h-56" style={{ minWidth: `${width * 52}px` }}>
          {nodes.map((node) => (
            <div
              key={node.key}
              className={cn(
                "absolute w-12 -translate-x-1/2 rounded-[var(--radius-xs)] border px-1 py-1 text-center",
                path.includes(node.key) ? "border-border-strong bg-card" : "border-border bg-elevated",
              )}
              style={{ left: `${((node.x + 0.5) / width) * 100}%`, top: `${12 + node.depth * 52}px` }}
            >
              <p className="font-mono text-[10px]">{node.key}</p>
              <p className="font-mono text-[10px] text-subtle">{node.balance}</p>
            </div>
          ))}
        </div>
      </div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setQuery(query.trim().toUpperCase());
        }}
      >
        <Input value={query} onChange={(e) => setQuery(e.target.value.toUpperCase())} aria-label="Tree search" />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>
      <p className="text-sm text-muted">Path: {path.join(" → ") || "empty tree"}. The small number is the balance factor.</p>
    </div>
  );
}

function StackView({ history }: { history: string[] }) {
  const [stack, setStack] = useState(() => new Stack([...history].reverse()));
  const [symbol, setSymbol] = useState("");
  const [top, setTop] = useState<string | null>(history[0] ?? null);
  useEffect(() => {
    const next = new Stack([...history].reverse());
    setStack(next);
    setTop(next.peek());
  }, [history]);
  const items = stack.toArray();
  return (
    <div className="space-y-3">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const clean = symbol.trim().toUpperCase();
          if (!clean) return;
          stack.push(clean);
          setStack(new Stack([...stack.toArray()].reverse()));
          setTop(stack.peek());
          setSymbol("");
        }}
      >
        <Input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} placeholder="Push a ticker" aria-label="Push ticker" />
        <Button type="submit">Push</Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            stack.pop();
            setStack(new Stack([...stack.toArray()].reverse()));
            setTop(stack.peek());
          }}
        >
          Pop
        </Button>
      </form>
      <p className="text-sm text-muted">Peek: {top ?? "empty"}. Top of the stack is the latest view.</p>
      <ol className="space-y-1">
        {items.map((symbol, i) => (
          <li key={`${symbol}-${i}`} className="rounded-[var(--radius-sm)] border border-border px-3 py-2 font-mono text-sm">
            {i === 0 ? "top · " : ""}
            {symbol}
          </li>
        ))}
      </ol>
    </div>
  );
}

function QueueView({ symbols }: { symbols: string[] }) {
  const [queue, setQueue] = useState(() => {
    const q = new Queue<string>();
    for (const s of symbols.slice(0, 4)) q.enqueue(s);
    return q;
  });
  const [symbol, setSymbol] = useState("");
  const items = queue.toArray();
  return (
    <div className="space-y-3">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const clean = symbol.trim().toUpperCase();
          if (!clean) return;
          const next = new Queue<string>();
          for (const item of items) next.enqueue(item);
          next.enqueue(clean);
          setQueue(next);
          setSymbol("");
        }}
      >
        <Input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} placeholder="Enqueue analysis" aria-label="Enqueue ticker" />
        <Button type="submit">Enqueue</Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            const next = new Queue<string>();
            const rest = queue.toArray();
            rest.shift();
            for (const item of rest) next.enqueue(item);
            setQueue(next);
          }}
        >
          Dequeue
        </Button>
      </form>
      <p className="text-sm text-muted">Front: {queue.peek() ?? "empty"}. Oldest analysis request leaves first.</p>
      <ol className="flex gap-2 overflow-x-auto">
        {items.map((symbol, i) => (
          <li key={`${symbol}-${i}`} className="rounded-[var(--radius-sm)] border border-border px-3 py-2 font-mono text-sm">
            {i === 0 ? "front · " : ""}
            {symbol}
          </li>
        ))}
      </ol>
    </div>
  );
}
