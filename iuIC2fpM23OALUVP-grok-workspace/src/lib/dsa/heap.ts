export type HeapItem = {
  symbol: string;
  name: string;
  score: number;
  changePct: number;
  volume: number;
};

/** Max-heap. Higher score is dequeued first. */
export class MaxHeap {
  private a: HeapItem[] = [];

  static from(items: HeapItem[]) {
    const h = new MaxHeap();
    for (const item of items) h.insert(item);
    return h;
  }

  size() {
    return this.a.length;
  }

  peek(): HeapItem | null {
    return this.a[0] ?? null;
  }

  snapshot(): HeapItem[] {
    return this.a.map((x) => ({ ...x }));
  }

  insert(item: HeapItem) {
    this.a.push(item);
    this.siftUp(this.a.length - 1);
  }

  extract(): HeapItem | null {
    if (this.a.length === 0) return null;
    const top = this.a[0]!;
    const last = this.a.pop()!;
    if (this.a.length > 0) {
      this.a[0] = last;
      this.siftDown(0);
    }
    return top;
  }

  removeSymbol(symbol: string): boolean {
    const i = this.a.findIndex((x) => x.symbol === symbol);
    if (i < 0) return false;
    const last = this.a.pop()!;
    if (i < this.a.length) {
      this.a[i] = last;
      this.siftDown(i);
      this.siftUp(i);
    }
    return true;
  }

  private siftUp(i: number) {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.a[p]!.score >= this.a[i]!.score) break;
      this.swap(p, i);
      i = p;
    }
  }

  private siftDown(i: number) {
    const n = this.a.length;
    while (true) {
      let best = i;
      const l = i * 2 + 1;
      const r = l + 1;
      if (l < n && this.a[l]!.score > this.a[best]!.score) best = l;
      if (r < n && this.a[r]!.score > this.a[best]!.score) best = r;
      if (best === i) break;
      this.swap(i, best);
      i = best;
    }
  }

  private swap(i: number, j: number) {
    const t = this.a[i]!;
    this.a[i] = this.a[j]!;
    this.a[j] = t;
  }
}

/** Rank movers: large moves, heavy volume, and wide daily swings score higher. */
export function alertScore(changePct: number, volume: number) {
  const move = Math.abs(changePct);
  const vol = Math.log10(Math.max(volume, 1));
  return move * 70 + vol * 1.4 + move * vol * 4;
}
