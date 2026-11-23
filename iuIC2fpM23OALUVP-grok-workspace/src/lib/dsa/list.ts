export type Tx = {
  id: string;
  name: string;
  symbol: string;
  type: "buy" | "sell";
  quantity: number;
  price: number;
  at: number;
};

type Node = { tx: Tx; next: Node | null };

/** Singly linked list of trades, kept in chronological order. */
export class TxList {
  head: Node | null = null;

  static from(items: Tx[]) {
    const list = new TxList();
    for (const tx of items) list.insert(tx);
    return list;
  }

  insert(tx: Tx) {
    const node: Node = { tx, next: null };
    if (!this.head || tx.at < this.head.tx.at) {
      node.next = this.head;
      this.head = node;
      return;
    }
    let cur = this.head;
    while (cur.next && cur.next.tx.at <= tx.at) cur = cur.next;
    node.next = cur.next;
    cur.next = node;
  }

  remove(id: string): boolean {
    if (!this.head) return false;
    if (this.head.tx.id === id) {
      this.head = this.head.next;
      return true;
    }
    let cur = this.head;
    while (cur.next && cur.next.tx.id !== id) cur = cur.next;
    if (!cur.next) return false;
    cur.next = cur.next.next;
    return true;
  }

  find(query: string): Tx | null {
    const q = query.trim().toUpperCase();
    let cur = this.head;
    while (cur) {
      if (cur.tx.symbol === q || cur.tx.name.toUpperCase().includes(q)) return cur.tx;
      cur = cur.next;
    }
    return null;
  }

  toArray(): Tx[] {
    const out: Tx[] = [];
    let cur = this.head;
    while (cur) {
      out.push(cur.tx);
      cur = cur.next;
    }
    return out;
  }
}
