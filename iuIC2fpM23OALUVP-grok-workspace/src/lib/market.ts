import { createServerFn } from "@tanstack/react-start";
import type { Candle } from "@/lib/predict";
import type { Forecast } from "@/lib/predict";
import type { PnLDetails, PnLResult } from "@/lib/pnl";

const CPP = "http://127.0.0.1:8091";

async function cpp<T>(path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${CPP}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body ?? {}),
    });
  } catch {
    throw new Error("Market backend is not running.");
  }
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error(data.error || `Market data error (${res.status})`);
  return data;
}

export type ChartRange = "1D" | "1W" | "1M" | "3M" | "1Y";

export const CHART_RANGES: ChartRange[] = ["1D", "1W", "1M", "3M", "1Y"];

export const MARKET_INDEXES = [
  { symbol: "^GSPC", label: "S&P 500" },
  { symbol: "^DJI", label: "Dow" },
  { symbol: "^IXIC", label: "Nasdaq" },
  { symbol: "^RUT", label: "Russell 2000" },
  { symbol: "^VIX", label: "VIX" },
] as const;

/** Liquid names quoted live for gainers, losers, and most-active. */
export const BOARD = [
  "AAPL",
  "MSFT",
  "NVDA",
  "AMZN",
  "GOOGL",
  "META",
  "TSLA",
  "JPM",
  "XOM",
  "AVGO",
  "COST",
  "AMD",
] as const;

export type Quote = {
  symbol: string;
  name: string;
  currency: string;
  exchange: string;
  price: number;
  previousClose: number;
  change: number;
  changePct: number;
  open: number | null;
  high: number | null;
  low: number | null;
  volume: number | null;
  high52: number | null;
  low52: number | null;
};

export type NewsItem = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  published: number;
  thumbnail?: string;
};

export type SearchHit = {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
  sector?: string;
  industry?: string;
};

export type Profile = {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  type: string;
  sector?: string;
  industry?: string;
  summary?: string;
  wikiUrl?: string;
};

export const fetchQuoteBundle = createServerFn({ method: "POST" })
  .validator((input: { symbol: string }) => input)
  .handler(async ({ data }) => cpp<{ quote: Quote; candles: Candle[] }>("/quote", data));

export const fetchChart = createServerFn({ method: "POST" })
  .validator((input: { symbol: string; range: ChartRange }) => input)
  .handler(async ({ data }) => cpp<{ quote: Quote; candles: Candle[] }>("/chart", data));

export const fetchCharts = createServerFn({ method: "POST" })
  .validator((input: { symbols: string[]; range: ChartRange }) => input)
  .handler(async ({ data }) => cpp<{ quote: Quote; candles: Candle[] }[]>("/charts", data));

export const fetchMarketOverview = createServerFn({ method: "POST" }).handler(async () =>
  cpp<(Quote & { label: string })[]>("/overview", {}),
);

export const searchTickers = createServerFn({ method: "POST" })
  .validator((input: { q: string }) => input)
  .handler(async ({ data }) => cpp<{ quotes: SearchHit[]; news: NewsItem[] }>("/search", data));

export const fetchHeadlines = createServerFn({ method: "POST" }).handler(async () =>
  cpp<{ news: NewsItem[] }>("/headlines", {}),
);

export const fetchProfile = createServerFn({ method: "POST" })
  .validator((input: { symbol: string }) => input)
  .handler(async ({ data }) => cpp<Profile>("/profile", data));

export const fetchWatchQuotes = createServerFn({ method: "POST" })
  .validator((input: { symbols: string[] }) => input)
  .handler(async ({ data }) => cpp<Quote[]>("/watch", data));

export const fetchForecast = createServerFn({ method: "POST" })
  .validator((input: { candles: Candle[]; horizon: number }) => input)
  .handler(async ({ data }) => cpp<Forecast | null>("/forecast", data));

export const fetchPnL = createServerFn({ method: "POST" })
  .validator((input: PnLDetails) => input)
  .handler(async ({ data }) => cpp<PnLResult | null>("/pnl", data));

export const explainForecast = createServerFn({ method: "POST" })
  .validator(
    (input: {
      symbol: string;
      name: string;
      lastClose: number;
      nextClose: number;
      direction: string;
      confidence: number;
      rsi: number | null;
      accuracy: number;
      votes: { name: string; score: number; note: string }[];
    }) => input,
  )
  .handler(async ({ data }) => cpp<{ ok: true; text: string } | { ok: false; error: string }>("/explain", data));
