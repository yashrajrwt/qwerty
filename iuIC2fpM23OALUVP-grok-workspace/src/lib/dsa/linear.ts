export class Stack<T> {
  private a: T[] = [];
  constructor(items: T[] = []) {
    this.a = [...items];
  }
  push(item: T) {
    this.a.push(item);
  }
  pop(): T | null {
    return this.a.pop() ?? null;
  }
  peek(): T | null {
    return this.a[this.a.length - 1] ?? null;
  }
  toArray() {
    return [...this.a].reverse();
  }
}

export class Queue<T> {
  private a: T[] = [];
  enqueue(item: T) {
    this.a.push(item);
  }
  dequeue(): T | null {
    return this.a.shift() ?? null;
  }
  peek(): T | null {
    return this.a[0] ?? null;
  }
  toArray() {
    return [...this.a];
  }
}
