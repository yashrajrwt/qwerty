import { create } from "zustand";
import { persist } from "zustand/middleware";

const DEFAULT_WATCH = ["AAPL", "MSFT", "NVDA", "TSLA"];

export type ThemeMode = "dark" | "light";

export type Holding = {
  id: string;
  symbol: string;
  quantity: number;
  cost: number;
};

export type PriceAlert = {
  id: string;
  symbol: string;
  op: "above" | "below";
  target: number;
  triggeredAt: number | null;
};

type DeskState = {
  symbol: string;
  watchlist: string[];
  history: string[];
  theme: ThemeMode;
  portfolio: Holding[];
  alerts: PriceAlert[];
  setSymbol: (symbol: string) => void;
  addWatch: (symbol: string) => void;
  removeWatch: (symbol: string) => void;
  recordHistory: (symbol: string) => void;
  clearHistory: () => void;
  setTheme: (theme: ThemeMode) => void;
  addHolding: (holding: Omit<Holding, "id">) => void;
  removeHolding: (id: string) => void;
  addAlert: (alert: Omit<PriceAlert, "id" | "triggeredAt">) => void;
  removeAlert: (id: string) => void;
  markAlert: (id: string) => void;
  resetAlert: (id: string) => void;
};

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useDesk = create<DeskState>()(
  persist(
    (set, get) => ({
      symbol: "AAPL",
      watchlist: DEFAULT_WATCH,
      history: [],
      theme: "dark",
      portfolio: [],
      alerts: [],
      setSymbol: (symbol) => {
        const next = symbol.trim().toUpperCase();
        if (!next) return;
        set({ symbol: next });
        get().recordHistory(next);
      },
      addWatch: (symbol) => {
        const next = symbol.trim().toUpperCase();
        if (!next) return;
        set((s) => ({
          watchlist: s.watchlist.includes(next)
            ? s.watchlist
            : [next, ...s.watchlist].slice(0, 24),
        }));
      },
      removeWatch: (symbol) =>
        set((s) => ({
          watchlist: s.watchlist.filter((x) => x !== symbol),
        })),
      recordHistory: (symbol) =>
        set((s) => ({
          history: [symbol, ...s.history.filter((x) => x !== symbol)].slice(0, 30),
        })),
      clearHistory: () => set({ history: [] }),
      setTheme: (theme) => set({ theme }),
      addHolding: (holding) => {
        const symbol = holding.symbol.trim().toUpperCase();
        if (!symbol || holding.quantity <= 0 || holding.cost < 0) return;
        set((s) => ({
          portfolio: [
            { id: uid(), symbol, quantity: holding.quantity, cost: holding.cost },
            ...s.portfolio,
          ].slice(0, 40),
        }));
        get().addWatch(symbol);
      },
      removeHolding: (id) =>
        set((s) => ({ portfolio: s.portfolio.filter((h) => h.id !== id) })),
      addAlert: (alert) => {
        const symbol = alert.symbol.trim().toUpperCase();
        if (!symbol || !Number.isFinite(alert.target) || alert.target <= 0) return;
        set((s) => ({
          alerts: [
            { id: uid(), symbol, op: alert.op, target: alert.target, triggeredAt: null },
            ...s.alerts,
          ].slice(0, 40),
        }));
      },
      removeAlert: (id) => set((s) => ({ alerts: s.alerts.filter((a) => a.id !== id) })),
      markAlert: (id) =>
        set((s) => ({
          alerts: s.alerts.map((a) =>
            a.id === id && !a.triggeredAt ? { ...a, triggeredAt: Date.now() } : a,
          ),
        })),
      resetAlert: (id) =>
        set((s) => ({
          alerts: s.alerts.map((a) => (a.id === id ? { ...a, triggeredAt: null } : a)),
        })),
    }),
    {
      name: "nestinvest-desk",
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<DeskState>;
        return {
          ...current,
          ...p,
          watchlist: p.watchlist?.length ? p.watchlist : current.watchlist,
          history: p.history ?? [],
          theme: p.theme === "light" ? "light" : "dark",
          portfolio: p.portfolio ?? [],
          alerts: p.alerts ?? [],
        };
      },
    },
  ),
);
