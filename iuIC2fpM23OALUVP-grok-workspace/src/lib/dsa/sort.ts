import type { StockRow } from "./types";

export type SortKey = "price" | "changePct" | "volume";
export type SortName = "bubble" | "selection" | "insertion" | "merge" | "quick" | "heap";

export type SortFrame = {
  values: { symbol: string; value: number }[];
  highlight: number[];
  note: string;
  comparisons: number;
  swaps: number;
};

function keyOf(row: StockRow, key: SortKey) {
  if (key === "price") return row.price;
  if (key === "changePct") return row.changePct;
  return row.volume;
}

function snap(
  items: { symbol: string; value: number }[],
  highlight: number[],
  note: string,
  comparisons: number,
  swaps: number,
): SortFrame {
  return { values: items.map((x) => ({ ...x })), highlight, note, comparisons, swaps };
}

export function sortFrames(rows: StockRow[], name: SortName, key: SortKey): SortFrame[] {
  const items = rows.map((r) => ({ symbol: r.symbol, value: keyOf(r, key) }));
  if (name === "bubble") return bubble(items);
  if (name === "selection") return selection(items);
  if (name === "insertion") return insertion(items);
  if (name === "merge") return mergeSort(items);
  if (name === "quick") return quickSort(items);
  return heapSort(items);
}

function bubble(a: { symbol: string; value: number }[]) {
  const frames: SortFrame[] = [];
  let comparisons = 0;
  let swaps = 0;
  const n = a.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      comparisons += 1;
      if (a[j]!.value > a[j + 1]!.value) {
        const t = a[j]!;
        a[j] = a[j + 1]!;
        a[j + 1] = t;
        swaps += 1;
        frames.push(snap(a, [j, j + 1], `Swap ${a[j]!.symbol} and ${a[j + 1]!.symbol}`, comparisons, swaps));
      }
    }
  }
  frames.push(snap(a, [], "Sorted", comparisons, swaps));
  return frames;
}

function selection(a: { symbol: string; value: number }[]) {
  const frames: SortFrame[] = [];
  let comparisons = 0;
  let swaps = 0;
  for (let i = 0; i < a.length; i++) {
    let min = i;
    for (let j = i + 1; j < a.length; j++) {
      comparisons += 1;
      if (a[j]!.value < a[min]!.value) min = j;
    }
    if (min !== i) {
      const t = a[i]!;
      a[i] = a[min]!;
      a[min] = t;
      swaps += 1;
    }
    frames.push(snap(a, [i], `Place ${a[i]!.symbol}`, comparisons, swaps));
  }
  return frames;
}

function insertion(a: { symbol: string; value: number }[]) {
  const frames: SortFrame[] = [];
  let comparisons = 0;
  let swaps = 0;
  for (let i = 1; i < a.length; i++) {
    const cur = a[i]!;
    let j = i - 1;
    while (j >= 0) {
      comparisons += 1;
      if (a[j]!.value <= cur.value) break;
      a[j + 1] = a[j]!;
      swaps += 1;
      j -= 1;
    }
    a[j + 1] = cur;
    frames.push(snap(a, [j + 1], `Insert ${cur.symbol}`, comparisons, swaps));
  }
  if (!frames.length) frames.push(snap(a, [], "Sorted", 0, 0));
  return frames;
}

function mergeSort(source: { symbol: string; value: number }[]) {
  const frames: SortFrame[] = [];
  let comparisons = 0;
  const a = source.map((x) => ({ ...x }));
  function merge(lo: number, mid: number, hi: number) {
    const left = a.slice(lo, mid + 1);
    const right = a.slice(mid + 1, hi + 1);
    let i = 0;
    let j = 0;
    let k = lo;
    while (i < left.length && j < right.length) {
      comparisons += 1;
      if (left[i]!.value <= right[j]!.value) a[k++] = left[i++]!;
      else a[k++] = right[j++]!;
    }
    while (i < left.length) a[k++] = left[i++]!;
    while (j < right.length) a[k++] = right[j++]!;
    frames.push(snap(a, [lo, hi], `Merge ${lo}–${hi}`, comparisons, frames.length));
  }
  function rec(lo: number, hi: number) {
    if (lo >= hi) return;
    const mid = (lo + hi) >> 1;
    rec(lo, mid);
    rec(mid + 1, hi);
    merge(lo, mid, hi);
  }
  if (a.length) rec(0, a.length - 1);
  frames.push(snap(a, [], "Sorted", comparisons, frames.length));
  return frames;
}

function quickSort(source: { symbol: string; value: number }[]) {
  const frames: SortFrame[] = [];
  const a = source.map((x) => ({ ...x }));
  let comparisons = 0;
  let swaps = 0;
  function part(lo: number, hi: number) {
    const pivot = a[hi]!.value;
    let i = lo;
    for (let j = lo; j < hi; j++) {
      comparisons += 1;
      if (a[j]!.value <= pivot) {
        const t = a[i]!;
        a[i] = a[j]!;
        a[j] = t;
        swaps += 1;
        i += 1;
      }
    }
    const t = a[i]!;
    a[i] = a[hi]!;
    a[hi] = t;
    swaps += 1;
    frames.push(snap(a, [i], `Pivot ${a[i]!.symbol}`, comparisons, swaps));
    return i;
  }
  function rec(lo: number, hi: number) {
    if (lo >= hi) return;
    const p = part(lo, hi);
    rec(lo, p - 1);
    rec(p + 1, hi);
  }
  if (a.length) rec(0, a.length - 1);
  frames.push(snap(a, [], "Sorted", comparisons, swaps));
  return frames;
}

function heapSort(source: { symbol: string; value: number }[]) {
  const frames: SortFrame[] = [];
  const a = source.map((x) => ({ ...x }));
  let comparisons = 0;
  let swaps = 0;
  const n = a.length;
  function sift(size: number, i: number) {
    while (true) {
      let best = i;
      const l = i * 2 + 1;
      const r = l + 1;
      if (l < size) {
        comparisons += 1;
        if (a[l]!.value > a[best]!.value) best = l;
      }
      if (r < size) {
        comparisons += 1;
        if (a[r]!.value > a[best]!.value) best = r;
      }
      if (best === i) break;
      const t = a[i]!;
      a[i] = a[best]!;
      a[best] = t;
      swaps += 1;
      i = best;
    }
  }
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) sift(n, i);
  for (let end = n - 1; end > 0; end--) {
    const t = a[0]!;
    a[0] = a[end]!;
    a[end] = t;
    swaps += 1;
    sift(end, 0);
    frames.push(snap(a, [end], `Extract ${a[end]!.symbol}`, comparisons, swaps));
  }
  frames.push(snap(a, [], "Sorted", comparisons, swaps));
  return frames;
}
