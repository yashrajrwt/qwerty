import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  Bookmark,
  BookmarkCheck,
  Building2,
  Calculator,
  Clock3,
  Cpu,
  Globe,
  LineChart,
  Moon,
  Newspaper,
  PanelLeft,
  Rss,
  Scale,
  Search,
  FileText,
  Sun,
  Trash2,
  Users,
  Waypoints,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast, Toaster } from "sonner";
import { PriceChart, type ChartStyle } from "@/components/price-chart";
import {
  AlertsPanel,
  ComparePanel,
  MarketPanel,
  MarketStrip,
  NewsCards,
  LatestNewsPanel,
  PnLPanel,
  PortfolioPanel,
  WatchPanel,
} from "@/components/desk-panels";
import { DsaPanel } from "@/components/dsa-panel";
import { CppEnginePanel } from "@/components/cpp-engine-panel";
import { ContributionsPanel } from "@/components/contributions-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CHART_RANGES,
  explainForecast,
  fetchChart,
  fetchForecast,
  fetchProfile,
  fetchQuoteBundle,
  fetchWatchQuotes,
  searchTickers,
  type ChartRange,
} from "@/lib/market";
import { forecastSeries } from "@/lib/predict";
import { useDesk } from "@/lib/store";
import { TEAM as MEMBERS } from "@/lib/team";
import { cn, formatCompact, formatMoney, formatNumber, formatPct } from "@/lib/utils";

type Tab =
  | "quote"
  | "market"
  | "watch"
  | "portfolio"
  | "pnl"
  | "compare"
  | "news"
  | "latest"
  | "predict"
  | "alerts"
  | "profile"
  | "history"
  | "dsa"
  | "cpp"
  | "team";

const TABS: { id: Tab; label: string; icon: typeof LineChart }[] = [
  { id: "quote", label: "Dashboard", icon: Activity },
  { id: "market", label: "Stock Market", icon: Globe },
  { id: "predict", label: "Stock Analysis", icon: LineChart },
  { id: "watch", label: "Watchlist", icon: Bookmark },
  { id: "portfolio", label: "Portfolio", icon: Wallet },
  { id: "pnl", label: "Profit & Loss", icon: Calculator },
  { id: "dsa", label: "DSA Engine", icon: Waypoints },
  { id: "cpp", label: "C++ Engine", icon: Cpu },
  { id: "team", label: "Contributions", icon: Users },
  { id: "news", label: "Market News", icon: Newspaper },
  { id: "latest", label: "Latest News", icon: Rss },
  { id: "compare", label: "Compare", icon: Scale },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "profile", label: "Company", icon: Building2 },
  { id: "history", label: "History", icon: Clock3 },
];

const CHIPS = ["AAPL", "MSFT", "NVDA", "TSLA", "AMZN", "GOOGL", "JPM", "NFLX"];

export function Desk() {
  const {
    symbol,
    setSymbol,
    watchlist,
    addWatch,
    removeWatch,
    history,
    clearHistory,
    theme,
    setTheme,
    portfolio,
    alerts,
    markAlert,
  } = useDesk();
  const [tab, setTab] = useState<Tab>("quote");
  const [navOpen, setNavOpen] = useState(true);
  const [query, setQuery] = useState(symbol);
  const [openHits, setOpenHits] = useState(false);
  const [horizon, setHorizon] = useState(7);
  const [range, setRange] = useState<ChartRange>("1M");
  const [chartStyle, setChartStyle] = useState<ChartStyle>("line");

  useEffect(() => {
    if (window.location.hash === "#contributions") setTab("team");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const liveSymbols = useMemo(() => {
    return [...new Set([...watchlist, ...portfolio.map((h) => h.symbol), ...alerts.map((a) => a.symbol)])];
  }, [watchlist, portfolio, alerts]);

  const bundle = useQuery({
    queryKey: ["bundle", symbol],
    queryFn: () => fetchQuoteBundle({ data: { symbol } }),
  });

  const ranged = useQuery({
    queryKey: ["chart", symbol, range],
    queryFn: () => fetchChart({ data: { symbol, range } }),
    enabled: tab === "quote",
  });

  const profile = useQuery({
    queryKey: ["profile", symbol],
    queryFn: () => fetchProfile({ data: { symbol } }),
    enabled: tab === "profile",
  });

  const search = useQuery({
    queryKey: ["search", query],
    queryFn: () => searchTickers({ data: { q: query } }),
    enabled: query.trim().length >= 1 && openHits,
  });

  const news = useQuery({
    queryKey: ["news", symbol],
    queryFn: () => searchTickers({ data: { q: symbol } }),
    enabled: tab === "news",
  });

  const watchQuotes = useQuery({
    queryKey: ["live", liveSymbols.join(",")],
    queryFn: () => fetchWatchQuotes({ data: { symbols: liveSymbols } }),
    enabled: liveSymbols.length > 0,
    refetchInterval: alerts.some((a) => !a.triggeredAt) ? 45_000 : false,
  });

  const forecastQuery = useQuery({
    queryKey: ["forecast", symbol, horizon, bundle.dataUpdatedAt],
    queryFn: () => fetchForecast({ data: { candles: bundle.data!.candles, horizon } }),
    enabled: (bundle.data?.candles.length ?? 0) >= 40,
  });
  const forecast = forecastQuery.data ?? null;

  const briefing = useMutation({
    mutationFn: async () => {
      if (!forecast || !bundle.data) throw new Error("No forecast yet");
      return explainForecast({
        data: {
          symbol,
          name: bundle.data.quote.name,
          lastClose: forecast.lastClose,
          nextClose: forecast.nextClose,
          direction: forecast.direction,
          confidence: forecast.confidence,
          rsi: forecast.rsi14,
          accuracy: forecast.backtest.directionalAccuracy,
          votes: forecast.votes,
        },
      });
    },
  });

  useEffect(() => {
    setQuery(symbol);
  }, [symbol]);

  useEffect(() => {
    const prices = new Map<string, number>();
    if (bundle.data?.quote) {
      prices.set(bundle.data.quote.symbol, bundle.data.quote.price);
    }
    for (const q of watchQuotes.data ?? []) {
      prices.set(q.symbol, q.price);
    }
    for (const alert of alerts) {
      if (alert.triggeredAt) continue;
      const price = prices.get(alert.symbol);
      if (price == null) continue;
      const hit =
        alert.op === "above" ? price >= alert.target : price <= alert.target;
      if (hit) {
        markAlert(alert.id);
        toast.message(
          `${alert.symbol} moved ${alert.op} ${alert.target.toFixed(2)}`,
        );
      }
    }
  }, [alerts, bundle.data, watchQuotes.data, markAlert]);

  const quote = bundle.data?.quote;
  const up = (quote?.change ?? 0) >= 0;
  const watching = watchlist.includes(symbol);

  function submitSymbol(next: string) {
    const clean = next.trim().toUpperCase();
    if (!clean) return;
    setSymbol(clean);
    setOpenHits(false);
    toast.message(`Loaded ${clean}`);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Toaster
        theme={theme === "light" ? "light" : "dark"}
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--color-elevated)",
            border: "1px solid var(--color-border)",
            color: "var(--color-foreground)",
          },
        }}
      />
      <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-5 px-3 py-4 sm:px-5 sm:py-6 lg:flex-row lg:gap-6">
        <aside
          className={cn(
            "lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:shrink-0 lg:overflow-y-auto",
            navOpen ? "lg:w-64" : "lg:w-[4.5rem]",
          )}
        >
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className={cn("flex min-w-0 items-center gap-3", !navOpen && "lg:hidden")}>
              <img src="/logo.png" alt="" width={40} height={34} className="h-9 w-auto shrink-0 object-contain" />
              <div className="min-w-0">
                <p className="font-mono text-[10px] tracking-[0.22em] text-subtle uppercase">Hatch · hold · grow</p>
                <h1 className="font-display text-2xl leading-none tracking-tight">
                  <span className="italic">Nest</span>Invest
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setNavOpen((open) => !open)}
                className="hidden size-11 place-items-center rounded-[var(--radius-sm)] text-muted hover:bg-elevated hover:text-foreground lg:grid"
                aria-label={navOpen ? "Collapse navigation" : "Expand navigation"}
              >
                <PanelLeft className="size-4" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="grid size-11 place-items-center rounded-[var(--radius-sm)] text-muted hover:bg-elevated hover:text-foreground"
                aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
              >
                {theme === "light" ? <Moon className="size-4" strokeWidth={1.75} /> : <Sun className="size-4" strokeWidth={1.75} />}
              </button>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
            {TABS.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setTab(item.id);
                    setOpenHits(false);
                  }}
                  title={item.label}
                  className={cn(
                    "flex min-h-11 shrink-0 items-center gap-2.5 whitespace-nowrap rounded-[var(--radius-sm)] px-3 text-sm transition-[background-color,color,transform] duration-[var(--motion-quick)] hover:bg-elevated",
                    active ? "nest-nav-active" : "text-muted hover:text-foreground",
                    !navOpen && "lg:justify-center lg:px-0",
                  )}
                >
                  <Icon className="size-4 shrink-0" strokeWidth={1.75} />
                  <span className={cn(!navOpen && "lg:sr-only")}>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 space-y-4">
          {tab === "quote" && (
            <section className="nest-hero px-5 py-6 sm:px-7 sm:py-8">
              <div className="relative z-[1] max-w-2xl">
                <p className="font-mono text-[11px] tracking-[0.22em] text-subtle uppercase">Live market desk</p>
                <h2 className="font-display mt-2 text-4xl tracking-tight sm:text-5xl">
                  <span className="italic">Nest</span>Invest
                </h2>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted sm:text-base">
                  A quiet desk for live quotes, company files, a watchlist, and a technical sketch of the next sessions.
                </p>
              </div>
            </section>
          )}
          <MarketStrip />
          <section className="nest-card rounded-[var(--radius-xl)] p-4 sm:p-5">
            <form
              className="relative flex flex-col gap-3 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                submitSymbol(query);
              }}
            >
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
                <Input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setOpenHits(true);
                  }}
                  onFocus={() => setOpenHits(true)}
                  onBlur={() => {
                    window.setTimeout(() => setOpenHits(false), 180);
                  }}
                  placeholder="Search ticker or company"
                  className="pl-10"
                  aria-label="Stock symbol"
                  autoComplete="off"
                />
                {openHits && (search.data?.quotes.length ?? 0) > 0 && (
                  <ul className="absolute z-20 mt-2 w-full overflow-hidden rounded-[var(--radius-md)] border border-border bg-elevated shadow-lg">
                    {search.data!.quotes.map((hit) => (
                      <li key={hit.symbol}>
                        <button
                          type="button"
                          className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-card"
                          onClick={() => submitSymbol(hit.symbol)}
                        >
                          <span className="font-mono text-sm">{hit.symbol}</span>
                          <span className="truncate text-xs text-muted">{hit.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="submit">Open</Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    if (watching) {
                      removeWatch(symbol);
                      toast.message(`Removed ${symbol}`);
                    } else {
                      addWatch(symbol);
                      toast.message(`Watching ${symbol}`);
                    }
                  }}
                >
                  {watching ? (
                    <BookmarkCheck className="size-4" />
                  ) : (
                    <Bookmark className="size-4" />
                  )}
                  <span className="hidden sm:inline">
                    {watching ? "Saved" : "Watch"}
                  </span>
                </Button>
              </div>
            </form>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {CHIPS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => submitSymbol(s)}
                  className={cn(
                    "h-8 rounded-full border px-3 font-mono text-xs",
                    symbol === s
                      ? "border-border-strong bg-elevated text-foreground"
                      : "border-border text-muted hover:text-foreground",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </section>

          {bundle.isLoading && (
            <div className="space-y-3" aria-hidden>
              <div className="h-24 animate-pulse rounded-[var(--radius-xl)] bg-elevated" />
              <div className="h-72 animate-pulse rounded-[var(--radius-xl)] bg-elevated" />
            </div>
          )}
          {bundle.error && (
            <div className="rounded-[var(--radius-xl)] border border-border bg-card p-6 text-sm text-loss">
              {(bundle.error as Error).message}
            </div>
          )}

          {quote && (
            <section className="nest-card rounded-[var(--radius-xl)] p-5 sm:p-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-xs tracking-wide text-subtle">
                    {quote.symbol} · {quote.exchange}
                  </p>
                  <h2 className="font-display mt-1 text-2xl tracking-tight sm:text-3xl">
                    {quote.name}
                  </h2>
                </div>
                <div className="text-right">
                  <p className="font-mono text-4xl tabular-nums tracking-tight sm:text-5xl">
                    {formatMoney(quote.price, quote.currency)}
                  </p>
                  <p
                    className={cn(
                      "mt-1 inline-flex items-center gap-1 font-mono text-sm tabular-nums",
                      up ? "text-gain" : "text-loss",
                    )}
                  >
                    {up ? (
                      <ArrowUpRight className="size-4" />
                    ) : (
                      <ArrowDownRight className="size-4" />
                    )}
                    {formatMoney(quote.change, quote.currency)} (
                    {formatPct(quote.changePct)})
                  </p>
                </div>
              </div>

              {(tab === "quote" || tab === "predict") && (
                <div className="mt-5">
                  {tab === "quote" && (
                    <div className="mb-3 flex flex-wrap items-center gap-1.5">
                      {CHART_RANGES.map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRange(r)}
                          className={cn(
                            "h-9 rounded-full border px-3 font-mono text-xs",
                            range === r
                              ? "border-border-strong bg-elevated text-foreground"
                              : "border-border text-muted hover:text-foreground",
                          )}
                        >
                          {r}
                        </button>
                      ))}
                      <span className="mx-1 hidden h-4 w-px bg-border sm:inline" />
                      {(["line", "candle"] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setChartStyle(mode)}
                          className={cn(
                            "h-9 rounded-full border px-3 text-xs capitalize",
                            chartStyle === mode
                              ? "border-border-strong bg-elevated text-foreground"
                              : "border-border text-muted hover:text-foreground",
                          )}
                        >
                          {mode === "line" ? "Line" : "Candles"}
                        </button>
                      ))}
                    </div>
                  )}
                  {tab === "quote" && ranged.isLoading && (
                    <p className="mb-3 text-sm text-muted">Drawing {range} path…</p>
                  )}
                  <PriceChart
                    candles={
                      tab === "quote"
                        ? (ranged.data?.candles ?? bundle.data?.candles ?? [])
                        : (bundle.data?.candles ?? [])
                    }
                    forecast={tab === "predict" ? forecast : null}
                    currency={quote.currency}
                    range={tab === "quote" ? range : "1Y"}
                    style={tab === "quote" ? chartStyle : "line"}
                  />
                </div>
              )}

              {tab === "quote" && (
                <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-4">
                  <Stat label="Open" value={formatMoney(quote.open ?? 0, quote.currency)} />
                  <Stat label="High" value={formatMoney(quote.high ?? 0, quote.currency)} />
                  <Stat label="Low" value={formatMoney(quote.low ?? 0, quote.currency)} />
                  <Stat label="Prev close" value={formatMoney(quote.previousClose, quote.currency)} />
                  <Stat label="Volume" value={formatCompact(quote.volume ?? 0)} />
                  <Stat label="52w high" value={formatMoney(quote.high52 ?? 0, quote.currency)} />
                  <Stat label="52w low" value={formatMoney(quote.low52 ?? 0, quote.currency)} />
                  <Stat label="Currency" value={quote.currency} />
                </dl>
              )}

              {tab === "predict" && forecast && (
                <div className="mt-6 space-y-5">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[var(--radius-md)] bg-elevated p-4">
                      <p className="text-xs tracking-wide text-subtle uppercase">
                        Next session
                      </p>
                      <p className="font-mono mt-2 text-2xl tabular-nums">
                        {formatMoney(forecast.nextClose, quote.currency)}
                      </p>
                      <p
                        className={cn(
                          "mt-1 font-mono text-sm tabular-nums",
                          forecast.nextClose >= forecast.lastClose
                            ? "text-gain"
                            : "text-loss",
                        )}
                      >
                        {formatPct(forecast.nextClose / forecast.lastClose - 1)} vs last close
                      </p>
                    </div>
                    <div className="rounded-[var(--radius-md)] bg-elevated p-4">
                      <p className="text-xs tracking-wide text-subtle uppercase">
                        Stance
                      </p>
                      <p className="mt-2 text-2xl capitalize">{forecast.direction}</p>
                      <p className="mt-1 font-mono text-sm text-muted tabular-nums">
                        Confidence {Math.round(forecast.confidence * 100)}%
                      </p>
                    </div>
                    <div className="rounded-[var(--radius-md)] bg-elevated p-4">
                      <p className="text-xs tracking-wide text-subtle uppercase">
                        Walk-forward
                      </p>
                      <p className="font-mono mt-2 text-2xl tabular-nums">
                        {Math.round(forecast.backtest.directionalAccuracy * 100)}%
                      </p>
                      <p className="mt-1 text-sm text-muted">
                        Directional hits, last {forecast.backtest.samples} sessions
                      </p>
                    </div>
                  </div>

                  <label className="block text-sm text-muted">
                    Horizon {horizon} session{horizon === 1 ? "" : "s"}
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={horizon}
                      onChange={(e) => setHorizon(Number(e.target.value))}
                      className="mt-2 w-full accent-[var(--color-accent)]"
                    />
                  </label>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[28rem] text-left text-sm">
                      <thead className="text-xs tracking-wide text-subtle uppercase">
                        <tr>
                          <th className="pb-2 font-medium">Signal</th>
                          <th className="pb-2 font-medium">Vote</th>
                          <th className="pb-2 font-medium">Note</th>
                        </tr>
                      </thead>
                      <tbody>
                        {forecast.votes.map((v) => (
                          <tr key={v.name} className="border-t border-border">
                            <td className="py-2.5 pr-3">{v.name}</td>
                            <td
                              className={cn(
                                "font-mono py-2.5 pr-3 tabular-nums",
                                v.score > 0.05
                                  ? "text-gain"
                                  : v.score < -0.05
                                    ? "text-loss"
                                    : "text-muted",
                              )}
                            >
                              {v.score > 0 ? "+" : ""}
                              {formatNumber(v.score, 2)}
                            </td>
                            <td className="py-2.5 text-muted">{v.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <p className="text-xs leading-relaxed text-subtle">
                    Ensemble of linear trend, EMA 12/26, MACD, RSI mean-reversion,
                    SMA 20/50 regime, Bollinger pull, and 10-day momentum. This is
                    not LSTM or a promise of future returns.
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => briefing.mutate()}
                      disabled={briefing.isPending}
                    >
                      <FileText className="size-4" />
                      {briefing.isPending ? "Writing briefing…" : "Grok briefing"}
                    </Button>
                  </div>
                  {briefing.data && (
                    <div className="rounded-[var(--radius-md)] border border-border p-4 text-sm leading-relaxed text-muted">
                      {briefing.data.ok
                        ? briefing.data.text
                        : briefing.data.error}
                    </div>
                  )}
                </div>
              )}

              {tab === "news" && (
                <NewsCards items={news.data?.news ?? []} loading={news.isFetching} />
              )}

              {tab === "latest" && <LatestNewsPanel />}

              {tab === "market" && (
                <MarketPanel
                  onOpen={(s) => {
                    submitSymbol(s);
                    setTab("quote");
                  }}
                />
              )}

              {tab === "watch" && (
                <WatchPanel
                  quotes={watchQuotes.data ?? []}
                  loading={watchQuotes.isFetching}
                  onOpen={(s) => {
                    submitSymbol(s);
                    setTab("quote");
                  }}
                />
              )}

              {tab === "portfolio" && (
                <PortfolioPanel
                  quotes={watchQuotes.data ?? []}
                  currentSymbol={symbol}
                />
              )}

              {tab === "pnl" && (
                <PnLPanel
                  currentSymbol={symbol}
                  onOpen={(s) => {
                    submitSymbol(s);
                  }}
                />
              )}

              {tab === "compare" && <ComparePanel seed={symbol} />}

              {tab === "alerts" && (
                <AlertsPanel
                  currentSymbol={symbol}
                  currentPrice={quote.price}
                />
              )}

              {tab === "profile" && (
                <div className="mt-6 space-y-4">
                  {profile.isLoading && (
                    <p className="text-sm text-muted">Loading company file…</p>
                  )}
                  {profile.data && (
                    <>
                      <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                        <Stat label="Ticker" value={profile.data.symbol} />
                        <Stat label="Exchange" value={profile.data.exchange} />
                        <Stat label="Type" value={profile.data.type} />
                        <Stat label="Sector" value={profile.data.sector ?? "—"} />
                        <Stat label="Industry" value={profile.data.industry ?? "—"} />
                        <Stat label="Currency" value={profile.data.currency} />
                      </dl>
                      {profile.data.summary && (
                        <p className="max-w-prose text-sm leading-relaxed text-muted">
                          {profile.data.summary}
                        </p>
                      )}
                      {profile.data.wikiUrl && (
                        <a
                          href={profile.data.wikiUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-foreground underline decoration-border-strong underline-offset-4"
                        >
                          Company background
                        </a>
                      )}
                    </>
                  )}
                </div>
              )}

              {tab === "history" && (
                <div className="mt-6">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm text-muted">Recent lookups on this device</p>
                    {history.length > 0 && (
                      <Button type="button" variant="ghost" size="sm" onClick={clearHistory}>
                        <Trash2 className="size-4" />
                        Clear
                      </Button>
                    )}
                  </div>
                  {history.length === 0 ? (
                    <p className="text-sm text-subtle">No searches yet.</p>
                  ) : (
                    <ol className="space-y-1">
                      {history.map((s, i) => (
                        <li key={`${s}-${i}`}>
                          <button
                            type="button"
                            className="flex h-11 w-full items-center justify-between rounded-[var(--radius-sm)] px-3 text-left hover:bg-elevated"
                            onClick={() => submitSymbol(s)}
                          >
                            <span className="font-mono text-sm">{s}</span>
                            <span className="text-xs text-subtle">{i + 1}</span>
                          </button>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              )}

              {tab === "dsa" && <DsaPanel history={history} />}
              {tab === "cpp" && <CppEnginePanel />}
              {tab === "team" && <ContributionsPanel />}
            </section>
          )}
        </main>
      </div>
      <AuthorPlate />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-border bg-elevated px-3 py-3 transition-colors hover:border-border-strong">
      <dt className="text-[11px] tracking-wide text-subtle uppercase">{label}</dt>
      <dd className="font-mono mt-1 text-sm tabular-nums">{value}</dd>
    </div>
  );
}

function AuthorPlate() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto max-w-[1440px] px-3 py-6 sm:px-5">
        <p className="font-mono text-xs tracking-[0.22em] text-subtle uppercase">
          The nest
        </p>
        <p className="font-display mt-1 text-lg italic tracking-tight">
          NestInvest · hatch a view, then take the trade
        </p>
        <ul className="mt-5 grid gap-4 sm:grid-cols-3">
          {MEMBERS.map((member) => {
            const social = SOCIAL[member.slug];
            return (
              <li key={member.slug} className="flex items-start gap-3">
                <Link
                  to="/team/$slug"
                  params={{ slug: member.slug }}
                  className="flex min-w-0 flex-1 items-start gap-3 rounded-[var(--radius-sm)] hover:bg-elevated"
                >
                  <MemberPhoto src={member.photo} alt={member.name} />
                  <span className="min-w-0">
                    <span className="font-display block text-base leading-tight tracking-tight">
                      {member.name}
                    </span>
                    <span className="mt-1 block text-xs leading-snug text-muted">{member.summary}</span>
                    <span className="mt-1 block text-xs leading-snug text-muted">{DEGREE}</span>
                  </span>
                </Link>
                {social && (
                  <div className="flex shrink-0 flex-col gap-2">
                    <a
                      href={social.instagram}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border border-border px-2.5 text-xs text-muted hover:text-foreground"
                      aria-label={`${member.name} on Instagram`}
                    >
                      <InstagramGlyph />
                      Instagram
                    </a>
                    <a
                      href={social.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border border-border px-2.5 text-xs text-muted hover:text-foreground"
                    >
                      <LinkedInGlyph />
                      LinkedIn
                    </a>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </footer>
  );
}

const DEGREE = "B.Tech CSE · Graphic Era Deemed to be University, Dehradun";

const SOCIAL: Record<string, { instagram: string; linkedin: string }> = {
  "yash-sharma": {
    instagram: "https://www.instagram.com/yash_sharma49/",
    linkedin: "https://www.linkedin.com/in/yash-sharma-567a52273",
  },
};

function MemberPhoto({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      width={64}
      height={64}
      className="size-16 rounded-full border border-border object-cover object-top"
    />
  );
}

function InstagramGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
      <rect
        x="3.2"
        y="3.2"
        width="17.6"
        height="17.6"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle cx="12" cy="12" r="3.6" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17.15" cy="6.85" r="0.9" fill="currentColor" />
    </svg>
  );
}

function LinkedInGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
      <path d="M6.54 8.5H3.1V20.9h3.44V8.5zM4.82 3.1a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM20.9 13.16c0-4.14-2.21-6.07-5.16-6.07-2.38 0-3.44 1.31-4.03 2.23V8.5H8.28c.05 1.02 0 12.4 0 12.4h3.43v-6.93c0-.37.03-.74.14-1 .3-.74.98-1.51 2.13-1.51 1.5 0 2.1 1.15 2.1 2.83v5.61H20.9v-7.74z" />
    </svg>
  );
}
