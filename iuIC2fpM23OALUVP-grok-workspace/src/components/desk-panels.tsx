import { useQuery } from "@tanstack/react-query";
import {
  Cell,
  Line,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LineChart,
} from "recharts";
import { RotateCcw, ArrowDownRight, ArrowUpRight, Calculator, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BOARD,
  CHART_RANGES,
  fetchCharts,
  fetchForecast,
  fetchHeadlines,
  fetchMarketOverview,
  fetchPnL,
  fetchQuoteBundle,
  fetchWatchQuotes,
  type ChartRange,
  type NewsItem,
  type Quote,
} from "@/lib/market";
import { type PnLResult } from "@/lib/pnl";
import { useDesk, type PriceAlert } from "@/lib/store";
import { cn, formatCompact, formatMoney, formatNumber, formatPct } from "@/lib/utils";

export function Change({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-mono text-sm tabular-nums",
        up ? "text-gain" : "text-loss",
      )}
    >
      {up ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
      {formatPct(value)}
    </span>
  );
}

export function MarketStrip() {
  const overview = useQuery({
    queryKey: ["market-overview"],
    queryFn: () => fetchMarketOverview(),
    staleTime: 60_000,
  });
  if (!overview.data?.length) return null;
  const upCount = overview.data.filter((x) => x.change >= 0).length;
  return (
    <section className="nest-card rounded-[var(--radius-xl)] p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-mono text-[11px] tracking-[0.18em] text-subtle uppercase">Market overview</p>
        <p className="text-xs text-muted">
          {upCount >= 3 ? "Broadly higher" : upCount <= 1 ? "Broadly lower" : "Mixed tape"}
        </p>
      </div>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {overview.data.map((idx) => (
          <div
            key={idx.symbol}
            className="min-w-36 shrink-0 rounded-[var(--radius-md)] border border-border bg-elevated px-3 py-2.5 transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-border-strong"
          >
            <p className="text-xs text-subtle">{idx.label}</p>
            <p className="font-mono mt-1 text-sm tabular-nums">
              {formatNumber(idx.price, idx.price >= 1000 ? 0 : 2)}
            </p>
            <Change value={idx.changePct} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function MarketPanel({ onOpen }: { onOpen: (symbol: string) => void }) {
  const overview = useQuery({
    queryKey: ["market-overview"],
    queryFn: () => fetchMarketOverview(),
  });
  const board = useQuery({
    queryKey: ["board"],
    queryFn: () => fetchWatchQuotes({ data: { symbols: [...BOARD] } }),
    staleTime: 60_000,
  });
  if (overview.isLoading && board.isLoading) {
    return <p className="mt-6 text-sm text-muted">Reading the tape…</p>;
  }
  const rows = overview.data ?? [];
  const up = rows.filter((r) => r.change >= 0).length;
  const names = board.data ?? [];
  const gainers = [...names].sort((a, b) => b.changePct - a.changePct).slice(0, 5);
  const losers = [...names].sort((a, b) => a.changePct - b.changePct).slice(0, 5);
  const active = [...names].sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0)).slice(0, 5);
  return (
    <div className="mt-6 space-y-6">
      <p className="text-sm text-muted">
        {up} of {rows.length || "—"} major gauges are higher. VIX rising usually means
        more fear, not more reward. Movers are live quotes for a fixed liquid board, not a full-market scan.
      </p>
      <ul className="divide-y divide-border">
        {rows.map((row) => (
          <li key={row.symbol} className="flex min-h-16 items-center justify-between gap-3 py-3">
            <div>
              <p className="text-sm">{row.label}</p>
              <p className="font-mono text-xs text-subtle">{row.symbol}</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm tabular-nums">
                {formatNumber(row.price, row.price >= 1000 ? 0 : 2)}
              </p>
              <Change value={row.changePct} />
            </div>
          </li>
        ))}
      </ul>
      {board.isLoading && names.length === 0 && (
        <p className="text-sm text-muted">Ranking the board…</p>
      )}
      <div className="grid gap-4 lg:grid-cols-3">
        <MoverList title="Top gainers" rows={gainers} onOpen={onOpen} />
        <MoverList title="Top losers" rows={losers} onOpen={onOpen} />
        <MoverList title="Most active" rows={active} onOpen={onOpen} showVolume />
      </div>
    </div>
  );
}

function MoverList({
  title,
  rows,
  onOpen,
  showVolume,
}: {
  title: string;
  rows: Quote[];
  onOpen: (symbol: string) => void;
  showVolume?: boolean;
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-border bg-elevated p-3 transition-colors hover:border-border-strong">
      <p className="text-xs tracking-wide text-subtle uppercase">{title}</p>
      <ul className="mt-2 divide-y divide-border">
        {rows.map((row) => (
          <li key={row.symbol}>
            <button
              type="button"
              className="flex min-h-11 w-full items-center justify-between gap-2 py-2 text-left"
              onClick={() => onOpen(row.symbol)}
            >
              <span className="font-mono text-sm">{row.symbol}</span>
              <span className="text-right">
                {showVolume ? (
                  <span className="font-mono text-xs text-muted tabular-nums">
                    {formatCompact(row.volume ?? 0)}
                  </span>
                ) : (
                  <Change value={row.changePct} />
                )}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function WatchPanel({
  quotes,
  loading,
  onOpen,
}: {
  quotes: Quote[];
  loading: boolean;
  onOpen: (symbol: string) => void;
}) {
  const { watchlist, removeWatch } = useDesk();
  if (watchlist.length === 0) {
    return (
      <p className="mt-6 text-sm text-subtle">
        Save a ticker from the quote bar. It stays on this device.
      </p>
    );
  }
  return (
    <div className="mt-6">
      {loading && quotes.length === 0 && (
        <p className="mb-3 text-sm text-muted">Refreshing saved names…</p>
      )}
      <ul className="divide-y divide-border">
        {watchlist.map((s) => {
          const row = quotes.find((q) => q.symbol === s);
          return (
            <li key={s} className="flex min-h-14 items-center justify-between gap-3 py-2">
              <button type="button" className="min-w-0 flex-1 text-left" onClick={() => onOpen(s)}>
                <p className="font-mono text-sm">{s}</p>
                <p className="truncate text-xs text-muted">{row?.name ?? "—"}</p>
              </button>
              {row && (
                <div className="text-right">
                  <p className="font-mono text-sm tabular-nums">
                    {formatMoney(row.price, row.currency)}
                  </p>
                  <Change value={row.changePct} />
                </div>
              )}
              <button
                type="button"
                className="grid size-11 place-items-center text-subtle hover:text-foreground"
                onClick={() => removeWatch(s)}
                aria-label={`Remove ${s}`}
              >
                <X className="size-4" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function PortfolioPanel({
  quotes,
  currentSymbol,
}: {
  quotes: Quote[];
  currentSymbol: string;
}) {
  const { portfolio, addHolding, removeHolding } = useDesk();
  const [symbol, setSymbol] = useState(currentSymbol);
  const [qty, setQty] = useState("1");
  const [cost, setCost] = useState("");

  const rows = portfolio.map((h) => {
    const q = quotes.find((x) => x.symbol === h.symbol);
    const price = q?.price ?? 0;
    const value = h.quantity * price;
    const basis = h.quantity * h.cost;
    return { ...h, name: q?.name, price, value, basis, pnl: value - basis, currency: q?.currency ?? "USD" };
  });
  const totalValue = rows.reduce((s, r) => s + r.value, 0);
  const totalBasis = rows.reduce((s, r) => s + r.basis, 0);
  const totalPnl = totalValue - totalBasis;

  return (
    <div className="mt-6 space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard label="Market value" value={formatMoney(totalValue)} />
        <SummaryCard label="Cost basis" value={formatMoney(totalBasis)} />
        <div className="rounded-[var(--radius-md)] bg-elevated p-4">
          <p className="text-xs tracking-wide text-subtle uppercase">Unrealized</p>
          <p
            className={cn(
              "font-mono mt-2 text-2xl tabular-nums",
              totalPnl >= 0 ? "text-gain" : "text-loss",
            )}
          >
            {formatMoney(totalPnl)}
          </p>
          <p className="mt-1 text-sm text-muted">
            {totalBasis ? formatPct(totalPnl / totalBasis) : "—"}
          </p>
        </div>
      </div>

      {rows.some((r) => r.value > 0) && (
        <div className="grid items-center gap-4 sm:grid-cols-[12rem_1fr]">
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rows.filter((r) => r.value > 0)}
                  dataKey="value"
                  nameKey="symbol"
                  innerRadius={42}
                  outerRadius={68}
                  paddingAngle={2}
                  isAnimationActive={false}
                >
                  {rows
                    .filter((r) => r.value > 0)
                    .map((row, i) => (
                      <Cell key={row.id} fill={SERIES[i % SERIES.length]} />
                    ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [formatMoney(Number(value)), String(name)]}
                  contentStyle={{
                    background: "var(--color-elevated)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "var(--color-foreground)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="space-y-1 text-sm">
            {rows
              .filter((r) => r.value > 0)
              .map((row, i) => (
                <li key={row.id} className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="size-2 rounded-full"
                      style={{ background: SERIES[i % SERIES.length] }}
                    />
                    <span className="font-mono">{row.symbol}</span>
                  </span>
                  <span className="font-mono text-xs text-muted tabular-nums">
                    {totalValue ? formatPct(row.value / totalValue, 1) : "—"}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      )}

      <form
        className="grid gap-2 sm:grid-cols-4"
        onSubmit={(e) => {
          e.preventDefault();
          const quantity = Number(qty);
          const buy = Number(cost);
          if (!Number.isFinite(quantity) || !Number.isFinite(buy)) {
            toast.message("Enter quantity and purchase price.");
            return;
          }
          addHolding({ symbol, quantity, cost: buy });
          toast.message(`Booked ${symbol}`);
          setQty("1");
          setCost("");
        }}
      >
        <Input
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="Ticker"
          aria-label="Holding ticker"
        />
        <Input
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          placeholder="Shares"
          inputMode="decimal"
          aria-label="Quantity"
        />
        <Input
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          placeholder="Buy price"
          inputMode="decimal"
          aria-label="Purchase price"
        />
        <Button type="submit">
          <Plus className="size-4" />
          Add lot
        </Button>
      </form>

      {rows.length === 0 ? (
        <p className="text-sm text-subtle">
          Enter a ticker, share count, and what you paid. Values update from live quotes.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {rows.map((row) => (
            <li key={row.id} className="flex min-h-16 items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="font-mono text-sm">{row.symbol}</p>
                <p className="text-xs text-muted">
                  {formatNumber(row.quantity, 2)} × {formatMoney(row.cost, row.currency)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm tabular-nums">
                  {formatMoney(row.value, row.currency)}
                </p>
                <p
                  className={cn(
                    "font-mono text-xs tabular-nums",
                    row.pnl >= 0 ? "text-gain" : "text-loss",
                  )}
                >
                  {formatMoney(row.pnl, row.currency)}{" "}
                  {row.basis ? formatPct(row.pnl / row.basis) : ""}
                </p>
              </div>
              <button
                type="button"
                className="grid size-11 place-items-center text-subtle hover:text-foreground"
                onClick={() => removeHolding(row.id)}
                aria-label={`Remove ${row.symbol}`}
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] bg-elevated p-4">
      <p className="text-xs tracking-wide text-subtle uppercase">{label}</p>
      <p className="font-mono mt-2 text-2xl tabular-nums">{value}</p>
    </div>
  );
}

export function PnLPanel({
  currentSymbol,
  onOpen,
}: {
  currentSymbol: string;
  onOpen: (symbol: string) => void;
}) {
  const [symbol, setSymbol] = useState(currentSymbol);
  const [qty, setQty] = useState("10");
  const [buy, setBuy] = useState("");
  const [target, setTarget] = useState("");
  const [horizon, setHorizon] = useState(7);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    name: string;
    currency: string;
    currentPrice: number;
    projectedPrice: number;
    direction: string;
    confidence: number;
    days: number;
    pnl: PnLResult;
  } | null>(null);

  useEffect(() => {
    setSymbol(currentSymbol);
  }, [currentSymbol]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const clean = symbol.trim().toUpperCase();
    const quantity = Number(qty);
    const buyPrice = Number(buy);
    const targetPrice = target.trim() ? Number(target) : null;
    if (!clean || !Number.isFinite(quantity) || quantity <= 0) {
      toast.message("Enter a ticker and a share count.");
      return;
    }
    if (!Number.isFinite(buyPrice) || buyPrice < 0) {
      toast.message("Enter the price you paid, or will pay, per share.");
      return;
    }
    if (targetPrice != null && (!Number.isFinite(targetPrice) || targetPrice <= 0)) {
      toast.message("Target price must be a positive number.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const bundle = await fetchQuoteBundle({ data: { symbol: clean } });
      const forecast = await fetchForecast({ data: { candles: bundle.candles, horizon } });
      if (!forecast) throw new Error("Not enough price history to forecast that stock.");
      const projected =
        forecast.path.find((p) => p.day === horizon)?.price ??
        forecast.path.at(-1)?.price ??
        bundle.quote.price;
      const pnl = await fetchPnL({
        data: {
          quantity,
          buyPrice,
          currentPrice: bundle.quote.price,
          projectedPrice: projected,
          targetPrice,
        },
      });
      if (!pnl) throw new Error("Could not compute profit and loss.");
      setSymbol(clean);
      onOpen(clean);
      setResult({
        name: bundle.quote.name,
        currency: bundle.quote.currency,
        currentPrice: bundle.quote.price,
        projectedPrice: projected,
        direction: forecast.direction,
        confidence: forecast.confidence,
        days: horizon,
        pnl,
      });
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Could not load that stock.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 space-y-5">
      <div>
        <p className="font-display text-lg tracking-tight">Profit and loss</p>
        <p className="mt-1 max-w-prose text-sm text-muted">
          Pick a stock and enter the lot: shares and the price you paid. The desk
          prices the lot at the live quote, then at the technical forecast for the
          horizon you choose.
        </p>
      </div>

      <form className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6" onSubmit={onSubmit}>
        <Input
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="Ticker"
          aria-label="Profit and loss ticker"
          className="lg:col-span-1"
        />
        <Input
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          placeholder="Shares"
          inputMode="decimal"
          aria-label="Share count"
        />
        <Input
          value={buy}
          onChange={(e) => setBuy(e.target.value)}
          placeholder="Buy price"
          inputMode="decimal"
          aria-label="Buy price"
        />
        <Input
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="Target (optional)"
          inputMode="decimal"
          aria-label="Target price"
        />
        <label className="flex h-11 items-center gap-2 rounded-[var(--radius-sm)] border border-border bg-elevated px-3 text-sm text-muted">
          <span className="shrink-0">Days</span>
          <input
            type="number"
            min={1}
            max={20}
            value={horizon}
            onChange={(e) => setHorizon(Math.min(20, Math.max(1, Number(e.target.value) || 1)))}
            className="w-full bg-transparent font-mono text-foreground outline-none"
            aria-label="Forecast horizon in days"
          />
        </label>
        <Button type="submit" disabled={busy}>
          <Calculator className="size-4" />
          {busy ? "Working" : "Calculate"}
        </Button>
      </form>

      {error && <p className="text-sm text-loss">{error}</p>}

      {!result && !error && (
        <p className="text-sm text-subtle">
          Example: AAPL, 10 shares, buy price 180. Leave target blank to use only the forecast.
        </p>
      )}

      {result && (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            <span className="font-mono text-foreground">{symbol}</span> · {result.name}. Live{" "}
            {formatMoney(result.currentPrice, result.currency)}. Forecast in {result.days}{" "}
            session{result.days === 1 ? "" : "s"} is{" "}
            {formatMoney(result.projectedPrice, result.currency)} ({result.direction},{" "}
            {Math.round(result.confidence * 100)}% confidence).
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryCard label="Cost" value={formatMoney(result.pnl.cost, result.currency)} />
            <PnLCard
              label="If sold now"
              money={formatMoney(result.pnl.currentPnl, result.currency)}
              extra={`${formatPct(result.pnl.currentPct)} · ${formatMoney(result.pnl.perShareNow, result.currency)} / share`}
              positive={result.pnl.currentPnl >= 0}
            />
            <PnLCard
              label={`Forecast, ${result.days}d`}
              money={formatMoney(result.pnl.projectedPnl, result.currency)}
              extra={`${formatPct(result.pnl.projectedPct)} · ${formatMoney(result.pnl.perShareProjected, result.currency)} / share`}
              positive={result.pnl.projectedPnl >= 0}
            />
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <StatLine label="Value now" value={formatMoney(result.pnl.currentValue, result.currency)} />
            <StatLine
              label="Forecast value"
              value={formatMoney(result.pnl.projectedValue, result.currency)}
            />
            <StatLine label="Break-even" value={formatMoney(result.pnl.breakEven, result.currency)} />
            {result.pnl.targetPnl != null ? (
              <StatLine
                label="At your target"
                value={`${formatMoney(result.pnl.targetPnl, result.currency)} (${formatPct(result.pnl.targetPct ?? 0)})`}
                tone={result.pnl.targetPnl >= 0 ? "gain" : "loss"}
              />
            ) : (
              <StatLine label="At your target" value="—" />
            )}
          </dl>

          <p className="text-xs text-subtle">
            A statistical sketch from the same indicator ensemble as Predict. Not a guarantee and not investment advice.
          </p>
        </div>
      )}
    </div>
  );
}

function PnLCard({
  label,
  money,
  extra,
  positive,
}: {
  label: string;
  money: string;
  extra: string;
  positive: boolean;
}) {
  return (
    <div className="rounded-[var(--radius-md)] bg-elevated p-4">
      <p className="text-xs tracking-wide text-subtle uppercase">{label}</p>
      <p className={cn("font-mono mt-2 text-2xl tabular-nums", positive ? "text-gain" : "text-loss")}>
        {money}
      </p>
      <p className="mt-1 font-mono text-sm text-muted tabular-nums">{extra}</p>
    </div>
  );
}

function StatLine({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "gain" | "loss";
}) {
  return (
    <div>
      <dt className="text-xs tracking-wide text-subtle uppercase">{label}</dt>
      <dd
        className={cn(
          "font-mono mt-1 tabular-nums",
          tone === "gain" && "text-gain",
          tone === "loss" && "text-loss",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

const SERIES = ["var(--color-series-a)", "var(--color-series-b)", "var(--color-series-c)"];

export function ComparePanel({ seed }: { seed: string }) {
  const [tickers, setTickers] = useState<string[]>(() => {
    const base = seed.toUpperCase();
    return base === "MSFT" ? ["MSFT", "AAPL"] : [base, "MSFT"];
  });
  const [draft, setDraft] = useState("");
  const [range, setRange] = useState<ChartRange>("3M");

  const charts = useQuery({
    queryKey: ["compare", tickers.join(","), range],
    queryFn: () => fetchCharts({ data: { symbols: tickers, range } }),
    enabled: tickers.length >= 1,
  });

  const series = useMemo(() => {
    const rows = charts.data ?? [];
    if (!rows.length) return [];
    const maps = rows.map((r) => {
      const first = r.candles.find((c) => c.c > 0)?.c ?? 1;
      return {
        symbol: r.quote.symbol,
        quote: r.quote,
        byT: new Map(r.candles.map((c) => [c.t, (c.c / first - 1) * 100])),
      };
    });
    const times = [...new Set(rows.flatMap((r) => r.candles.map((c) => c.t)))].sort(
      (a, b) => a - b,
    );
    return times.map((t) => {
      const point: Record<string, number> = { t };
      for (const m of maps) {
        const v = m.byT.get(t);
        if (v != null) point[m.symbol] = v;
      }
      return point;
    });
  }, [charts.data]);

  function addTicker() {
    const next = draft.trim().toUpperCase();
    if (!next) return;
    setTickers((list) => (list.includes(next) ? list : [...list, next].slice(0, 3)));
    setDraft("");
  }

  return (
    <div className="mt-6 space-y-4">
      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          addTicker();
        }}
      >
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a ticker to compare"
          aria-label="Compare ticker"
        />
        <Button type="submit">Compare</Button>
      </form>
      <div className="flex flex-wrap gap-1.5">
        {tickers.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => setTickers((list) => list.filter((x) => x !== s))}
            className="inline-flex h-8 items-center gap-2 rounded-full border border-border px-3 font-mono text-xs"
          >
            <span
              className="size-2 rounded-full"
              style={{ background: SERIES[i % SERIES.length] }}
            />
            {s}
            <X className="size-3" />
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {CHART_RANGES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRange(r)}
            className={cn(
              "h-8 rounded-full border px-3 font-mono text-xs",
              range === r
                ? "border-border-strong bg-elevated text-foreground"
                : "border-border text-muted hover:text-foreground",
            )}
          >
            {r}
          </button>
        ))}
      </div>
      <div className="h-64 sm:h-80">
        {charts.isLoading ? (
          <p className="text-sm text-muted">Overlaying paths…</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-grid)" vertical={false} />
              <XAxis
                dataKey="t"
                tickFormatter={(v) =>
                  new Date(Number(v)).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }
                tick={{ fill: "var(--color-subtle)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                minTickGap={28}
              />
              <YAxis
                tickFormatter={(v) => `${Number(v).toFixed(0)}%`}
                tick={{ fill: "var(--color-subtle)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={44}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-elevated)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "var(--color-foreground)",
                }}
                formatter={(value, name) => [`${Number(value).toFixed(2)}%`, String(name)]}
                labelFormatter={(v) =>
                  new Date(Number(v)).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                }
              />
              {tickers.map((s, i) => (
                <Line
                  key={s}
                  type="monotone"
                  dataKey={s}
                  stroke={SERIES[i % SERIES.length]}
                  strokeWidth={1.7}
                  dot={false}
                  connectNulls
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs tracking-wide text-subtle uppercase">
            <tr>
              <th className="pb-2 font-medium">Name</th>
              <th className="pb-2 font-medium">Price</th>
              <th className="pb-2 font-medium">Day</th>
              <th className="pb-2 font-medium">Volume</th>
              <th className="pb-2 font-medium">52w</th>
            </tr>
          </thead>
          <tbody>
            {(charts.data ?? []).map((row) => (
              <tr key={row.quote.symbol} className="border-t border-border">
                <td className="py-2.5 pr-3">
                  <p className="font-mono text-sm">{row.quote.symbol}</p>
                  <p className="text-xs text-muted">{row.quote.name}</p>
                </td>
                <td className="font-mono py-2.5 pr-3 tabular-nums">
                  {formatMoney(row.quote.price, row.quote.currency)}
                </td>
                <td className="py-2.5 pr-3">
                  <Change value={row.quote.changePct} />
                </td>
                <td className="font-mono py-2.5 pr-3 tabular-nums">
                  {formatCompact(row.quote.volume ?? 0)}
                </td>
                <td className="font-mono py-2.5 text-xs tabular-nums text-muted">
                  {formatMoney(row.quote.low52 ?? 0, row.quote.currency)} –{" "}
                  {formatMoney(row.quote.high52 ?? 0, row.quote.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AlertsPanel({
  currentSymbol,
  currentPrice,
}: {
  currentSymbol: string;
  currentPrice: number | null;
}) {
  const { alerts, addAlert, removeAlert, resetAlert } = useDesk();
  const [symbol, setSymbol] = useState(currentSymbol);
  const [target, setTarget] = useState("");
  const [op, setOp] = useState<"above" | "below">("above");

  return (
    <div className="mt-6 space-y-5">
      <p className="text-sm text-muted">
        When a live quote crosses your level, NestInvest toasts on this device.
        {currentPrice != null ? ` ${currentSymbol} is ${formatMoney(currentPrice)}.` : ""}
      </p>
      <form
        className="grid gap-2 sm:grid-cols-4"
        onSubmit={(e) => {
          e.preventDefault();
          const price = Number(target);
          addAlert({ symbol, op, target: price });
          toast.message(`${symbol} alert set ${op} ${formatMoney(price)}`);
          setTarget("");
        }}
      >
        <Input
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="Ticker"
          aria-label="Alert ticker"
        />
        <div className="grid grid-cols-2 gap-1">
          <Button
            type="button"
            variant={op === "above" ? "default" : "secondary"}
            onClick={() => setOp("above")}
          >
            Above
          </Button>
          <Button
            type="button"
            variant={op === "below" ? "default" : "secondary"}
            onClick={() => setOp("below")}
          >
            Below
          </Button>
        </div>
        <Input
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="Target price"
          inputMode="decimal"
          aria-label="Target price"
        />
        <Button type="submit">
          <Plus className="size-4" />
          Watch level
        </Button>
      </form>
      {alerts.length === 0 ? (
        <p className="text-sm text-subtle">No price levels yet.</p>
      ) : (
        <ul className="divide-y divide-border">
          {alerts.map((a: PriceAlert) => (
            <li key={a.id} className="flex min-h-14 items-center justify-between gap-3 py-2">
              <div>
                <p className="font-mono text-sm">
                  {a.symbol} {a.op} {formatMoney(a.target)}
                </p>
                <p className="text-xs text-muted">
                  {a.triggeredAt
                    ? `Hit ${new Date(a.triggeredAt).toLocaleString()}`
                    : "Armed"}
                </p>
              </div>
              <div className="flex items-center">
                {a.triggeredAt && (
                  <button
                    type="button"
                    className="grid size-11 place-items-center text-subtle hover:text-foreground"
                    onClick={() => resetAlert(a.id)}
                    aria-label="Reset alert"
                  >
                    <RotateCcw className="size-4" />
                  </button>
                )}
                <button
                  type="button"
                  className="grid size-11 place-items-center text-subtle hover:text-foreground"
                  onClick={() => removeAlert(a.id)}
                  aria-label="Remove alert"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function NewsCards({
  items,
  loading,
  empty = "No recent headlines for this query.",
}: {
  items: NewsItem[];
  loading: boolean;
  empty?: string;
}) {
  const [source, setSource] = useState("All");
  const sources = ["All", ...new Set(items.map((n) => n.publisher).filter(Boolean))];
  const shown = source === "All" ? items : items.filter((n) => n.publisher === source);
  if (loading && items.length === 0) {
    return <p className="mt-6 text-sm text-muted">Fetching headlines…</p>;
  }
  if (items.length === 0) {
    return <p className="mt-6 text-sm text-subtle">{empty}</p>;
  }
  return (
    <div className="mt-6 space-y-4">
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {sources.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSource(s)}
            className={cn(
              "h-9 shrink-0 rounded-full border px-3 text-xs",
              source === s
                ? "border-border-strong bg-elevated text-foreground"
                : "border-border text-muted hover:text-foreground",
            )}
          >
            {s}
          </button>
        ))}
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {shown.map((n) => (
          <li key={n.id}>
            <a
              href={n.url}
              target="_blank"
              rel="noreferrer"
              className="flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-elevated hover:border-border-strong"
            >
              {n.thumbnail ? (
                <img src={n.thumbnail} alt="" className="h-36 w-full object-cover" />
              ) : (
                <div className="grid h-28 place-items-center bg-card text-xs tracking-[0.18em] text-subtle uppercase">
                  {n.publisher}
                </div>
              )}
              <div className="flex flex-1 flex-col p-4">
                <p className="text-xs text-subtle">
                  {n.publisher}
                  {n.published ? ` · ${new Date(n.published).toLocaleDateString()}` : ""}
                </p>
                <p className="mt-2 text-sm leading-snug">{n.title}</p>
                <p className="mt-auto pt-3 text-xs text-muted">Open source</p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LatestNewsPanel() {
  const headlines = useQuery({
    queryKey: ["headlines"],
    queryFn: () => fetchHeadlines(),
    staleTime: 60_000,
  });
  const [shown, setShown] = useState(10);
  const items = headlines.data?.news ?? [];
  const visible = items.slice(0, Math.max(10, shown));
  return (
    <div>
      <p className="mt-6 text-sm text-muted">
        Latest headlines across the market, not one ticker. The first ten are shown.
      </p>
      <NewsCards
        items={visible}
        loading={headlines.isFetching}
        empty="No market headlines came back. Try again in a moment."
      />
      {items.length > visible.length && (
        <div className="mt-4">
          <Button type="button" variant="secondary" onClick={() => setShown((n) => n + 10)}>
            More
          </Button>
        </div>
      )}
    </div>
  );
}


