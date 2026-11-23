export type Candle = {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
};

export type Direction = "bullish" | "bearish" | "neutral";

export type IndicatorVote = {
  name: string;
  score: number;
  note: string;
};

export type Forecast = {
  lastClose: number;
  nextClose: number;
  expectedDailyReturn: number;
  direction: Direction;
  confidence: number;
  path: { day: number; price: number }[];
  votes: IndicatorVote[];
  rsi14: number | null;
  sma20: number | null;
  sma50: number | null;
  ema12: number | null;
  ema26: number | null;
  macd: number | null;
  bbUpper: number | null;
  bbLower: number | null;
  slope: number;
  r2: number;
  backtest: {
    samples: number;
    directionalAccuracy: number;
    mape: number;
  };
};

function mean(xs: number[]) {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function stdev(xs: number[]) {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  const v = xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1);
  return Math.sqrt(v);
}

function smaAt(xs: number[], n: number) {
  if (xs.length < n) return null;
  return mean(xs.slice(xs.length - n));
}

function emaSeries(xs: number[], n: number): number[] {
  const k = 2 / (n + 1);
  const out: number[] = [];
  let e = mean(xs.slice(0, Math.min(n, xs.length)));
  for (let i = 0; i < xs.length; i++) {
    e = i === 0 ? xs[0]! : xs[i]! * k + e * (1 - k);
    out.push(e);
  }
  return out;
}

function rsi(xs: number[], n = 14): number | null {
  if (xs.length < n + 1) return null;
  let gains = 0;
  let losses = 0;
  const start = xs.length - n;
  for (let i = start; i < xs.length; i++) {
    const d = xs[i]! - xs[i - 1]!;
    if (d >= 0) gains += d;
    else losses -= d;
  }
  const ag = gains / n;
  const al = losses / n;
  if (al === 0) return 100;
  const rs = ag / al;
  return 100 - 100 / (1 + rs);
}

function linreg(xs: number[]) {
  const n = xs.length;
  if (n < 3) return { slope: 0, intercept: xs[0] ?? 0, r2: 0 };
  let sx = 0;
  let sy = 0;
  let sxy = 0;
  let sx2 = 0;
  for (let i = 0; i < n; i++) {
    sx += i;
    sy += xs[i]!;
    sxy += i * xs[i]!;
    sx2 += i * i;
  }
  const den = n * sx2 - sx * sx;
  const slope = den === 0 ? 0 : (n * sxy - sx * sy) / den;
  const intercept = (sy - slope * sx) / n;
  const yMean = sy / n;
  let ssTot = 0;
  let ssRes = 0;
  for (let i = 0; i < n; i++) {
    const yhat = intercept + slope * i;
    ssTot += (xs[i]! - yMean) ** 2;
    ssRes += (xs[i]! - yhat) ** 2;
  }
  const r2 = ssTot === 0 ? 0 : Math.max(0, 1 - ssRes / ssTot);
  return { slope, intercept, r2 };
}

function clamp(n: number, a: number, b: number) {
  return Math.min(b, Math.max(a, n));
}

function last<T>(xs: T[]): T | undefined {
  return xs[xs.length - 1];
}

/**
 * Ensemble of classical signals used in the literature:
 * linear trend, EMA momentum / MACD, RSI mean-reversion, SMA regime, Bollinger pull.
 * Not a neural net — fast, inspectable, and honest about recent walk-forward accuracy.
 */
export function buildForecast(candles: Candle[], horizon = 7): Forecast | null {
  const valid = candles.filter((c) => Number.isFinite(c.c) && c.c > 0);
  if (valid.length < 40) return null;

  const closes = valid.map((c) => c.c);
  const volumes = valid.map((c) => c.v);
  const lastClose = last(closes)!;
  const window = closes.slice(-60);
  const { slope, r2 } = linreg(window);

  const sma20 = smaAt(closes, 20);
  const sma50 = smaAt(closes, 50);
  const sma10 = smaAt(closes, 10);
  const ema12s = emaSeries(closes, 12);
  const ema26s = emaSeries(closes, 26);
  const ema12 = last(ema12s)!;
  const ema26 = last(ema26s)!;
  const macdLine = ema12s.map((e, i) => e - ema26s[i]!);
  const signalSeries = emaSeries(macdLine.slice(-40), 9);
  const macd = last(macdLine)!;
  const macdSignal = last(signalSeries) ?? macd;
  const rsi14 = rsi(closes, 14);
  const recent = closes.slice(-20);
  const mid = mean(recent);
  const sd = stdev(recent);
  const bbUpper = mid + 2 * sd;
  const bbLower = mid - 2 * sd;
  const mom10 =
    closes.length > 10 ? lastClose / closes[closes.length - 11]! - 1 : 0;
  const vol20 = mean(volumes.slice(-20));
  const vol5 = mean(volumes.slice(-5));
  const volumeRatio = vol20 > 0 ? vol5 / vol20 : 1;

  const votes: IndicatorVote[] = [];

  const trendScore = clamp((slope / lastClose) * 40, -1, 1);
  votes.push({
    name: "Linear trend (60d)",
    score: trendScore,
    note:
      slope >= 0
        ? `Upward drift ${((slope / lastClose) * 100).toFixed(2)}% per session`
        : `Downward drift ${((slope / lastClose) * 100).toFixed(2)}% per session`,
  });

  const emaScore = clamp((ema12 - ema26) / lastClose * 25, -1, 1);
  votes.push({
    name: "EMA 12/26 momentum",
    score: emaScore,
    note: ema12 >= ema26 ? "Short EMA above long EMA" : "Short EMA below long EMA",
  });

  const macdScore = clamp((macd - macdSignal) / lastClose * 80, -1, 1);
  votes.push({
    name: "MACD histogram",
    score: macdScore,
    note: macd >= macdSignal ? "MACD above signal" : "MACD below signal",
  });

  let rsiScore = 0;
  if (rsi14 != null) {
    if (rsi14 >= 70) rsiScore = -0.7 - (rsi14 - 70) / 60;
    else if (rsi14 <= 30) rsiScore = 0.7 + (30 - rsi14) / 60;
    else rsiScore = (50 - rsi14) / 50;
    rsiScore = clamp(rsiScore, -1, 1);
  }
  votes.push({
    name: "RSI mean-reversion",
    score: rsiScore,
    note:
      rsi14 == null
        ? "Insufficient history"
        : rsi14 >= 70
          ? `Overbought (${rsi14.toFixed(0)})`
          : rsi14 <= 30
            ? `Oversold (${rsi14.toFixed(0)})`
            : `Neutral RSI ${rsi14.toFixed(0)}`,
  });

  let smaScore = 0;
  let smaNote = "Need 50 sessions";
  if (sma20 && sma50) {
    smaScore = clamp((sma20 - sma50) / lastClose * 12, -1, 1);
    if (lastClose > sma20) smaScore += 0.15;
    else smaScore -= 0.15;
    smaScore = clamp(smaScore, -1, 1);
    const regime = sma20 >= sma50 ? "SMA20 above SMA50" : "SMA20 below SMA50";
    const vs = lastClose >= sma20 ? "price above SMA20" : "price below SMA20";
    smaNote = `${regime}; ${vs}`;
  }
  votes.push({
    name: "SMA 20/50 regime",
    score: smaScore,
    note: smaNote,
  });

  const bbPos = sd > 0 ? (lastClose - mid) / (2 * sd) : 0;
  const bbScore = clamp(-bbPos * 0.8, -1, 1);
  votes.push({
    name: "Bollinger pull",
    score: bbScore,
    note:
      bbPos > 0.8
        ? "Near upper band — fade bias"
        : bbPos < -0.8
          ? "Near lower band — bounce bias"
          : "Inside the envelope",
  });

  const momScore = clamp(mom10 * 8, -1, 1);
  votes.push({
    name: "10-day momentum",
    score: momScore,
    note: `10-session return ${((mom10 || 0) * 100).toFixed(2)}%`,
  });

  const weights = [0.22, 0.16, 0.14, 0.14, 0.14, 0.1, 0.1];
  let blended = 0;
  votes.forEach((v, i) => {
    blended += v.score * (weights[i] ?? 0.1);
  });
  blended *= volumeRatio >= 1 ? 1.05 : 0.95;
  blended = clamp(blended, -1, 1);

  const expectedDailyReturn = clamp(
    blended * 0.008 + (slope / lastClose) * 0.25,
    -0.035,
    0.035,
  );

  const path = [];
  for (let d = 1; d <= horizon; d++) {
    const fade = 1 - d * 0.04;
    const r = expectedDailyReturn * fade;
    path.push({ day: d, price: lastClose * (1 + r * d) });
  }

  const nextClose = path[0]?.price ?? lastClose;
  const direction: Direction =
    expectedDailyReturn > 0.0008
      ? "bullish"
      : expectedDailyReturn < -0.0008
        ? "bearish"
        : "neutral";

  const agree = votes.filter((v) =>
    direction === "bullish" ? v.score > 0.05 : direction === "bearish" ? v.score < -0.05 : Math.abs(v.score) < 0.2,
  ).length;
  const confidence = clamp(0.28 + r2 * 0.35 + (agree / votes.length) * 0.32, 0.22, 0.86);

  const backtest = walkForward(closes);

  return {
    lastClose,
    nextClose,
    expectedDailyReturn,
    direction,
    confidence,
    path,
    votes,
    rsi14,
    sma20,
    sma50,
    ema12,
    ema26,
    macd,
    bbUpper,
    bbLower,
    slope,
    r2,
    backtest,
  };
}

function walkForward(closes: number[]) {
  const lookback = 40;
  const start = Math.max(lookback, closes.length - 40);
  let hits = 0;
  let n = 0;
  let ape = 0;
  for (let i = start; i < closes.length - 1; i++) {
    const window = closes.slice(i - lookback, i);
    const { slope } = linreg(window);
    const last = window[window.length - 1]!;
    const pred = last + slope;
    const actual = closes[i]!;
    const predDir = pred - last;
    const actDir = actual - last;
    if (predDir === 0 && actDir === 0) hits += 1;
    else if (predDir * actDir > 0) hits += 1;
    ape += Math.abs(actual - pred) / actual;
    n += 1;
  }
  return {
    samples: n,
    directionalAccuracy: n ? hits / n : 0,
    mape: n ? ape / n : 0,
  };
}

export function forecastSeries(candles: Candle[], forecast: Forecast) {
  const last = candles[candles.length - 1];
  if (!last) return [];
  return [
    { t: last.t, price: last.c, kind: "anchor" as const },
    ...forecast.path.map((p) => ({
      t: last.t + p.day * 86_400_000,
      price: p.price,
      kind: "forecast" as const,
    })),
  ];
}
