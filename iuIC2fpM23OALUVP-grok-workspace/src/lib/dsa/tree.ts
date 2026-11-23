import type { StockRow } from "./types";

export type TreeNode = {
  key: string;
  left: TreeNode | null;
  right: TreeNode | null;
  height: number;
};

export type TreeView = {
  key: string;
  depth: number;
  x: number;
  balance: number;
  parent: string | null;
};

function height(n: TreeNode | null) {
  return n ? n.height : 0;
}

function balanceOf(n: TreeNode | null) {
  return n ? height(n.left) - height(n.right) : 0;
}

function refresh(n: TreeNode) {
  n.height = 1 + Math.max(height(n.left), height(n.right));
}

function rotateRight(y: TreeNode): TreeNode {
  const x = y.left!;
  y.left = x.right;
  x.right = y;
  refresh(y);
  refresh(x);
  return x;
}

function rotateLeft(x: TreeNode): TreeNode {
  const y = x.right!;
  x.right = y.left;
  y.left = x;
  refresh(x);
  refresh(y);
  return y;
}

function balance(n: TreeNode, avl: boolean): TreeNode {
  refresh(n);
  if (!avl) return n;
  const b = balanceOf(n);
  if (b > 1) {
    if (balanceOf(n.left) < 0 && n.left) n.left = rotateLeft(n.left);
    return rotateRight(n);
  }
  if (b < -1) {
    if (balanceOf(n.right) > 0 && n.right) n.right = rotateRight(n.right);
    return rotateLeft(n);
  }
  return n;
}

export function insertTree(node: TreeNode | null, row: StockRow, avl: boolean): TreeNode {
  if (!node) return { key: row.symbol, left: null, right: null, height: 1 };
  if (row.symbol < node.key) node.left = insertTree(node.left, row, avl);
  else if (row.symbol > node.key) node.right = insertTree(node.right, row, avl);
  return balance(node, avl);
}

export function searchTree(node: TreeNode | null, key: string): string[] {
  const path: string[] = [];
  let cur = node;
  while (cur) {
    path.push(cur.key);
    if (key === cur.key) break;
    cur = key < cur.key ? cur.left : cur.right;
  }
  return path;
}

export function layoutTree(root: TreeNode | null): TreeView[] {
  const out: TreeView[] = [];
  let x = 0;
  function walk(n: TreeNode | null, depth: number, parent: string | null) {
    if (!n) return;
    walk(n.left, depth + 1, n.key);
    out.push({ key: n.key, depth, x, balance: balanceOf(n), parent });
    x += 1;
    walk(n.right, depth + 1, n.key);
  }
  walk(root, 0, null);
  return out;
}

export function buildTree(rows: StockRow[], avl: boolean) {
  const frames: TreeView[][] = [];
  let root: TreeNode | null = null;
  const ordered = [...rows].sort((a, b) => a.symbol.localeCompare(b.symbol));
  for (const row of ordered) {
    root = insertTree(root, row, avl);
    frames.push(layoutTree(root));
  }
  return { root, frames };
}
