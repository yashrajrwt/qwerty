import { o as __toESM } from "../_runtime.mjs";
import { a as require_react, i as require_jsx_runtime, n as useQuery, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { i as getServerFnById, n as createServerFn, r as TSS_SERVER_FUNCTION } from "./ssr.mjs";
import { C as BookmarkCheck, D as Activity, E as ArrowDownRight, S as Bookmark, T as ArrowUpRight, _ as FileText, a as Trash2, b as Calculator, c as Search, d as Plus, f as Play, g as Globe, h as Moon, l as Scale, m as Newspaper, n as Waypoints, o as Sun, p as Pause, r as Wallet, s as SkipForward, t as X, u as RotateCcw, v as Clock3, w as Bell, x as Building2, y as ChartLine } from "../_libs/lucide-react.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { a as XAxis, c as CartesianGrid, d as Cell, f as ResponsiveContainer, i as YAxis, l as Pie, n as PieChart, o as Area, p as Tooltip, r as LineChart, s as Line, t as ComposedChart, u as Customized } from "../_libs/recharts+[...].mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BTI4ZSzl.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function formatMoney(value, currency = "USD") {
	if (!Number.isFinite(value)) return "—";
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency,
		maximumFractionDigits: value >= 1e3 ? 2 : 2
	}).format(value);
}
function formatNumber(value, digits = 2) {
	if (!Number.isFinite(value)) return "—";
	return new Intl.NumberFormat("en-US", {
		maximumFractionDigits: digits,
		minimumFractionDigits: digits
	}).format(value);
}
function formatCompact(value) {
	if (!Number.isFinite(value)) return "—";
	return new Intl.NumberFormat("en-US", {
		notation: "compact",
		maximumFractionDigits: 1
	}).format(value);
}
function formatPct(value, digits = 2) {
	if (!Number.isFinite(value)) return "—";
	return `${value > 0 ? "+" : ""}${formatNumber(value * 100, digits)}%`;
}
function formatTick(t, range) {
	const d = new Date(t);
	if (range === "1D") return d.toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit"
	});
	if (range === "1W") return d.toLocaleDateString("en-US", {
		weekday: "short",
		hour: "numeric"
	});
	return d.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric"
	});
}
function CandleLayer(props) {
	const xAxis = props.xAxisMap ? Object.values(props.xAxisMap)[0] : void 0;
	const yAxis = props.yAxisMap ? Object.values(props.yAxisMap)[0] : void 0;
	if (!xAxis || !yAxis || props.candles.length === 0) return null;
	const slot = props.candles.length > 1 ? Math.abs(xAxis.scale(props.candles[1].t) - xAxis.scale(props.candles[0].t)) : 8;
	const w = Math.max(2, Math.min(9, slot * .55));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", { children: props.candles.map((c) => {
		const x = xAxis.scale(c.t);
		const color = c.c >= c.o ? "var(--color-gain)" : "var(--color-loss)";
		const top = Math.min(yAxis.scale(c.o), yAxis.scale(c.c));
		const body = Math.max(1, Math.abs(yAxis.scale(c.c) - yAxis.scale(c.o)));
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: x,
			x2: x,
			y1: yAxis.scale(c.h),
			y2: yAxis.scale(c.l),
			stroke: color,
			strokeWidth: 1
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			x: x - w / 2,
			y: top,
			width: w,
			height: body,
			fill: color
		})] }, c.t);
	}) });
}
function PriceChart({ candles, forecast, currency, range = "1Y", style = "line" }) {
	const points = (range === "1Y" && style === "line" ? candles.slice(-90) : candles).map((c) => ({
		t: c.t,
		o: c.o,
		h: c.h,
		l: c.l,
		c: c.c,
		actual: c.c
	}));
	if (forecast && points.length) {
		const last = points[points.length - 1];
		points[points.length - 1] = {
			...last,
			forecast: last.c
		};
		for (const p of forecast.path) points.push({
			t: last.t + p.day * 864e5,
			o: p.price,
			h: p.price,
			l: p.price,
			c: p.price,
			forecast: p.price
		});
	}
	const plotted = style === "candle" ? points.filter((p) => p.actual != null) : points;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-64 w-full sm:h-80",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ComposedChart, {
				data: points,
				margin: {
					top: 8,
					right: 8,
					left: 0,
					bottom: 0
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
						id: "fillActual",
						x1: "0",
						y1: "0",
						x2: "0",
						y2: "1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "0%",
							stopColor: "var(--color-chart)",
							stopOpacity: .28
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "100%",
							stopColor: "var(--color-chart)",
							stopOpacity: 0
						})]
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
						stroke: "var(--color-grid)",
						vertical: false
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
						dataKey: "t",
						tickFormatter: (v) => formatTick(Number(v), range),
						tick: {
							fill: "var(--color-subtle)",
							fontSize: 11
						},
						axisLine: false,
						tickLine: false,
						minTickGap: 28
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
						domain: ["auto", "auto"],
						dataKey: "c",
						tickFormatter: (v) => Number(v).toLocaleString("en-US", { maximumFractionDigits: 0 }),
						tick: {
							fill: "var(--color-subtle)",
							fontSize: 11
						},
						axisLine: false,
						tickLine: false,
						width: 52
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
						contentStyle: {
							background: "var(--color-elevated)",
							border: "1px solid var(--color-border)",
							borderRadius: 8,
							fontSize: 12,
							color: "var(--color-foreground)"
						},
						labelFormatter: (v) => range === "1D" || range === "1W" ? new Date(Number(v)).toLocaleString("en-US", {
							month: "short",
							day: "numeric",
							hour: "numeric",
							minute: "2-digit"
						}) : new Date(Number(v)).toLocaleDateString("en-US", {
							month: "short",
							day: "numeric",
							year: "numeric"
						}),
						formatter: (value, name) => {
							if (name === "forecast") return [formatMoney(Number(value), currency), "Forecast"];
							if (name === "actual" || name === "c") return [formatMoney(Number(value), currency), "Close"];
							return [formatMoney(Number(value), currency), String(name)];
						}
					}),
					style === "line" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
						type: "monotone",
						dataKey: "actual",
						stroke: "var(--color-chart)",
						fill: "url(#fillActual)",
						strokeWidth: 1.6,
						dot: false,
						connectNulls: false,
						isAnimationActive: false
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Customized, { component: (raw) => {
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CandleLayer, {
							...raw ?? {},
							candles: plotted
						});
					} }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
						type: "monotone",
						dataKey: "forecast",
						stroke: "var(--color-accent)",
						strokeDasharray: "4 4",
						strokeWidth: 1.6,
						dot: false,
						connectNulls: true,
						isAnimationActive: false
					})
				]
			})
		})
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[opacity,transform,background-color,color,border-color] duration-[var(--motion-quick)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]", {
	variants: {
		variant: {
			default: "bg-accent text-accent-foreground hover:opacity-90",
			secondary: "bg-elevated text-foreground border border-border hover:border-border-strong",
			ghost: "text-muted hover:text-foreground hover:bg-elevated",
			outline: "border border-border bg-transparent hover:bg-elevated"
		},
		size: {
			default: "h-11 rounded-[var(--radius-sm)] px-4 text-sm",
			sm: "h-9 rounded-[var(--radius-xs)] px-3 text-sm",
			icon: "size-11 rounded-[var(--radius-sm)]"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
function Input({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn("h-11 w-full rounded-[var(--radius-sm)] border border-border bg-elevated px-3 text-sm text-foreground placeholder:text-subtle", "transition-[border-color,box-shadow] duration-[var(--motion-quick)]", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className),
		...props
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var CHART_RANGES = [
	"1D",
	"1W",
	"1M",
	"3M",
	"1Y"
];
/** Liquid names quoted live for gainers, losers, and most-active. */
var BOARD = [
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
	"AMD"
];
var fetchQuoteBundle = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("165c8c7d1b1302128302346993c8b4e3aca297ee51230c7cdea2882cc56dc925"));
var fetchChart = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("11b2e9f6090e34ea4cca52560bded20defa3707b2fb20dd7133db960bb90d972"));
var fetchCharts = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("d3f4d1e032bd334d01cf7a63c3b5f8ec619ee272b284db198d1e0e8c83fb6015"));
var fetchMarketOverview = createServerFn({ method: "POST" }).handler(createSsrRpc("fc815e5644405810182412ae1a21ce6a9631c588befda1895470ea659be41c2f"));
var searchTickers = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("4d70ceadd7bc3d3d8b056f2fb28f9c8ebfb53a9c28892d40bf6438745b4ae850"));
var fetchProfile = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("b7056b6fe563adf9182ad5e165f06180a751f5aa5a13cd759c202bb4bd498123"));
var fetchWatchQuotes = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("a4093e02d189c2fc3e9f72c9ded39a1f6235470aa0f3c27fa3341ad3133bd80a"));
var explainForecast = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("9897c6d734ad9c62bedcb29b889b8782609585e9f6ee757e2ba0927f3a53889e"));
function pct(pnl, cost) {
	return cost > 0 ? pnl / cost : 0;
}
function calculatePnL(details) {
	const { quantity, buyPrice, currentPrice, projectedPrice } = details;
	if (!Number.isFinite(quantity) || quantity <= 0) return null;
	if (!Number.isFinite(buyPrice) || buyPrice < 0) return null;
	if (!Number.isFinite(currentPrice) || !Number.isFinite(projectedPrice)) return null;
	const cost = quantity * buyPrice;
	const currentValue = quantity * currentPrice;
	const projectedValue = quantity * projectedPrice;
	const target = details.targetPrice != null && Number.isFinite(details.targetPrice) && details.targetPrice > 0 ? details.targetPrice : null;
	const targetValue = target != null ? quantity * target : null;
	const currentPnl = currentValue - cost;
	const projectedPnl = projectedValue - cost;
	return {
		cost,
		currentValue,
		currentPnl,
		currentPct: pct(currentPnl, cost),
		projectedValue,
		projectedPnl,
		projectedPct: pct(projectedPnl, cost),
		targetValue,
		targetPnl: targetValue != null ? targetValue - cost : null,
		targetPct: targetValue != null ? pct(targetValue - cost, cost) : null,
		breakEven: buyPrice,
		perShareNow: currentPrice - buyPrice,
		perShareProjected: projectedPrice - buyPrice
	};
}
function mean(xs) {
	return xs.reduce((a, b) => a + b, 0) / xs.length;
}
function stdev(xs) {
	if (xs.length < 2) return 0;
	const m = mean(xs);
	const v = xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1);
	return Math.sqrt(v);
}
function smaAt(xs, n) {
	if (xs.length < n) return null;
	return mean(xs.slice(xs.length - n));
}
function emaSeries(xs, n) {
	const k = 2 / (n + 1);
	const out = [];
	let e = mean(xs.slice(0, Math.min(n, xs.length)));
	for (let i = 0; i < xs.length; i++) {
		e = i === 0 ? xs[0] : xs[i] * k + e * (1 - k);
		out.push(e);
	}
	return out;
}
function rsi(xs, n = 14) {
	if (xs.length < n + 1) return null;
	let gains = 0;
	let losses = 0;
	const start = xs.length - n;
	for (let i = start; i < xs.length; i++) {
		const d = xs[i] - xs[i - 1];
		if (d >= 0) gains += d;
		else losses -= d;
	}
	const ag = gains / n;
	const al = losses / n;
	if (al === 0) return 100;
	return 100 - 100 / (1 + ag / al);
}
function linreg(xs) {
	const n = xs.length;
	if (n < 3) return {
		slope: 0,
		intercept: xs[0] ?? 0,
		r2: 0
	};
	let sx = 0;
	let sy = 0;
	let sxy = 0;
	let sx2 = 0;
	for (let i = 0; i < n; i++) {
		sx += i;
		sy += xs[i];
		sxy += i * xs[i];
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
		ssTot += (xs[i] - yMean) ** 2;
		ssRes += (xs[i] - yhat) ** 2;
	}
	return {
		slope,
		intercept,
		r2: ssTot === 0 ? 0 : Math.max(0, 1 - ssRes / ssTot)
	};
}
function clamp(n, a, b) {
	return Math.min(b, Math.max(a, n));
}
function last(xs) {
	return xs[xs.length - 1];
}
/**
* Ensemble of classical signals used in the literature:
* linear trend, EMA momentum / MACD, RSI mean-reversion, SMA regime, Bollinger pull.
* Not a neural net — fast, inspectable, and honest about recent walk-forward accuracy.
*/
function buildForecast(candles, horizon = 7) {
	const valid = candles.filter((c) => Number.isFinite(c.c) && c.c > 0);
	if (valid.length < 40) return null;
	const closes = valid.map((c) => c.c);
	const volumes = valid.map((c) => c.v);
	const lastClose = last(closes);
	const { slope, r2 } = linreg(closes.slice(-60));
	const sma20 = smaAt(closes, 20);
	const sma50 = smaAt(closes, 50);
	smaAt(closes, 10);
	const ema12s = emaSeries(closes, 12);
	const ema26s = emaSeries(closes, 26);
	const ema12 = last(ema12s);
	const ema26 = last(ema26s);
	const macdLine = ema12s.map((e, i) => e - ema26s[i]);
	const signalSeries = emaSeries(macdLine.slice(-40), 9);
	const macd = last(macdLine);
	const macdSignal = last(signalSeries) ?? macd;
	const rsi14 = rsi(closes, 14);
	const recent = closes.slice(-20);
	const mid = mean(recent);
	const sd = stdev(recent);
	const bbUpper = mid + 2 * sd;
	const bbLower = mid - 2 * sd;
	const mom10 = closes.length > 10 ? lastClose / closes[closes.length - 11] - 1 : 0;
	const vol20 = mean(volumes.slice(-20));
	const vol5 = mean(volumes.slice(-5));
	const volumeRatio = vol20 > 0 ? vol5 / vol20 : 1;
	const votes = [];
	const trendScore = clamp(slope / lastClose * 40, -1, 1);
	votes.push({
		name: "Linear trend (60d)",
		score: trendScore,
		note: slope >= 0 ? `Upward drift ${(slope / lastClose * 100).toFixed(2)}% per session` : `Downward drift ${(slope / lastClose * 100).toFixed(2)}% per session`
	});
	const emaScore = clamp((ema12 - ema26) / lastClose * 25, -1, 1);
	votes.push({
		name: "EMA 12/26 momentum",
		score: emaScore,
		note: ema12 >= ema26 ? "Short EMA above long EMA" : "Short EMA below long EMA"
	});
	const macdScore = clamp((macd - macdSignal) / lastClose * 80, -1, 1);
	votes.push({
		name: "MACD histogram",
		score: macdScore,
		note: macd >= macdSignal ? "MACD above signal" : "MACD below signal"
	});
	let rsiScore = 0;
	if (rsi14 != null) {
		if (rsi14 >= 70) rsiScore = -.7 - (rsi14 - 70) / 60;
		else if (rsi14 <= 30) rsiScore = .7 + (30 - rsi14) / 60;
		else rsiScore = (50 - rsi14) / 50;
		rsiScore = clamp(rsiScore, -1, 1);
	}
	votes.push({
		name: "RSI mean-reversion",
		score: rsiScore,
		note: rsi14 == null ? "Insufficient history" : rsi14 >= 70 ? `Overbought (${rsi14.toFixed(0)})` : rsi14 <= 30 ? `Oversold (${rsi14.toFixed(0)})` : `Neutral RSI ${rsi14.toFixed(0)}`
	});
	let smaScore = 0;
	let smaNote = "Need 50 sessions";
	if (sma20 && sma50) {
		smaScore = clamp((sma20 - sma50) / lastClose * 12, -1, 1);
		if (lastClose > sma20) smaScore += .15;
		else smaScore -= .15;
		smaScore = clamp(smaScore, -1, 1);
		smaNote = `${sma20 >= sma50 ? "SMA20 above SMA50" : "SMA20 below SMA50"}; ${lastClose >= sma20 ? "price above SMA20" : "price below SMA20"}`;
	}
	votes.push({
		name: "SMA 20/50 regime",
		score: smaScore,
		note: smaNote
	});
	const bbPos = sd > 0 ? (lastClose - mid) / (2 * sd) : 0;
	const bbScore = clamp(-bbPos * .8, -1, 1);
	votes.push({
		name: "Bollinger pull",
		score: bbScore,
		note: bbPos > .8 ? "Near upper band — fade bias" : bbPos < -.8 ? "Near lower band — bounce bias" : "Inside the envelope"
	});
	const momScore = clamp(mom10 * 8, -1, 1);
	votes.push({
		name: "10-day momentum",
		score: momScore,
		note: `10-session return ${((mom10 || 0) * 100).toFixed(2)}%`
	});
	const weights = [
		.22,
		.16,
		.14,
		.14,
		.14,
		.1,
		.1
	];
	let blended = 0;
	votes.forEach((v, i) => {
		blended += v.score * (weights[i] ?? .1);
	});
	blended *= volumeRatio >= 1 ? 1.05 : .95;
	blended = clamp(blended, -1, 1);
	const expectedDailyReturn = clamp(blended * .008 + slope / lastClose * .25, -.035, .035);
	const path = [];
	for (let d = 1; d <= horizon; d++) {
		const r = expectedDailyReturn * (1 - d * .04);
		path.push({
			day: d,
			price: lastClose * (1 + r * d)
		});
	}
	const nextClose = path[0]?.price ?? lastClose;
	const direction = expectedDailyReturn > 8e-4 ? "bullish" : expectedDailyReturn < -8e-4 ? "bearish" : "neutral";
	const agree = votes.filter((v) => direction === "bullish" ? v.score > .05 : direction === "bearish" ? v.score < -.05 : Math.abs(v.score) < .2).length;
	return {
		lastClose,
		nextClose,
		expectedDailyReturn,
		direction,
		confidence: clamp(.28 + r2 * .35 + agree / votes.length * .32, .22, .86),
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
		backtest: walkForward(closes)
	};
}
function walkForward(closes) {
	const lookback = 40;
	const start = Math.max(lookback, closes.length - 40);
	let hits = 0;
	let n = 0;
	let ape = 0;
	for (let i = start; i < closes.length - 1; i++) {
		const window = closes.slice(i - lookback, i);
		const { slope } = linreg(window);
		const last = window[window.length - 1];
		const pred = last + slope;
		const actual = closes[i];
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
		mape: n ? ape / n : 0
	};
}
var DEFAULT_WATCH = [
	"AAPL",
	"MSFT",
	"NVDA",
	"TSLA"
];
function uid() {
	return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
var useDesk = create()(persist((set, get) => ({
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
		set((s) => ({ watchlist: s.watchlist.includes(next) ? s.watchlist : [next, ...s.watchlist].slice(0, 24) }));
	},
	removeWatch: (symbol) => set((s) => ({ watchlist: s.watchlist.filter((x) => x !== symbol) })),
	recordHistory: (symbol) => set((s) => ({ history: [symbol, ...s.history.filter((x) => x !== symbol)].slice(0, 30) })),
	clearHistory: () => set({ history: [] }),
	setTheme: (theme) => set({ theme }),
	addHolding: (holding) => {
		const symbol = holding.symbol.trim().toUpperCase();
		if (!symbol || holding.quantity <= 0 || holding.cost < 0) return;
		set((s) => ({ portfolio: [{
			id: uid(),
			symbol,
			quantity: holding.quantity,
			cost: holding.cost
		}, ...s.portfolio].slice(0, 40) }));
		get().addWatch(symbol);
	},
	removeHolding: (id) => set((s) => ({ portfolio: s.portfolio.filter((h) => h.id !== id) })),
	addAlert: (alert) => {
		const symbol = alert.symbol.trim().toUpperCase();
		if (!symbol || !Number.isFinite(alert.target) || alert.target <= 0) return;
		set((s) => ({ alerts: [{
			id: uid(),
			symbol,
			op: alert.op,
			target: alert.target,
			triggeredAt: null
		}, ...s.alerts].slice(0, 40) }));
	},
	removeAlert: (id) => set((s) => ({ alerts: s.alerts.filter((a) => a.id !== id) })),
	markAlert: (id) => set((s) => ({ alerts: s.alerts.map((a) => a.id === id && !a.triggeredAt ? {
		...a,
		triggeredAt: Date.now()
	} : a) })),
	resetAlert: (id) => set((s) => ({ alerts: s.alerts.map((a) => a.id === id ? {
		...a,
		triggeredAt: null
	} : a) }))
}), {
	name: "nestinvest-desk",
	merge: (persisted, current) => {
		const p = persisted ?? {};
		return {
			...current,
			...p,
			watchlist: p.watchlist?.length ? p.watchlist : current.watchlist,
			history: p.history ?? [],
			theme: p.theme === "light" ? "light" : "dark",
			portfolio: p.portfolio ?? [],
			alerts: p.alerts ?? []
		};
	}
}));
function Change({ value }) {
	const up = value >= 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("inline-flex items-center gap-1 font-mono text-sm tabular-nums", up ? "text-gain" : "text-loss"),
		children: [up ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDownRight, { className: "size-4" }), formatPct(value)]
	});
}
function MarketStrip() {
	const overview = useQuery({
		queryKey: ["market-overview"],
		queryFn: () => fetchMarketOverview(),
		staleTime: 6e4
	});
	if (!overview.data?.length) return null;
	const upCount = overview.data.filter((x) => x.change >= 0).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-[var(--radius-xl)] border border-border bg-card p-3 sm:p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-3 flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-xs tracking-[0.18em] text-subtle uppercase",
				children: "Market tape"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: upCount >= 3 ? "Broadly higher" : upCount <= 1 ? "Broadly lower" : "Mixed tape"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "-mx-1 flex gap-2 overflow-x-auto px-1 pb-1",
			children: overview.data.map((idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-32 shrink-0 rounded-[var(--radius-md)] bg-elevated px-3 py-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-subtle",
						children: idx.label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono mt-1 text-sm tabular-nums",
						children: formatNumber(idx.price, idx.price >= 1e3 ? 0 : 2)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Change, { value: idx.changePct })
				]
			}, idx.symbol))
		})]
	});
}
function MarketPanel({ onOpen }) {
	const overview = useQuery({
		queryKey: ["market-overview"],
		queryFn: () => fetchMarketOverview()
	});
	const board = useQuery({
		queryKey: ["board"],
		queryFn: () => fetchWatchQuotes({ data: { symbols: [...BOARD] } }),
		staleTime: 6e4
	});
	if (overview.isLoading && board.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-6 text-sm text-muted",
		children: "Reading the tape…"
	});
	const rows = overview.data ?? [];
	const up = rows.filter((r) => r.change >= 0).length;
	const names = board.data ?? [];
	const gainers = [...names].sort((a, b) => b.changePct - a.changePct).slice(0, 5);
	const losers = [...names].sort((a, b) => a.changePct - b.changePct).slice(0, 5);
	const active = [...names].sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0)).slice(0, 5);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6 space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					up,
					" of ",
					rows.length || "—",
					" major gauges are higher. VIX rising usually means more fear, not more reward. Movers are live quotes for a fixed liquid board, not a full-market scan."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "divide-y divide-border",
				children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex min-h-16 items-center justify-between gap-3 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm",
						children: row.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs text-subtle",
						children: row.symbol
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-right",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-sm tabular-nums",
							children: formatNumber(row.price, row.price >= 1e3 ? 0 : 2)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Change, { value: row.changePct })]
					})]
				}, row.symbol))
			}),
			board.isLoading && names.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Ranking the board…"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoverList, {
						title: "Top gainers",
						rows: gainers,
						onOpen
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoverList, {
						title: "Top losers",
						rows: losers,
						onOpen
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoverList, {
						title: "Most active",
						rows: active,
						onOpen,
						showVolume: true
					})
				]
			})
		]
	});
}
function MoverList({ title, rows, onOpen, showVolume }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-[var(--radius-md)] bg-elevated p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs tracking-wide text-subtle uppercase",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-2 divide-y divide-border",
			children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "flex min-h-11 w-full items-center justify-between gap-2 py-2 text-left",
				onClick: () => onOpen(row.symbol),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-sm",
					children: row.symbol
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-right",
					children: showVolume ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-xs text-muted tabular-nums",
						children: formatCompact(row.volume ?? 0)
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Change, { value: row.changePct })
				})]
			}) }, row.symbol))
		})]
	});
}
function WatchPanel({ quotes, loading, onOpen }) {
	const { watchlist, removeWatch } = useDesk();
	if (watchlist.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-6 text-sm text-subtle",
		children: "Save a ticker from the quote bar. It stays on this device."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6",
		children: [loading && quotes.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-3 text-sm text-muted",
			children: "Refreshing saved names…"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "divide-y divide-border",
			children: watchlist.map((s) => {
				const row = quotes.find((q) => q.symbol === s);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex min-h-14 items-center justify-between gap-3 py-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "min-w-0 flex-1 text-left",
							onClick: () => onOpen(s),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-sm",
								children: s
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-xs text-muted",
								children: row?.name ?? "—"
							})]
						}),
						row && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-right",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-sm tabular-nums",
								children: formatMoney(row.price, row.currency)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Change, { value: row.changePct })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "grid size-11 place-items-center text-subtle hover:text-foreground",
							onClick: () => removeWatch(s),
							"aria-label": `Remove ${s}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
						})
					]
				}, s);
			})
		})]
	});
}
function PortfolioPanel({ quotes, currentSymbol }) {
	const { portfolio, addHolding, removeHolding } = useDesk();
	const [symbol, setSymbol] = (0, import_react.useState)(currentSymbol);
	const [qty, setQty] = (0, import_react.useState)("1");
	const [cost, setCost] = (0, import_react.useState)("");
	const rows = portfolio.map((h) => {
		const q = quotes.find((x) => x.symbol === h.symbol);
		const price = q?.price ?? 0;
		const value = h.quantity * price;
		const basis = h.quantity * h.cost;
		return {
			...h,
			name: q?.name,
			price,
			value,
			basis,
			pnl: value - basis,
			currency: q?.currency ?? "USD"
		};
	});
	const totalValue = rows.reduce((s, r) => s + r.value, 0);
	const totalBasis = rows.reduce((s, r) => s + r.basis, 0);
	const totalPnl = totalValue - totalBasis;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6 space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryCard, {
						label: "Market value",
						value: formatMoney(totalValue)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryCard, {
						label: "Cost basis",
						value: formatMoney(totalBasis)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-[var(--radius-md)] bg-elevated p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs tracking-wide text-subtle uppercase",
								children: "Unrealized"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: cn("font-mono mt-2 text-2xl tabular-nums", totalPnl >= 0 ? "text-gain" : "text-loss"),
								children: formatMoney(totalPnl)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: totalBasis ? formatPct(totalPnl / totalBasis) : "—"
							})
						]
					})
				]
			}),
			rows.some((r) => r.value > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid items-center gap-4 sm:grid-cols-[12rem_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-44",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
							data: rows.filter((r) => r.value > 0),
							dataKey: "value",
							nameKey: "symbol",
							innerRadius: 42,
							outerRadius: 68,
							paddingAngle: 2,
							isAnimationActive: false,
							children: rows.filter((r) => r.value > 0).map((row, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: SERIES[i % SERIES.length] }, row.id))
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
							formatter: (value, name) => [formatMoney(Number(value)), String(name)],
							contentStyle: {
								background: "var(--color-elevated)",
								border: "1px solid var(--color-border)",
								borderRadius: 8,
								fontSize: 12,
								color: "var(--color-foreground)"
							}
						})] })
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-1 text-sm",
					children: rows.filter((r) => r.value > 0).map((row, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "size-2 rounded-full",
								style: { background: SERIES[i % SERIES.length] }
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono",
								children: row.symbol
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-xs text-muted tabular-nums",
							children: totalValue ? formatPct(row.value / totalValue, 1) : "—"
						})]
					}, row.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-2 sm:grid-cols-4",
				onSubmit: (e) => {
					e.preventDefault();
					const quantity = Number(qty);
					const buy = Number(cost);
					if (!Number.isFinite(quantity) || !Number.isFinite(buy)) {
						toast.message("Enter quantity and purchase price.");
						return;
					}
					addHolding({
						symbol,
						quantity,
						cost: buy
					});
					toast.message(`Booked ${symbol}`);
					setQty("1");
					setCost("");
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: symbol,
						onChange: (e) => setSymbol(e.target.value.toUpperCase()),
						placeholder: "Ticker",
						"aria-label": "Holding ticker"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: qty,
						onChange: (e) => setQty(e.target.value),
						placeholder: "Shares",
						inputMode: "decimal",
						"aria-label": "Quantity"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: cost,
						onChange: (e) => setCost(e.target.value),
						placeholder: "Buy price",
						inputMode: "decimal",
						"aria-label": "Purchase price"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "submit",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "Add lot"]
					})
				]
			}),
			rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-subtle",
				children: "Enter a ticker, share count, and what you paid. Values update from live quotes."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "divide-y divide-border",
				children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex min-h-16 items-center justify-between gap-3 py-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-sm",
								children: row.symbol
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted",
								children: [
									formatNumber(row.quantity, 2),
									" × ",
									formatMoney(row.cost, row.currency)
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-right",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-sm tabular-nums",
								children: formatMoney(row.value, row.currency)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: cn("font-mono text-xs tabular-nums", row.pnl >= 0 ? "text-gain" : "text-loss"),
								children: [
									formatMoney(row.pnl, row.currency),
									" ",
									row.basis ? formatPct(row.pnl / row.basis) : ""
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "grid size-11 place-items-center text-subtle hover:text-foreground",
							onClick: () => removeHolding(row.id),
							"aria-label": `Remove ${row.symbol}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
						})
					]
				}, row.id))
			})
		]
	});
}
function SummaryCard({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-[var(--radius-md)] bg-elevated p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs tracking-wide text-subtle uppercase",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-mono mt-2 text-2xl tabular-nums",
			children: value
		})]
	});
}
function PnLPanel({ currentSymbol, onOpen }) {
	const [symbol, setSymbol] = (0, import_react.useState)(currentSymbol);
	const [qty, setQty] = (0, import_react.useState)("10");
	const [buy, setBuy] = (0, import_react.useState)("");
	const [target, setTarget] = (0, import_react.useState)("");
	const [horizon, setHorizon] = (0, import_react.useState)(7);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [result, setResult] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		setSymbol(currentSymbol);
	}, [currentSymbol]);
	async function onSubmit(e) {
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
			const forecast = buildForecast(bundle.candles, horizon);
			if (!forecast) throw new Error("Not enough price history to forecast that stock.");
			const projected = forecast.path.find((p) => p.day === horizon)?.price ?? forecast.path.at(-1)?.price ?? bundle.quote.price;
			const pnl = calculatePnL({
				quantity,
				buyPrice,
				currentPrice: bundle.quote.price,
				projectedPrice: projected,
				targetPrice
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
				pnl
			});
		} catch (err) {
			setResult(null);
			setError(err instanceof Error ? err.message : "Could not load that stock.");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6 space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-lg tracking-tight",
				children: "Profit and loss"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 max-w-prose text-sm text-muted",
				children: "Pick a stock and enter the lot: shares and the price you paid. The desk prices the lot at the live quote, then at the technical forecast for the horizon you choose."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-2 sm:grid-cols-2 lg:grid-cols-6",
				onSubmit,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: symbol,
						onChange: (e) => setSymbol(e.target.value.toUpperCase()),
						placeholder: "Ticker",
						"aria-label": "Profit and loss ticker",
						className: "lg:col-span-1"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: qty,
						onChange: (e) => setQty(e.target.value),
						placeholder: "Shares",
						inputMode: "decimal",
						"aria-label": "Share count"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: buy,
						onChange: (e) => setBuy(e.target.value),
						placeholder: "Buy price",
						inputMode: "decimal",
						"aria-label": "Buy price"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: target,
						onChange: (e) => setTarget(e.target.value),
						placeholder: "Target (optional)",
						inputMode: "decimal",
						"aria-label": "Target price"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex h-11 items-center gap-2 rounded-[var(--radius-sm)] border border-border bg-elevated px-3 text-sm text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "shrink-0",
							children: "Days"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "number",
							min: 1,
							max: 20,
							value: horizon,
							onChange: (e) => setHorizon(Math.min(20, Math.max(1, Number(e.target.value) || 1))),
							className: "w-full bg-transparent font-mono text-foreground outline-none",
							"aria-label": "Forecast horizon in days"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "submit",
						disabled: busy,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calculator, { className: "size-4" }), busy ? "Working" : "Calculate"]
					})
				]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-loss",
				children: error
			}),
			!result && !error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-subtle",
				children: "Example: AAPL, 10 shares, buy price 180. Leave target blank to use only the forecast."
			}),
			result && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-foreground",
								children: symbol
							}),
							" · ",
							result.name,
							". Live",
							" ",
							formatMoney(result.currentPrice, result.currency),
							". Forecast in ",
							result.days,
							" ",
							"session",
							result.days === 1 ? "" : "s",
							" is",
							" ",
							formatMoney(result.projectedPrice, result.currency),
							" (",
							result.direction,
							",",
							" ",
							Math.round(result.confidence * 100),
							"% confidence)."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryCard, {
								label: "Cost",
								value: formatMoney(result.pnl.cost, result.currency)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PnLCard, {
								label: "If sold now",
								money: formatMoney(result.pnl.currentPnl, result.currency),
								extra: `${formatPct(result.pnl.currentPct)} · ${formatMoney(result.pnl.perShareNow, result.currency)} / share`,
								positive: result.pnl.currentPnl >= 0
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PnLCard, {
								label: `Forecast, ${result.days}d`,
								money: formatMoney(result.pnl.projectedPnl, result.currency),
								extra: `${formatPct(result.pnl.projectedPct)} · ${formatMoney(result.pnl.perShareProjected, result.currency)} / share`,
								positive: result.pnl.projectedPnl >= 0
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "grid grid-cols-2 gap-3 text-sm sm:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatLine, {
								label: "Value now",
								value: formatMoney(result.pnl.currentValue, result.currency)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatLine, {
								label: "Forecast value",
								value: formatMoney(result.pnl.projectedValue, result.currency)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatLine, {
								label: "Break-even",
								value: formatMoney(result.pnl.breakEven, result.currency)
							}),
							result.pnl.targetPnl != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatLine, {
								label: "At your target",
								value: `${formatMoney(result.pnl.targetPnl, result.currency)} (${formatPct(result.pnl.targetPct ?? 0)})`,
								tone: result.pnl.targetPnl >= 0 ? "gain" : "loss"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatLine, {
								label: "At your target",
								value: "—"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-subtle",
						children: "A statistical sketch from the same indicator ensemble as Predict. Not a guarantee and not investment advice."
					})
				]
			})
		]
	});
}
function PnLCard({ label, money, extra, positive }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-[var(--radius-md)] bg-elevated p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs tracking-wide text-subtle uppercase",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn("font-mono mt-2 text-2xl tabular-nums", positive ? "text-gain" : "text-loss"),
				children: money
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 font-mono text-sm text-muted tabular-nums",
				children: extra
			})
		]
	});
}
function StatLine({ label, value, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
		className: "text-xs tracking-wide text-subtle uppercase",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
		className: cn("font-mono mt-1 tabular-nums", tone === "gain" && "text-gain", tone === "loss" && "text-loss"),
		children: value
	})] });
}
var SERIES = [
	"var(--color-series-a)",
	"var(--color-series-b)",
	"var(--color-series-c)"
];
function ComparePanel({ seed }) {
	const [tickers, setTickers] = (0, import_react.useState)(() => {
		const base = seed.toUpperCase();
		return base === "MSFT" ? ["MSFT", "AAPL"] : [base, "MSFT"];
	});
	const [draft, setDraft] = (0, import_react.useState)("");
	const [range, setRange] = (0, import_react.useState)("3M");
	const charts = useQuery({
		queryKey: [
			"compare",
			tickers.join(","),
			range
		],
		queryFn: () => fetchCharts({ data: {
			symbols: tickers,
			range
		} }),
		enabled: tickers.length >= 1
	});
	const series = (0, import_react.useMemo)(() => {
		const rows = charts.data ?? [];
		if (!rows.length) return [];
		const maps = rows.map((r) => {
			const first = r.candles.find((c) => c.c > 0)?.c ?? 1;
			return {
				symbol: r.quote.symbol,
				quote: r.quote,
				byT: new Map(r.candles.map((c) => [c.t, (c.c / first - 1) * 100]))
			};
		});
		return [...new Set(rows.flatMap((r) => r.candles.map((c) => c.t)))].sort((a, b) => a - b).map((t) => {
			const point = { t };
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
		setTickers((list) => list.includes(next) ? list : [...list, next].slice(0, 3));
		setDraft("");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6 space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex flex-col gap-2 sm:flex-row",
				onSubmit: (e) => {
					e.preventDefault();
					addTicker();
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: draft,
					onChange: (e) => setDraft(e.target.value),
					placeholder: "Add a ticker to compare",
					"aria-label": "Compare ticker"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					children: "Compare"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-1.5",
				children: tickers.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setTickers((list) => list.filter((x) => x !== s)),
					className: "inline-flex h-8 items-center gap-2 rounded-full border border-border px-3 font-mono text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "size-2 rounded-full",
							style: { background: SERIES[i % SERIES.length] }
						}),
						s,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3" })
					]
				}, s))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-1.5",
				children: CHART_RANGES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setRange(r),
					className: cn("h-8 rounded-full border px-3 font-mono text-xs", range === r ? "border-border-strong bg-elevated text-foreground" : "border-border text-muted hover:text-foreground"),
					children: r
				}, r))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-64 sm:h-80",
				children: charts.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Overlaying paths…"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
					width: "100%",
					height: "100%",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
						data: series,
						margin: {
							top: 8,
							right: 8,
							left: 0,
							bottom: 0
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
								stroke: "var(--color-grid)",
								vertical: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
								dataKey: "t",
								tickFormatter: (v) => new Date(Number(v)).toLocaleDateString("en-US", {
									month: "short",
									day: "numeric"
								}),
								tick: {
									fill: "var(--color-subtle)",
									fontSize: 11
								},
								axisLine: false,
								tickLine: false,
								minTickGap: 28
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
								tickFormatter: (v) => `${Number(v).toFixed(0)}%`,
								tick: {
									fill: "var(--color-subtle)",
									fontSize: 11
								},
								axisLine: false,
								tickLine: false,
								width: 44
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
								contentStyle: {
									background: "var(--color-elevated)",
									border: "1px solid var(--color-border)",
									borderRadius: 8,
									fontSize: 12,
									color: "var(--color-foreground)"
								},
								formatter: (value, name) => [`${Number(value).toFixed(2)}%`, String(name)],
								labelFormatter: (v) => new Date(Number(v)).toLocaleDateString("en-US", {
									month: "short",
									day: "numeric",
									year: "numeric"
								})
							}),
							tickers.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
								type: "monotone",
								dataKey: s,
								stroke: SERIES[i % SERIES.length],
								strokeWidth: 1.7,
								dot: false,
								connectNulls: true,
								isAnimationActive: false
							}, s))
						]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "text-xs tracking-wide text-subtle uppercase",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "pb-2 font-medium",
								children: "Name"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "pb-2 font-medium",
								children: "Price"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "pb-2 font-medium",
								children: "Day"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "pb-2 font-medium",
								children: "Volume"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "pb-2 font-medium",
								children: "52w"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: (charts.data ?? []).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "py-2.5 pr-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-mono text-sm",
									children: row.quote.symbol
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: row.quote.name
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "font-mono py-2.5 pr-3 tabular-nums",
								children: formatMoney(row.quote.price, row.quote.currency)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-2.5 pr-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Change, { value: row.quote.changePct })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "font-mono py-2.5 pr-3 tabular-nums",
								children: formatCompact(row.quote.volume ?? 0)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "font-mono py-2.5 text-xs tabular-nums text-muted",
								children: [
									formatMoney(row.quote.low52 ?? 0, row.quote.currency),
									" –",
									" ",
									formatMoney(row.quote.high52 ?? 0, row.quote.currency)
								]
							})
						]
					}, row.quote.symbol)) })]
				})
			})
		]
	});
}
function AlertsPanel({ currentSymbol, currentPrice }) {
	const { alerts, addAlert, removeAlert, resetAlert } = useDesk();
	const [symbol, setSymbol] = (0, import_react.useState)(currentSymbol);
	const [target, setTarget] = (0, import_react.useState)("");
	const [op, setOp] = (0, import_react.useState)("above");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6 space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: ["When a live quote crosses your level, NestInvest toasts on this device.", currentPrice != null ? ` ${currentSymbol} is ${formatMoney(currentPrice)}.` : ""]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-2 sm:grid-cols-4",
				onSubmit: (e) => {
					e.preventDefault();
					const price = Number(target);
					addAlert({
						symbol,
						op,
						target: price
					});
					toast.message(`${symbol} alert set ${op} ${formatMoney(price)}`);
					setTarget("");
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: symbol,
						onChange: (e) => setSymbol(e.target.value.toUpperCase()),
						placeholder: "Ticker",
						"aria-label": "Alert ticker"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: op === "above" ? "default" : "secondary",
							onClick: () => setOp("above"),
							children: "Above"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: op === "below" ? "default" : "secondary",
							onClick: () => setOp("below"),
							children: "Below"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: target,
						onChange: (e) => setTarget(e.target.value),
						placeholder: "Target price",
						inputMode: "decimal",
						"aria-label": "Target price"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "submit",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "Watch level"]
					})
				]
			}),
			alerts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-subtle",
				children: "No price levels yet."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "divide-y divide-border",
				children: alerts.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex min-h-14 items-center justify-between gap-3 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-sm",
						children: [
							a.symbol,
							" ",
							a.op,
							" ",
							formatMoney(a.target)
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: a.triggeredAt ? `Hit ${new Date(a.triggeredAt).toLocaleString()}` : "Armed"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center",
						children: [a.triggeredAt && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "grid size-11 place-items-center text-subtle hover:text-foreground",
							onClick: () => resetAlert(a.id),
							"aria-label": "Reset alert",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "grid size-11 place-items-center text-subtle hover:text-foreground",
							onClick: () => removeAlert(a.id),
							"aria-label": "Remove alert",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
						})]
					})]
				}, a.id))
			})
		]
	});
}
function NewsCards({ items, loading }) {
	const [source, setSource] = (0, import_react.useState)("All");
	const sources = ["All", ...new Set(items.map((n) => n.publisher).filter(Boolean))];
	const shown = source === "All" ? items : items.filter((n) => n.publisher === source);
	if (loading && items.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-6 text-sm text-muted",
		children: "Fetching headlines…"
	});
	if (items.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-6 text-sm text-subtle",
		children: "No recent headlines for this query."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6 space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex gap-1.5 overflow-x-auto pb-1",
			children: sources.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setSource(s),
				className: cn("h-9 shrink-0 rounded-full border px-3 text-xs", source === s ? "border-border-strong bg-elevated text-foreground" : "border-border text-muted hover:text-foreground"),
				children: s
			}, s))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "grid gap-3 sm:grid-cols-2",
			children: shown.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
				href: n.url,
				target: "_blank",
				rel: "noreferrer",
				className: "flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-elevated hover:border-border-strong",
				children: [n.thumbnail ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: n.thumbnail,
					alt: "",
					className: "h-36 w-full object-cover"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid h-28 place-items-center bg-card text-xs tracking-[0.18em] text-subtle uppercase",
					children: n.publisher
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-1 flex-col p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-subtle",
							children: [n.publisher, n.published ? ` · ${new Date(n.published).toLocaleDateString()}` : ""]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm leading-snug",
							children: n.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-auto pt-3 text-xs text-muted",
							children: "Open source"
						})
					]
				})]
			}) }, n.id))
		})]
	});
}
/** Max-heap. Higher score is dequeued first. */
var MaxHeap = class MaxHeap {
	a = [];
	static from(items) {
		const h = new MaxHeap();
		for (const item of items) h.insert(item);
		return h;
	}
	size() {
		return this.a.length;
	}
	peek() {
		return this.a[0] ?? null;
	}
	snapshot() {
		return this.a.map((x) => ({ ...x }));
	}
	insert(item) {
		this.a.push(item);
		this.siftUp(this.a.length - 1);
	}
	extract() {
		if (this.a.length === 0) return null;
		const top = this.a[0];
		const last = this.a.pop();
		if (this.a.length > 0) {
			this.a[0] = last;
			this.siftDown(0);
		}
		return top;
	}
	removeSymbol(symbol) {
		const i = this.a.findIndex((x) => x.symbol === symbol);
		if (i < 0) return false;
		const last = this.a.pop();
		if (i < this.a.length) {
			this.a[i] = last;
			this.siftDown(i);
			this.siftUp(i);
		}
		return true;
	}
	siftUp(i) {
		while (i > 0) {
			const p = i - 1 >> 1;
			if (this.a[p].score >= this.a[i].score) break;
			this.swap(p, i);
			i = p;
		}
	}
	siftDown(i) {
		const n = this.a.length;
		while (true) {
			let best = i;
			const l = i * 2 + 1;
			const r = l + 1;
			if (l < n && this.a[l].score > this.a[best].score) best = l;
			if (r < n && this.a[r].score > this.a[best].score) best = r;
			if (best === i) break;
			this.swap(i, best);
			i = best;
		}
	}
	swap(i, j) {
		const t = this.a[i];
		this.a[i] = this.a[j];
		this.a[j] = t;
	}
};
/** Rank movers: large moves, heavy volume, and wide daily swings score higher. */
function alertScore(changePct, volume) {
	const move = Math.abs(changePct);
	const vol = Math.log10(Math.max(volume, 1));
	return move * 70 + vol * 1.4 + move * vol * 4;
}
/** Separate chaining. Capacity stays small so collisions are visible. */
var TickerHash = class {
	capacity;
	buckets;
	constructor(capacity = 7) {
		this.capacity = capacity;
		this.buckets = Array.from({ length: capacity }, () => []);
	}
	hash(key) {
		let h = 0;
		for (let i = 0; i < key.length; i++) h = h * 31 + key.charCodeAt(i) >>> 0;
		return h % this.capacity;
	}
	insert(row) {
		const bucket = this.hash(row.symbol);
		const chain = this.buckets[bucket];
		const existing = chain.findIndex((x) => x.symbol === row.symbol);
		if (existing >= 0) chain[existing] = row;
		else chain.push(row);
		return {
			action: "insert",
			key: row.symbol,
			bucket,
			chain: chain.map((x) => x.symbol),
			found: true,
			collisions: Math.max(0, chain.length - 1)
		};
	}
	search(symbol) {
		const key = symbol.trim().toUpperCase();
		const bucket = this.hash(key);
		const chain = this.buckets[bucket] ?? [];
		const found = chain.some((x) => x.symbol === key);
		return {
			action: "search",
			key,
			bucket,
			chain: chain.map((x) => x.symbol),
			found,
			collisions: Math.max(0, chain.length - 1)
		};
	}
	remove(symbol) {
		const key = symbol.trim().toUpperCase();
		const bucket = this.hash(key);
		const chain = this.buckets[bucket] ?? [];
		const i = chain.findIndex((x) => x.symbol === key);
		if (i >= 0) chain.splice(i, 1);
		return {
			action: "delete",
			key,
			bucket,
			chain: chain.map((x) => x.symbol),
			found: i >= 0,
			collisions: Math.max(0, chain.length - 1)
		};
	}
};
function loadHash(rows, capacity = 7) {
	const table = new TickerHash(capacity);
	return {
		table,
		ops: rows.map((row) => table.insert(row))
	};
}
function buildStockGraph(rows) {
	const symbols = rows.map((r) => r.symbol);
	const by = new Map(rows.map((r) => [r.symbol, r]));
	const edges = [];
	for (let i = 0; i < symbols.length; i++) for (let j = i + 1; j < symbols.length; j++) {
		const a = by.get(symbols[i]);
		const b = by.get(symbols[j]);
		const sameSector = a.sector === b.sector && a.sector !== "Other";
		const gap = Math.abs(a.changePct - b.changePct);
		const weight = Number((gap + (sameSector ? 0 : 1)).toFixed(4));
		edges.push({
			a: a.symbol,
			b: b.symbol,
			weight,
			sameSector
		});
	}
	const same = edges.filter((e) => e.sameSector);
	const cross = edges.filter((e) => !e.sameSector).sort((a, b) => a.weight - b.weight).slice(0, 6);
	const kept = [...same, ...cross];
	const adj = /* @__PURE__ */ new Map();
	for (const s of symbols) adj.set(s, []);
	for (const e of kept) {
		adj.get(e.a).push({
			to: e.b,
			weight: e.weight
		});
		adj.get(e.b).push({
			to: e.a,
			weight: e.weight
		});
	}
	for (const list of adj.values()) list.sort((x, y) => x.to.localeCompare(y.to));
	return {
		symbols,
		edges: kept,
		adj
	};
}
function bfs(adj, start) {
	if (!adj.has(start)) return [];
	const seen = /* @__PURE__ */ new Set([start]);
	const queue = [start];
	const order = [];
	const frames = [{
		current: start,
		bag: [...queue],
		order: [],
		seen: [...seen],
		note: `Enqueue ${start}`
	}];
	while (queue.length) {
		const u = queue.shift();
		order.push(u);
		frames.push({
			current: u,
			bag: [...queue],
			order: [...order],
			seen: [...seen],
			note: `Visit ${u}`
		});
		for (const { to } of adj.get(u) ?? []) {
			if (seen.has(to)) continue;
			seen.add(to);
			queue.push(to);
			frames.push({
				current: to,
				bag: [...queue],
				order: [...order],
				seen: [...seen],
				note: `Discover ${to} from ${u}`
			});
		}
	}
	return frames;
}
function dfs(adj, start) {
	if (!adj.has(start)) return [];
	const seen = /* @__PURE__ */ new Set();
	const stack = [start];
	const order = [];
	const frames = [];
	while (stack.length) {
		const u = stack.pop();
		if (seen.has(u)) continue;
		seen.add(u);
		order.push(u);
		const next = [...adj.get(u) ?? []].reverse();
		for (const { to } of next) if (!seen.has(to)) stack.push(to);
		frames.push({
			current: u,
			bag: [...stack],
			order: [...order],
			seen: [...seen],
			note: `Visit ${u}`
		});
	}
	return frames;
}
var DSU = class {
	parent;
	rank;
	constructor(n) {
		this.parent = Array.from({ length: n }, (_, i) => i);
		this.rank = Array(n).fill(0);
	}
	find(x) {
		let p = this.parent[x];
		if (p !== x) {
			p = this.find(p);
			this.parent[x] = p;
		}
		return p;
	}
	union(a, b) {
		let pa = this.find(a);
		let pb = this.find(b);
		if (pa === pb) return false;
		if (this.rank[pa] < this.rank[pb]) [pa, pb] = [pb, pa];
		this.parent[pb] = pa;
		if (this.rank[pa] === this.rank[pb]) this.rank[pa] += 1;
		return true;
	}
};
function kruskal(symbols, edges) {
	const index = new Map(symbols.map((s, i) => [s, i]));
	const sorted = [...edges].sort((a, b) => a.weight - b.weight || a.a.localeCompare(b.a));
	const dsu = new DSU(symbols.length);
	const chosen = [];
	const rejected = [];
	const frames = [];
	let total = 0;
	for (const edge of sorted) {
		const ia = index.get(edge.a);
		const ib = index.get(edge.b);
		if (ia == null || ib == null) continue;
		if (dsu.union(ia, ib)) {
			chosen.push(edge);
			total += edge.weight;
			frames.push({
				edge,
				accepted: true,
				chosen: [...chosen],
				rejected: [...rejected],
				total,
				note: `Take ${edge.a}–${edge.b} (${edge.weight})`
			});
		} else {
			rejected.push(edge);
			frames.push({
				edge,
				accepted: false,
				chosen: [...chosen],
				rejected: [...rejected],
				total,
				note: `Reject ${edge.a}–${edge.b}: cycle`
			});
		}
	}
	return frames;
}
var Stack = class {
	a = [];
	constructor(items = []) {
		this.a = [...items];
	}
	push(item) {
		this.a.push(item);
	}
	pop() {
		return this.a.pop() ?? null;
	}
	peek() {
		return this.a[this.a.length - 1] ?? null;
	}
	toArray() {
		return [...this.a].reverse();
	}
};
var Queue = class {
	a = [];
	enqueue(item) {
		this.a.push(item);
	}
	dequeue() {
		return this.a.shift() ?? null;
	}
	peek() {
		return this.a[0] ?? null;
	}
	toArray() {
		return [...this.a];
	}
};
/** Singly linked list of trades, kept in chronological order. */
var TxList = class TxList {
	head = null;
	static from(items) {
		const list = new TxList();
		for (const tx of items) list.insert(tx);
		return list;
	}
	insert(tx) {
		const node = {
			tx,
			next: null
		};
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
	remove(id) {
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
	find(query) {
		const q = query.trim().toUpperCase();
		let cur = this.head;
		while (cur) {
			if (cur.tx.symbol === q || cur.tx.name.toUpperCase().includes(q)) return cur.tx;
			cur = cur.next;
		}
		return null;
	}
	toArray() {
		const out = [];
		let cur = this.head;
		while (cur) {
			out.push(cur.tx);
			cur = cur.next;
		}
		return out;
	}
};
function linearSearch(rows, query) {
	const q = query.trim().toUpperCase();
	const steps = [];
	if (!q) return steps;
	let comparisons = 0;
	for (let i = 0; i < rows.length; i++) {
		comparisons += 1;
		const row = rows[i];
		const found = row.symbol === q || row.name.toUpperCase().includes(q);
		steps.push({
			index: i,
			symbol: row.symbol,
			comparisons,
			found,
			lo: 0,
			hi: rows.length - 1
		});
		if (found) break;
	}
	return steps;
}
function binarySearch(rows, query) {
	const q = query.trim().toUpperCase();
	const sorted = [...rows].sort((a, b) => a.symbol.localeCompare(b.symbol));
	const steps = [];
	if (!q) return {
		sorted,
		steps
	};
	let lo = 0;
	let hi = sorted.length - 1;
	let comparisons = 0;
	while (lo <= hi) {
		const mid = lo + hi >> 1;
		comparisons += 1;
		const symbol = sorted[mid].symbol;
		const cmp = symbol.localeCompare(q);
		steps.push({
			index: mid,
			symbol,
			comparisons,
			found: cmp === 0,
			lo,
			hi
		});
		if (cmp === 0) return {
			sorted,
			steps
		};
		if (cmp < 0) lo = mid + 1;
		else hi = mid - 1;
	}
	steps.push({
		index: -1,
		symbol: "",
		comparisons,
		found: false,
		lo,
		hi
	});
	return {
		sorted,
		steps
	};
}
function keyOf(row, key) {
	if (key === "price") return row.price;
	if (key === "changePct") return row.changePct;
	return row.volume;
}
function snap(items, highlight, note, comparisons, swaps) {
	return {
		values: items.map((x) => ({ ...x })),
		highlight,
		note,
		comparisons,
		swaps
	};
}
function sortFrames(rows, name, key) {
	const items = rows.map((r) => ({
		symbol: r.symbol,
		value: keyOf(r, key)
	}));
	if (name === "bubble") return bubble(items);
	if (name === "selection") return selection(items);
	if (name === "insertion") return insertion(items);
	if (name === "merge") return mergeSort(items);
	if (name === "quick") return quickSort(items);
	return heapSort(items);
}
function bubble(a) {
	const frames = [];
	let comparisons = 0;
	let swaps = 0;
	const n = a.length;
	for (let i = 0; i < n; i++) for (let j = 0; j < n - i - 1; j++) {
		comparisons += 1;
		if (a[j].value > a[j + 1].value) {
			const t = a[j];
			a[j] = a[j + 1];
			a[j + 1] = t;
			swaps += 1;
			frames.push(snap(a, [j, j + 1], `Swap ${a[j].symbol} and ${a[j + 1].symbol}`, comparisons, swaps));
		}
	}
	frames.push(snap(a, [], "Sorted", comparisons, swaps));
	return frames;
}
function selection(a) {
	const frames = [];
	let comparisons = 0;
	let swaps = 0;
	for (let i = 0; i < a.length; i++) {
		let min = i;
		for (let j = i + 1; j < a.length; j++) {
			comparisons += 1;
			if (a[j].value < a[min].value) min = j;
		}
		if (min !== i) {
			const t = a[i];
			a[i] = a[min];
			a[min] = t;
			swaps += 1;
		}
		frames.push(snap(a, [i], `Place ${a[i].symbol}`, comparisons, swaps));
	}
	return frames;
}
function insertion(a) {
	const frames = [];
	let comparisons = 0;
	let swaps = 0;
	for (let i = 1; i < a.length; i++) {
		const cur = a[i];
		let j = i - 1;
		while (j >= 0) {
			comparisons += 1;
			if (a[j].value <= cur.value) break;
			a[j + 1] = a[j];
			swaps += 1;
			j -= 1;
		}
		a[j + 1] = cur;
		frames.push(snap(a, [j + 1], `Insert ${cur.symbol}`, comparisons, swaps));
	}
	if (!frames.length) frames.push(snap(a, [], "Sorted", 0, 0));
	return frames;
}
function mergeSort(source) {
	const frames = [];
	let comparisons = 0;
	const a = source.map((x) => ({ ...x }));
	function merge(lo, mid, hi) {
		const left = a.slice(lo, mid + 1);
		const right = a.slice(mid + 1, hi + 1);
		let i = 0;
		let j = 0;
		let k = lo;
		while (i < left.length && j < right.length) {
			comparisons += 1;
			if (left[i].value <= right[j].value) a[k++] = left[i++];
			else a[k++] = right[j++];
		}
		while (i < left.length) a[k++] = left[i++];
		while (j < right.length) a[k++] = right[j++];
		frames.push(snap(a, [lo, hi], `Merge ${lo}–${hi}`, comparisons, frames.length));
	}
	function rec(lo, hi) {
		if (lo >= hi) return;
		const mid = lo + hi >> 1;
		rec(lo, mid);
		rec(mid + 1, hi);
		merge(lo, mid, hi);
	}
	if (a.length) rec(0, a.length - 1);
	frames.push(snap(a, [], "Sorted", comparisons, frames.length));
	return frames;
}
function quickSort(source) {
	const frames = [];
	const a = source.map((x) => ({ ...x }));
	let comparisons = 0;
	let swaps = 0;
	function part(lo, hi) {
		const pivot = a[hi].value;
		let i = lo;
		for (let j = lo; j < hi; j++) {
			comparisons += 1;
			if (a[j].value <= pivot) {
				const t = a[i];
				a[i] = a[j];
				a[j] = t;
				swaps += 1;
				i += 1;
			}
		}
		const t = a[i];
		a[i] = a[hi];
		a[hi] = t;
		swaps += 1;
		frames.push(snap(a, [i], `Pivot ${a[i].symbol}`, comparisons, swaps));
		return i;
	}
	function rec(lo, hi) {
		if (lo >= hi) return;
		const p = part(lo, hi);
		rec(lo, p - 1);
		rec(p + 1, hi);
	}
	if (a.length) rec(0, a.length - 1);
	frames.push(snap(a, [], "Sorted", comparisons, swaps));
	return frames;
}
function heapSort(source) {
	const frames = [];
	const a = source.map((x) => ({ ...x }));
	let comparisons = 0;
	let swaps = 0;
	const n = a.length;
	function sift(size, i) {
		while (true) {
			let best = i;
			const l = i * 2 + 1;
			const r = l + 1;
			if (l < size) {
				comparisons += 1;
				if (a[l].value > a[best].value) best = l;
			}
			if (r < size) {
				comparisons += 1;
				if (a[r].value > a[best].value) best = r;
			}
			if (best === i) break;
			const t = a[i];
			a[i] = a[best];
			a[best] = t;
			swaps += 1;
			i = best;
		}
	}
	for (let i = Math.floor(n / 2) - 1; i >= 0; i--) sift(n, i);
	for (let end = n - 1; end > 0; end--) {
		const t = a[0];
		a[0] = a[end];
		a[end] = t;
		swaps += 1;
		sift(end, 0);
		frames.push(snap(a, [end], `Extract ${a[end].symbol}`, comparisons, swaps));
	}
	frames.push(snap(a, [], "Sorted", comparisons, swaps));
	return frames;
}
function height(n) {
	return n ? n.height : 0;
}
function balanceOf(n) {
	return n ? height(n.left) - height(n.right) : 0;
}
function refresh(n) {
	n.height = 1 + Math.max(height(n.left), height(n.right));
}
function rotateRight(y) {
	const x = y.left;
	y.left = x.right;
	x.right = y;
	refresh(y);
	refresh(x);
	return x;
}
function rotateLeft(x) {
	const y = x.right;
	x.right = y.left;
	y.left = x;
	refresh(x);
	refresh(y);
	return y;
}
function balance(n, avl) {
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
function insertTree(node, row, avl) {
	if (!node) return {
		key: row.symbol,
		left: null,
		right: null,
		height: 1
	};
	if (row.symbol < node.key) node.left = insertTree(node.left, row, avl);
	else if (row.symbol > node.key) node.right = insertTree(node.right, row, avl);
	return balance(node, avl);
}
function searchTree(node, key) {
	const path = [];
	let cur = node;
	while (cur) {
		path.push(cur.key);
		if (key === cur.key) break;
		cur = key < cur.key ? cur.left : cur.right;
	}
	return path;
}
function layoutTree(root) {
	const out = [];
	let x = 0;
	function walk(n, depth, parent) {
		if (!n) return;
		walk(n.left, depth + 1, n.key);
		out.push({
			key: n.key,
			depth,
			x,
			balance: balanceOf(n),
			parent
		});
		x += 1;
		walk(n.right, depth + 1, n.key);
	}
	walk(root, 0, null);
	return out;
}
function buildTree(rows, avl) {
	const frames = [];
	let root = null;
	const ordered = [...rows].sort((a, b) => a.symbol.localeCompare(b.symbol));
	for (const row of ordered) {
		root = insertTree(root, row, avl);
		frames.push(layoutTree(root));
	}
	return {
		root,
		frames
	};
}
var SECTORS = {
	AAPL: "Technology",
	MSFT: "Technology",
	NVDA: "Technology",
	AMD: "Technology",
	AVGO: "Technology",
	GOOGL: "Technology",
	META: "Technology",
	AMZN: "Consumer",
	COST: "Consumer",
	TSLA: "Auto",
	JPM: "Finance",
	XOM: "Energy",
	NFLX: "Media"
};
function sectorOf(symbol) {
	return SECTORS[symbol] ?? "Other";
}
var CONCEPTS = [
	{
		id: "heap",
		title: "Priority queue",
		cost: "Insert / extract O(log n)",
		space: "O(n)"
	},
	{
		id: "list",
		title: "Linked list",
		cost: "Insert O(n)",
		space: "O(n)"
	},
	{
		id: "search",
		title: "Binary search",
		cost: "O(log n) after sort",
		space: "O(n)"
	},
	{
		id: "hash",
		title: "Hash table",
		cost: "Average O(1)",
		space: "O(n)"
	},
	{
		id: "graph",
		title: "Graph, BFS, DFS",
		cost: "O(V + E)",
		space: "O(V + E)"
	},
	{
		id: "mst",
		title: "Kruskal MST",
		cost: "O(E log E)",
		space: "O(V)"
	},
	{
		id: "sort",
		title: "Sorting",
		cost: "O(n log n) best of these",
		space: "O(n)"
	},
	{
		id: "tree",
		title: "BST and AVL",
		cost: "AVL search O(log n)",
		space: "O(n)"
	},
	{
		id: "stack",
		title: "Stack",
		cost: "Push / pop O(1)",
		space: "O(n)"
	},
	{
		id: "queue",
		title: "Queue",
		cost: "Enqueue / dequeue O(1)",
		space: "O(n)"
	}
];
var WHY = {
	heap: "A desk ranks alerts by how violent the move is. A max-heap keeps the hottest name at the root without sorting the whole book on every tick.",
	list: "A trade blotter grows from the front of the day. A linked list inserts a fill in time order and walks history without shifting an array.",
	search: "Once symbols are sorted, binary search halves the book each comparison. Linear search still checks every name until it hits.",
	hash: "Ticker lookup should not scan the watchlist. The hash of the symbol picks a bucket; separate chaining holds the names that collide.",
	graph: "Companies in one sector move together. An adjacency list stores those links. BFS walks sector peers level by level; DFS follows one chain before backtracking.",
	mst: "Kruskal keeps the lightest relationship edges that do not form a cycle. The tree is a map of similar moves, not a portfolio to buy.",
	sort: "Screens sort the board by price, percent change, or volume. The same records run through six sorts so the steps are visible.",
	tree: "A binary search tree stores symbols in order. An AVL tree rotates so a sorted load does not collapse into a linked list.",
	stack: "The last symbol you opened is the first one you go back to. That is a stack.",
	queue: "Analysis jobs wait in arrival order. A queue dequeues the oldest request first."
};
var CODE = {
	heap: "insert(x): push, sift up while parent < child\nextract(): take root, move last up, sift down",
	list: "insert(tx): walk until timestamp fits\nfind(symbol): traverse from head",
	search: "while lo <= hi:\n  mid = (lo + hi) / 2\n  if key < a[mid]: hi = mid - 1 else lo = mid + 1",
	hash: "bucket = hash(symbol) % capacity\nchain = buckets[bucket]   // separate chaining",
	graph: "BFS: dequeue u, enqueue unseen neighbors\nDFS: pop u, push unseen neighbors",
	mst: "sort edges by weight\nfor edge: if find(u) != find(v): union, take edge else reject",
	sort: "bubble / selection / insertion: O(n²)\nmerge / quick / heap: O(n log n) average or worst",
	tree: "BST: go left if smaller, right if larger\nAVL: rotate when |balance| > 1",
	stack: "push(x)  pop()  peek() = top",
	queue: "enqueue(x) at back   dequeue() from front"
};
function StepBar({ step, total, playing, onPlay, onNext, onReset }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				variant: "secondary",
				size: "sm",
				onClick: onPlay,
				disabled: total === 0,
				children: [playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), playing ? "Pause" : "Play"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				variant: "secondary",
				size: "sm",
				onClick: onNext,
				disabled: total === 0,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipForward, { className: "size-4" }), "Next"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				variant: "ghost",
				size: "sm",
				onClick: onReset,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" }), "Reset"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-xs text-muted tabular-nums",
				children: total ? `${Math.min(step + 1, total)} / ${total}` : "0 / 0"
			})
		]
	});
}
function usePlayer(total, token) {
	const [step, setStep] = (0, import_react.useState)(0);
	const [playing, setPlaying] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setStep(0);
		setPlaying(false);
	}, [token, total]);
	(0, import_react.useEffect)(() => {
		if (!playing || total === 0) return;
		const id = window.setInterval(() => {
			setStep((n) => {
				if (n >= total - 1) {
					setPlaying(false);
					return n;
				}
				return n + 1;
			});
		}, 520);
		return () => window.clearInterval(id);
	}, [playing, total]);
	return {
		step: total ? Math.min(step, total - 1) : 0,
		playing,
		onPlay: () => setPlaying((p) => !p),
		onNext: () => {
			setPlaying(false);
			setStep((n) => Math.min(total - 1, n + 1));
		},
		onReset: () => {
			setPlaying(false);
			setStep(0);
		}
	};
}
function GraphView({ symbols, edges, seen, current, chosen, rejected }) {
	const pos = symbols.map((symbol, i) => {
		const angle = i / Math.max(symbols.length, 1) * Math.PI * 2 - Math.PI / 2;
		return {
			symbol,
			x: 50 + 38 * Math.cos(angle),
			y: 50 + 36 * Math.sin(angle)
		};
	});
	const at = new Map(pos.map((p) => [p.symbol, p]));
	const seenSet = new Set(seen);
	const taken = new Set((chosen ?? []).map((e) => [e.a, e.b].sort().join("|")));
	const dropped = new Set((rejected ?? []).map((e) => [e.a, e.b].sort().join("|")));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 100 100",
		className: "h-64 w-full sm:h-80",
		children: [edges.map((e) => {
			const a = at.get(e.a);
			const b = at.get(e.b);
			if (!a || !b) return null;
			const id = [e.a, e.b].sort().join("|");
			const on = taken.has(id);
			const off = dropped.has(id);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: a.x,
				y1: a.y,
				x2: b.x,
				y2: b.y,
				stroke: on ? "var(--color-gain)" : off ? "var(--color-loss)" : "var(--color-border-strong)",
				strokeWidth: on ? .8 : .35,
				strokeDasharray: off ? "1.2 1" : void 0
			}, id);
		}), pos.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: p.x,
			cy: p.y,
			r: current === p.symbol ? 4.2 : 3.3,
			fill: seenSet.has(p.symbol) ? "var(--color-accent)" : "var(--color-elevated)",
			stroke: "var(--color-border-strong)"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: p.x,
			y: p.y + 1.1,
			textAnchor: "middle",
			fontSize: "2.4",
			fill: seenSet.has(p.symbol) ? "var(--color-accent-foreground)" : "var(--color-foreground)",
			children: p.symbol
		})] }, p.symbol))]
	});
}
function DsaPanel({ history }) {
	const [concept, setConcept] = (0, import_react.useState)("heap");
	const board = useQuery({
		queryKey: ["dsa-board"],
		queryFn: () => fetchWatchQuotes({ data: { symbols: [...BOARD] } }),
		staleTime: 6e4
	});
	const rows = (0, import_react.useMemo)(() => (board.data ?? []).map((q) => ({
		symbol: q.symbol,
		name: q.name,
		price: q.price,
		changePct: q.changePct,
		volume: q.volume ?? 0,
		sector: sectorOf(q.symbol)
	})), [board.data]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6 space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-lg tracking-tight",
				children: "DSA in the market"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 max-w-prose text-sm text-muted",
				children: "These structures run on the live board, your blotter, and the symbols you just opened. They are working desk tools, not a separate textbook."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-2 overflow-x-auto pb-1",
				children: CONCEPTS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setConcept(item.id),
					className: cn("h-10 shrink-0 rounded-full border px-3 text-sm", concept === item.id ? "border-border-strong bg-elevated text-foreground" : "border-border text-muted"),
					children: item.title
				}, item.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-[var(--radius-lg)] border border-border bg-elevated p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm leading-relaxed",
						children: WHY[concept]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 font-mono text-xs text-subtle",
						children: [
							CONCEPTS.find((c) => c.id === concept)?.cost,
							" · space ",
							CONCEPTS.find((c) => c.id === concept)?.space
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
						className: "mt-3 overflow-x-auto font-mono text-xs leading-relaxed text-muted",
						children: CODE[concept]
					})
				]
			}),
			board.isLoading && rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Loading the live board…"
			}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-loss",
				children: "The board did not return quotes. Try again in a moment."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				concept === "heap" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeapView, { rows }),
				concept === "list" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListView, { rows }),
				concept === "search" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchView, { rows }),
				concept === "hash" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HashView, { rows }),
				concept === "graph" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WalkView, { rows }),
				concept === "mst" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MstView, { rows }),
				concept === "sort" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortView, { rows }),
				concept === "tree" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TreeView, { rows }),
				concept === "stack" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StackView, { history }),
				concept === "queue" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueueView, { symbols: rows.map((r) => r.symbol) })
			] })
		]
	});
}
function HeapView({ rows }) {
	const token = rows.map((r) => `${r.symbol}:${r.changePct}:${r.volume}`).join("|");
	const [heap, setHeap] = (0, import_react.useState)(() => new MaxHeap());
	const [picked, setPicked] = (0, import_react.useState)([]);
	const [note, setNote] = (0, import_react.useState)("Heap built from the live board.");
	(0, import_react.useEffect)(() => {
		const next = new MaxHeap();
		for (const row of rows) next.insert({
			symbol: row.symbol,
			name: row.name,
			score: alertScore(row.changePct, row.volume),
			changePct: row.changePct,
			volume: row.volume
		});
		setHeap(next);
		setPicked([]);
		setNote("Inserted every board name. Root is the highest-priority alert.");
	}, [token, rows]);
	const snap = heap.snapshot();
	const top = heap.peek();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					size: "sm",
					onClick: () => {
						const item = heap.extract();
						setHeap(MaxHeap.from(heap.snapshot()));
						if (!item) setNote("Heap is empty.");
						else {
							setPicked((list) => [...list, item]);
							setNote(`Extracted ${item.symbol}. New root is ${heap.peek()?.symbol ?? "empty"}.`);
						}
					},
					children: "Extract max"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "secondary",
					size: "sm",
					onClick: () => {
						if (!top) return;
						heap.removeSymbol(top.symbol);
						setHeap(MaxHeap.from(heap.snapshot()));
						setNote(`Deleted root ${top.symbol} and restored the heap.`);
					},
					children: "Delete root"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					"Peek: ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-foreground",
						children: top ? `${top.symbol} · ${top.score.toFixed(2)}` : "empty"
					}),
					". ",
					note
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: snap.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-[var(--radius-sm)] border border-border bg-card px-3 py-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-mono text-xs text-subtle",
							children: [
								"index ",
								i,
								i === 0 ? " · root" : ` · parent ${(i - 1) / 2 | 0}`
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-sm",
							children: item.symbol
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-mono text-xs text-muted tabular-nums",
							children: [
								item.score.toFixed(1),
								" · ",
								formatPct(item.changePct),
								" · ",
								formatCompact(item.volume)
							]
						})
					]
				}, item.symbol))
			}),
			picked.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "font-mono text-xs text-muted",
				children: ["Alert order: ", picked.map((p) => p.symbol).join(" → ")]
			})
		]
	});
}
function ListView({ rows }) {
	const portfolio = useDesk((s) => s.portfolio);
	const [txs, setTxs] = (0, import_react.useState)([]);
	const [symbol, setSymbol] = (0, import_react.useState)(rows[0]?.symbol ?? "AAPL");
	const [qty, setQty] = (0, import_react.useState)("10");
	const [kind, setKind] = (0, import_react.useState)("buy");
	const [cursor, setCursor] = (0, import_react.useState)(0);
	const [query, setQuery] = (0, import_react.useState)("");
	const [hit, setHit] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		const list = new TxList();
		portfolio.forEach((lot, i) => {
			const row = rows.find((r) => r.symbol === lot.symbol);
			list.insert({
				id: lot.id,
				name: row?.name ?? lot.symbol,
				symbol: lot.symbol,
				type: "buy",
				quantity: lot.quantity,
				price: lot.cost,
				at: Date.now() - (portfolio.length - i) * 6e4
			});
		});
		setTxs(list.toArray());
		setCursor(0);
	}, [portfolio, rows]);
	const focus = txs[cursor] ?? null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-2 sm:grid-cols-5",
				onSubmit: (e) => {
					e.preventDefault();
					const row = rows.find((r) => r.symbol === symbol.trim().toUpperCase());
					const quantity = Number(qty);
					if (!row || !Number.isFinite(quantity) || quantity <= 0) return;
					const list = TxList.from(txs);
					list.insert({
						id: `${Date.now()}`,
						name: row.name,
						symbol: row.symbol,
						type: kind,
						quantity,
						price: row.price,
						at: Date.now()
					});
					const next = list.toArray();
					setTxs(next);
					setCursor(next.length - 1);
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: symbol,
						onChange: (e) => setSymbol(e.target.value.toUpperCase()),
						"aria-label": "Trade ticker"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: qty,
						onChange: (e) => setQty(e.target.value),
						inputMode: "decimal",
						"aria-label": "Quantity"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: kind === "buy" ? "default" : "secondary",
						onClick: () => setKind("buy"),
						children: "Buy"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: kind === "sell" ? "default" : "secondary",
						onClick: () => setKind("sell"),
						children: "Sell"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						children: "Insert"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						size: "sm",
						variant: "secondary",
						onClick: () => setCursor((n) => Math.max(0, n - 1)),
						children: "Previous"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						size: "sm",
						variant: "secondary",
						onClick: () => setCursor((n) => Math.min(txs.length - 1, n + 1)),
						children: "Next trade"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						size: "sm",
						variant: "ghost",
						disabled: !focus,
						onClick: () => {
							if (!focus) return;
							const list = TxList.from(txs);
							list.remove(focus.id);
							const next = list.toArray();
							setTxs(next);
							setCursor((n) => Math.max(0, Math.min(n, next.length - 1)));
						},
						children: "Delete node"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex gap-2",
				onSubmit: (e) => {
					e.preventDefault();
					const found = TxList.from(txs).find(query);
					setHit(found ? `${found.type} ${found.symbol} @ ${found.price}` : "No match in the list.");
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: query,
					onChange: (e) => setQuery(e.target.value),
					placeholder: "Search the blotter",
					"aria-label": "Search trades"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					variant: "secondary",
					children: "Traverse"
				})]
			}),
			hit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: hit
			}),
			txs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-subtle",
				children: "No trades yet. Add a buy or sell, or book a lot on the Portfolio tab."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "flex gap-2 overflow-x-auto pb-1",
				children: txs.map((tx, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setCursor(i),
					className: cn("min-w-36 rounded-[var(--radius-sm)] border px-3 py-2 text-left", i === cursor ? "border-border-strong bg-card" : "border-border"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs text-subtle",
							children: i === 0 ? "head" : `node ${i}`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-sm",
							children: tx.symbol
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted",
							children: [
								tx.type,
								" ",
								formatNumber(tx.quantity, 2),
								" @ ",
								formatNumber(tx.price, 2)
							]
						})
					]
				}) }, tx.id))
			})
		]
	});
}
function SearchView({ rows }) {
	const [query, setQuery] = (0, import_react.useState)(rows[0]?.symbol ?? "AAPL");
	const [run, setRun] = (0, import_react.useState)(0);
	const linear = (0, import_react.useMemo)(() => linearSearch(rows, query), [
		rows,
		query,
		run
	]);
	const binary = (0, import_react.useMemo)(() => binarySearch(rows, query), [
		rows,
		query,
		run
	]);
	const player = usePlayer(Math.max(linear.length, binary.steps.length), `${query}:${run}`);
	const l = linear[Math.min(player.step, linear.length - 1)];
	const b = binary.steps[Math.min(player.step, binary.steps.length - 1)];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex gap-2",
				onSubmit: (e) => {
					e.preventDefault();
					setRun((n) => n + 1);
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: query,
					onChange: (e) => setQuery(e.target.value.toUpperCase()),
					"aria-label": "Search symbol"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					children: "Search"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StepBar, {
				...player,
				total: Math.max(linear.length, binary.steps.length)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-[var(--radius-md)] bg-card p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs tracking-wide text-subtle uppercase",
							children: "Linear"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-mono text-sm",
							children: l ? `${l.symbol} · comparisons ${l.comparisons}${l.found ? " · found" : ""}` : "Enter a symbol."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 flex flex-wrap gap-1",
							children: rows.map((row, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("rounded-full border px-2 py-1 font-mono text-xs", l && i === l.index ? "border-border-strong bg-elevated" : "border-border text-muted"),
								children: row.symbol
							}, row.symbol))
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-[var(--radius-md)] bg-card p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs tracking-wide text-subtle uppercase",
							children: "Binary, sorted by ticker"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-mono text-sm",
							children: b ? `${b.found ? b.symbol : "miss"} · comparisons ${b.comparisons} · window ${b.lo}–${b.hi}` : "Enter a symbol."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 flex flex-wrap gap-1",
							children: binary.sorted.map((row, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("rounded-full border px-2 py-1 font-mono text-xs", b && i === b.index ? "border-border-strong bg-elevated" : "border-border text-muted", b && i >= b.lo && i <= b.hi ? "text-foreground" : ""),
								children: row.symbol
							}, row.symbol))
						})
					]
				})]
			})
		]
	});
}
function HashView({ rows }) {
	const token = rows.map((r) => r.symbol).join(",");
	const [{ table, ops }, setBook] = (0, import_react.useState)(() => loadHash(rows, 7));
	const [key, setKey] = (0, import_react.useState)("");
	const [last, setLast] = (0, import_react.useState)(ops.at(-1) ?? null);
	(0, import_react.useEffect)(() => {
		const loaded = loadHash(rows, 7);
		setBook(loaded);
		setLast(loaded.ops.at(-1) ?? null);
	}, [token, rows]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex flex-wrap gap-2",
				onSubmit: (e) => {
					e.preventDefault();
					setLast(table.search(key));
					setBook({
						table,
						ops
					});
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: key,
						onChange: (e) => setKey(e.target.value.toUpperCase()),
						placeholder: "Ticker",
						"aria-label": "Hash key"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						variant: "secondary",
						children: "Search"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						onClick: () => {
							setLast(table.remove(key));
							setBook({
								table,
								ops
							});
						},
						children: "Delete"
					})
				]
			}),
			last && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					last.action,
					" ",
					last.key || "—",
					" → bucket ",
					last.bucket,
					". Chain [",
					last.chain.join(" → ") || "empty",
					"]. Collisions in bucket: ",
					last.collisions,
					". ",
					last.action !== "insert" && (last.found ? "Hit." : "Miss.")
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7",
				children: table.buckets.map((chain, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("min-h-24 rounded-[var(--radius-sm)] border p-2", last?.bucket === i ? "border-border-strong bg-card" : "border-border"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-xs text-subtle",
						children: ["bucket ", i]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-1 space-y-1",
						children: chain.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "font-mono text-xs",
							children: row.symbol
						}, row.symbol))
					})]
				}, i))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-subtle",
				children: "Hash: h = (h × 31 + char) mod 7. A chain longer than one name is a collision."
			})
		]
	});
}
function WalkView({ rows }) {
	const graph = (0, import_react.useMemo)(() => buildStockGraph(rows), [rows]);
	const [mode, setMode] = (0, import_react.useState)("bfs");
	const [start, setStart] = (0, import_react.useState)(rows[0]?.symbol ?? "AAPL");
	const frames = (0, import_react.useMemo)(() => {
		return (mode === "bfs" ? bfs : dfs)(graph.adj, start.trim().toUpperCase());
	}, [
		graph,
		mode,
		start
	]);
	const player = usePlayer(frames.length, `${mode}:${start}:${rows.length}`);
	const frame = frames[player.step];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						size: "sm",
						variant: mode === "bfs" ? "default" : "secondary",
						onClick: () => setMode("bfs"),
						children: "BFS"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						size: "sm",
						variant: mode === "dfs" ? "default" : "secondary",
						onClick: () => setMode("dfs"),
						children: "DFS"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: start,
						onChange: (e) => setStart(e.target.value),
						className: "h-9 rounded-[var(--radius-xs)] border border-border bg-card px-2 font-mono text-sm",
						"aria-label": "Start symbol",
						children: graph.symbols.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: s }, s))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StepBar, {
				...player,
				total: frames.length
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraphView, {
				symbols: graph.symbols,
				edges: graph.edges,
				seen: frame?.seen ?? [],
				current: frame?.current ?? null
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					frame?.note ?? "Pick a start.",
					" ",
					mode === "bfs" ? "Queue" : "Stack",
					": ",
					frame?.bag.join(" ") || "—",
					". Order:",
					" ",
					frame?.order.join(" → ") || "—"
				]
			})
		]
	});
}
function MstView({ rows }) {
	const graph = (0, import_react.useMemo)(() => buildStockGraph(rows), [rows]);
	const frames = (0, import_react.useMemo)(() => kruskal(graph.symbols, graph.edges), [graph]);
	const player = usePlayer(frames.length, graph.symbols.join(","));
	const frame = frames[player.step];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Edge weight is the gap in today’s percent change. Same-sector pairs have no extra penalty. A different sector adds 1. Light edges are similar moves."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StepBar, {
				...player,
				total: frames.length
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraphView, {
				symbols: graph.symbols,
				edges: graph.edges,
				seen: frame ? [...new Set(frame.chosen.flatMap((e) => [e.a, e.b]))] : [],
				current: frame?.edge?.a ?? null,
				chosen: frame?.chosen,
				rejected: frame?.rejected
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					frame?.note ?? "No edges.",
					" Total weight ",
					frame ? frame.total.toFixed(3) : "0",
					". Green edges are in the tree. Red dashed edges were rejected."
				]
			})
		]
	});
}
function SortView({ rows }) {
	const [name, setName] = (0, import_react.useState)("quick");
	const [key, setKey] = (0, import_react.useState)("changePct");
	const frames = (0, import_react.useMemo)(() => sortFrames(rows, name, key), [
		rows,
		name,
		key
	]);
	const player = usePlayer(frames.length, `${name}:${key}:${rows.length}`);
	const frame = frames[player.step];
	const max = Math.max(...frame?.values.map((v) => Math.abs(v.value)) ?? [1], 1);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					"bubble",
					"selection",
					"insertion",
					"merge",
					"quick",
					"heap"
				].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setName(item),
					className: cn("h-9 rounded-full border px-3 text-xs capitalize", name === item ? "border-border-strong bg-card" : "border-border text-muted"),
					children: item
				}, item))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					["price", "Price"],
					["changePct", "Percent"],
					["volume", "Volume"]
				].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setKey(id),
					className: cn("h-9 rounded-full border px-3 text-xs", key === id ? "border-border-strong bg-card" : "border-border text-muted"),
					children: label
				}, id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StepBar, {
				...player,
				total: frames.length
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					frame?.note,
					". Comparisons ",
					frame?.comparisons ?? 0,
					". Moves ",
					frame?.swaps ?? 0,
					". Market cap is not in this feed, so it is not a sort key."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-1",
				children: frame?.values.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "grid grid-cols-[4.5rem_1fr_auto] items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-xs",
							children: item.symbol
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "h-2 rounded-full bg-border",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("block h-2 rounded-full", frame.highlight.includes(i) ? "bg-accent" : "bg-chart"),
								style: { width: `${Math.max(4, Math.abs(item.value) / max * 100)}%` }
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-xs text-muted tabular-nums",
							children: key === "changePct" ? formatPct(item.value) : key === "volume" ? formatCompact(item.value) : formatNumber(item.value, 2)
						})
					]
				}, `${item.symbol}-${i}`))
			})
		]
	});
}
function TreeView({ rows }) {
	const [avl, setAvl] = (0, import_react.useState)(true);
	const [query, setQuery] = (0, import_react.useState)(rows[0]?.symbol ?? "AAPL");
	const built = (0, import_react.useMemo)(() => buildTree(rows, avl), [rows, avl]);
	const player = usePlayer(built.frames.length, `${avl}:${rows.length}`);
	const nodes = built.frames[player.step] ?? [];
	const path = searchTree(built.root, query.trim().toUpperCase());
	const width = Math.max(nodes.length, 1);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					size: "sm",
					variant: avl ? "default" : "secondary",
					onClick: () => setAvl(true),
					children: "AVL"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					size: "sm",
					variant: !avl ? "default" : "secondary",
					onClick: () => setAvl(false),
					children: "BST"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StepBar, {
				...player,
				total: built.frames.length
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative h-56 overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative h-56",
					style: { minWidth: `${width * 52}px` },
					children: nodes.map((node) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: cn("absolute w-12 -translate-x-1/2 rounded-[var(--radius-xs)] border px-1 py-1 text-center", path.includes(node.key) ? "border-border-strong bg-card" : "border-border bg-elevated"),
						style: {
							left: `${(node.x + .5) / width * 100}%`,
							top: `${12 + node.depth * 52}px`
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-[10px]",
							children: node.key
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-[10px] text-subtle",
							children: node.balance
						})]
					}, node.key))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex gap-2",
				onSubmit: (e) => {
					e.preventDefault();
					setQuery(query.trim().toUpperCase());
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: query,
					onChange: (e) => setQuery(e.target.value.toUpperCase()),
					"aria-label": "Tree search"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					variant: "secondary",
					children: "Search"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					"Path: ",
					path.join(" → ") || "empty tree",
					". The small number is the balance factor."
				]
			})
		]
	});
}
function StackView({ history }) {
	const [stack, setStack] = (0, import_react.useState)(() => new Stack([...history].reverse()));
	const [symbol, setSymbol] = (0, import_react.useState)("");
	const [top, setTop] = (0, import_react.useState)(history[0] ?? null);
	(0, import_react.useEffect)(() => {
		const next = new Stack([...history].reverse());
		setStack(next);
		setTop(next.peek());
	}, [history]);
	const items = stack.toArray();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex gap-2",
				onSubmit: (e) => {
					e.preventDefault();
					const clean = symbol.trim().toUpperCase();
					if (!clean) return;
					stack.push(clean);
					setStack(new Stack([...stack.toArray()].reverse()));
					setTop(stack.peek());
					setSymbol("");
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: symbol,
						onChange: (e) => setSymbol(e.target.value.toUpperCase()),
						placeholder: "Push a ticker",
						"aria-label": "Push ticker"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						children: "Push"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "secondary",
						onClick: () => {
							stack.pop();
							setStack(new Stack([...stack.toArray()].reverse()));
							setTop(stack.peek());
						},
						children: "Pop"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					"Peek: ",
					top ?? "empty",
					". Top of the stack is the latest view."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "space-y-1",
				children: items.map((symbol, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-[var(--radius-sm)] border border-border px-3 py-2 font-mono text-sm",
					children: [i === 0 ? "top · " : "", symbol]
				}, `${symbol}-${i}`))
			})
		]
	});
}
function QueueView({ symbols }) {
	const [queue, setQueue] = (0, import_react.useState)(() => {
		const q = new Queue();
		for (const s of symbols.slice(0, 4)) q.enqueue(s);
		return q;
	});
	const [symbol, setSymbol] = (0, import_react.useState)("");
	const items = queue.toArray();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex gap-2",
				onSubmit: (e) => {
					e.preventDefault();
					const clean = symbol.trim().toUpperCase();
					if (!clean) return;
					const next = new Queue();
					for (const item of items) next.enqueue(item);
					next.enqueue(clean);
					setQueue(next);
					setSymbol("");
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: symbol,
						onChange: (e) => setSymbol(e.target.value.toUpperCase()),
						placeholder: "Enqueue analysis",
						"aria-label": "Enqueue ticker"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						children: "Enqueue"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "secondary",
						onClick: () => {
							const next = new Queue();
							const rest = queue.toArray();
							rest.shift();
							for (const item of rest) next.enqueue(item);
							setQueue(next);
						},
						children: "Dequeue"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					"Front: ",
					queue.peek() ?? "empty",
					". Oldest analysis request leaves first."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "flex gap-2 overflow-x-auto",
				children: items.map((symbol, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-[var(--radius-sm)] border border-border px-3 py-2 font-mono text-sm",
					children: [i === 0 ? "front · " : "", symbol]
				}, `${symbol}-${i}`))
			})
		]
	});
}
var TABS = [
	{
		id: "quote",
		label: "Quote",
		icon: Activity
	},
	{
		id: "market",
		label: "Market",
		icon: Globe
	},
	{
		id: "watch",
		label: "Watchlist",
		icon: Bookmark
	},
	{
		id: "portfolio",
		label: "Portfolio",
		icon: Wallet
	},
	{
		id: "pnl",
		label: "P&L",
		icon: Calculator
	},
	{
		id: "compare",
		label: "Compare",
		icon: Scale
	},
	{
		id: "news",
		label: "News",
		icon: Newspaper
	},
	{
		id: "predict",
		label: "Predict",
		icon: ChartLine
	},
	{
		id: "alerts",
		label: "Alerts",
		icon: Bell
	},
	{
		id: "profile",
		label: "Profile",
		icon: Building2
	},
	{
		id: "history",
		label: "History",
		icon: Clock3
	},
	{
		id: "dsa",
		label: "DSA",
		icon: Waypoints
	}
];
var CHIPS = [
	"AAPL",
	"MSFT",
	"NVDA",
	"TSLA",
	"AMZN",
	"GOOGL",
	"JPM",
	"NFLX"
];
function Desk() {
	const { symbol, setSymbol, watchlist, addWatch, removeWatch, history, clearHistory, theme, setTheme, portfolio, alerts, markAlert } = useDesk();
	const [tab, setTab] = (0, import_react.useState)("quote");
	const [query, setQuery] = (0, import_react.useState)(symbol);
	const [openHits, setOpenHits] = (0, import_react.useState)(false);
	const [horizon, setHorizon] = (0, import_react.useState)(7);
	const [range, setRange] = (0, import_react.useState)("1M");
	const [chartStyle, setChartStyle] = (0, import_react.useState)("line");
	(0, import_react.useEffect)(() => {
		document.documentElement.classList.toggle("light", theme === "light");
		document.documentElement.style.colorScheme = theme;
	}, [theme]);
	const liveSymbols = (0, import_react.useMemo)(() => {
		return [.../* @__PURE__ */ new Set([
			...watchlist,
			...portfolio.map((h) => h.symbol),
			...alerts.map((a) => a.symbol)
		])];
	}, [
		watchlist,
		portfolio,
		alerts
	]);
	const bundle = useQuery({
		queryKey: ["bundle", symbol],
		queryFn: () => fetchQuoteBundle({ data: { symbol } })
	});
	const ranged = useQuery({
		queryKey: [
			"chart",
			symbol,
			range
		],
		queryFn: () => fetchChart({ data: {
			symbol,
			range
		} }),
		enabled: tab === "quote"
	});
	const profile = useQuery({
		queryKey: ["profile", symbol],
		queryFn: () => fetchProfile({ data: { symbol } }),
		enabled: tab === "profile"
	});
	const search = useQuery({
		queryKey: ["search", query],
		queryFn: () => searchTickers({ data: { q: query } }),
		enabled: query.trim().length >= 1 && openHits
	});
	const news = useQuery({
		queryKey: ["news", symbol],
		queryFn: () => searchTickers({ data: { q: symbol } }),
		enabled: tab === "news"
	});
	const watchQuotes = useQuery({
		queryKey: ["live", liveSymbols.join(",")],
		queryFn: () => fetchWatchQuotes({ data: { symbols: liveSymbols } }),
		enabled: liveSymbols.length > 0,
		refetchInterval: alerts.some((a) => !a.triggeredAt) ? 45e3 : false
	});
	const forecast = (0, import_react.useMemo)(() => {
		if (!bundle.data?.candles) return null;
		return buildForecast(bundle.data.candles, horizon);
	}, [bundle.data, horizon]);
	const briefing = useMutation({ mutationFn: async () => {
		if (!forecast || !bundle.data) throw new Error("No forecast yet");
		return explainForecast({ data: {
			symbol,
			name: bundle.data.quote.name,
			lastClose: forecast.lastClose,
			nextClose: forecast.nextClose,
			direction: forecast.direction,
			confidence: forecast.confidence,
			rsi: forecast.rsi14,
			accuracy: forecast.backtest.directionalAccuracy,
			votes: forecast.votes
		} });
	} });
	(0, import_react.useEffect)(() => {
		setQuery(symbol);
	}, [symbol]);
	(0, import_react.useEffect)(() => {
		const prices = /* @__PURE__ */ new Map();
		if (bundle.data?.quote) prices.set(bundle.data.quote.symbol, bundle.data.quote.price);
		for (const q of watchQuotes.data ?? []) prices.set(q.symbol, q.price);
		for (const alert of alerts) {
			if (alert.triggeredAt) continue;
			const price = prices.get(alert.symbol);
			if (price == null) continue;
			if (alert.op === "above" ? price >= alert.target : price <= alert.target) {
				markAlert(alert.id);
				toast.message(`${alert.symbol} moved ${alert.op} ${alert.target.toFixed(2)}`);
			}
		}
	}, [
		alerts,
		bundle.data,
		watchQuotes.data,
		markAlert
	]);
	const quote = bundle.data?.quote;
	const up = (quote?.change ?? 0) >= 0;
	const watching = watchlist.includes(symbol);
	function submitSymbol(next) {
		const clean = next.trim().toUpperCase();
		if (!clean) return;
		setSymbol(clean);
		setOpenHits(false);
		toast.message(`Loaded ${clean}`);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen flex-col bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
				theme: theme === "light" ? "light" : "dark",
				position: "bottom-right",
				toastOptions: { style: {
					background: "var(--color-elevated)",
					border: "1px solid var(--color-border)",
					color: "var(--color-foreground)"
				} }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:flex-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "lg:sticky lg:top-6 lg:w-64 lg:shrink-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-mono text-xs tracking-[0.22em] text-subtle uppercase",
									children: "Hatch · hold · grow"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setTheme(theme === "light" ? "dark" : "light"),
									className: "grid size-11 place-items-center rounded-[var(--radius-sm)] text-muted hover:bg-elevated hover:text-foreground",
									"aria-label": theme === "light" ? "Switch to dark mode" : "Switch to light mode",
									children: theme === "light" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, {
										className: "size-4",
										strokeWidth: 1.75
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, {
										className: "size-4",
										strokeWidth: 1.75
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: "/logo.png",
									alt: "",
									width: 48,
									height: 40,
									className: "h-11 w-auto shrink-0 object-contain"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
									className: "font-display text-3xl leading-none tracking-tight",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "italic",
										children: "Nest"
									}), "Invest"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm leading-relaxed text-muted",
								children: "A market nest for live quotes, company files, and a technical forecast."
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible",
						children: TABS.map((item) => {
							const Icon = item.icon;
							const active = tab === item.id;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => {
									setTab(item.id);
									setOpenHits(false);
								},
								className: cn("flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-[var(--radius-sm)] px-3 text-sm transition-colors duration-[var(--motion-quick)]", active ? "bg-elevated text-foreground" : "text-muted hover:text-foreground"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
									className: "size-4",
									strokeWidth: 1.75
								}), item.label]
							}, item.id);
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
					className: "min-w-0 flex-1 space-y-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketStrip, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "rounded-[var(--radius-xl)] border border-border bg-card p-4 sm:p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								className: "relative flex flex-col gap-3 sm:flex-row",
								onSubmit: (e) => {
									e.preventDefault();
									submitSymbol(query);
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative min-w-0 flex-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: query,
											onChange: (e) => {
												setQuery(e.target.value);
												setOpenHits(true);
											},
											onFocus: () => setOpenHits(true),
											onBlur: () => {
												window.setTimeout(() => setOpenHits(false), 180);
											},
											placeholder: "Search ticker or company",
											className: "pl-10",
											"aria-label": "Stock symbol",
											autoComplete: "off"
										}),
										openHits && (search.data?.quotes.length ?? 0) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
											className: "absolute z-20 mt-2 w-full overflow-hidden rounded-[var(--radius-md)] border border-border bg-elevated shadow-lg",
											children: search.data.quotes.map((hit) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												className: "flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-card",
												onClick: () => submitSymbol(hit.symbol),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-mono text-sm",
													children: hit.symbol
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "truncate text-xs text-muted",
													children: hit.name
												})]
											}) }, hit.symbol))
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "submit",
										children: "Open"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										type: "button",
										variant: "secondary",
										onClick: () => {
											if (watching) {
												removeWatch(symbol);
												toast.message(`Removed ${symbol}`);
											} else {
												addWatch(symbol);
												toast.message(`Watching ${symbol}`);
											}
										},
										children: [watching ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookmarkCheck, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "hidden sm:inline",
											children: watching ? "Saved" : "Watch"
										})]
									})]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 flex flex-wrap gap-1.5",
								children: CHIPS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => submitSymbol(s),
									className: cn("h-8 rounded-full border px-3 font-mono text-xs", symbol === s ? "border-border-strong bg-elevated text-foreground" : "border-border text-muted hover:text-foreground"),
									children: s
								}, s))
							})]
						}),
						bundle.isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-[var(--radius-xl)] border border-border bg-card p-8 text-sm text-muted",
							children: "Connecting to market data…"
						}),
						bundle.error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-[var(--radius-xl)] border border-border bg-card p-6 text-sm text-loss",
							children: bundle.error.message
						}),
						quote && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "rounded-[var(--radius-xl)] border border-border bg-card p-5 sm:p-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-end justify-between gap-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "font-mono text-xs tracking-wide text-subtle",
										children: [
											quote.symbol,
											" · ",
											quote.exchange
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "font-display mt-1 text-2xl tracking-tight sm:text-3xl",
										children: quote.name
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-right",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-mono text-3xl tabular-nums tracking-tight",
											children: formatMoney(quote.price, quote.currency)
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: cn("mt-1 inline-flex items-center gap-1 font-mono text-sm tabular-nums", up ? "text-gain" : "text-loss"),
											children: [
												up ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDownRight, { className: "size-4" }),
												formatMoney(quote.change, quote.currency),
												" (",
												formatPct(quote.changePct),
												")"
											]
										})]
									})]
								}),
								(tab === "quote" || tab === "predict") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-5",
									children: [
										tab === "quote" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mb-3 flex flex-wrap items-center gap-1.5",
											children: [
												CHART_RANGES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													onClick: () => setRange(r),
													className: cn("h-9 rounded-full border px-3 font-mono text-xs", range === r ? "border-border-strong bg-elevated text-foreground" : "border-border text-muted hover:text-foreground"),
													children: r
												}, r)),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mx-1 hidden h-4 w-px bg-border sm:inline" }),
												["line", "candle"].map((mode) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													onClick: () => setChartStyle(mode),
													className: cn("h-9 rounded-full border px-3 text-xs capitalize", chartStyle === mode ? "border-border-strong bg-elevated text-foreground" : "border-border text-muted hover:text-foreground"),
													children: mode === "line" ? "Line" : "Candles"
												}, mode))
											]
										}),
										tab === "quote" && ranged.isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mb-3 text-sm text-muted",
											children: [
												"Drawing ",
												range,
												" path…"
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceChart, {
											candles: tab === "quote" ? ranged.data?.candles ?? bundle.data?.candles ?? [] : bundle.data?.candles ?? [],
											forecast: tab === "predict" ? forecast : null,
											currency: quote.currency,
											range: tab === "quote" ? range : "1Y",
											style: tab === "quote" ? chartStyle : "line"
										})
									]
								}),
								tab === "quote" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
									className: "mt-6 grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
											label: "Open",
											value: formatMoney(quote.open ?? 0, quote.currency)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
											label: "High",
											value: formatMoney(quote.high ?? 0, quote.currency)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
											label: "Low",
											value: formatMoney(quote.low ?? 0, quote.currency)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
											label: "Prev close",
											value: formatMoney(quote.previousClose, quote.currency)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
											label: "Volume",
											value: formatCompact(quote.volume ?? 0)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
											label: "52w high",
											value: formatMoney(quote.high52 ?? 0, quote.currency)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
											label: "52w low",
											value: formatMoney(quote.low52 ?? 0, quote.currency)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
											label: "Currency",
											value: quote.currency
										})
									]
								}),
								tab === "predict" && forecast && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-6 space-y-5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid gap-3 sm:grid-cols-3",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "rounded-[var(--radius-md)] bg-elevated p-4",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
															className: "text-xs tracking-wide text-subtle uppercase",
															children: "Next session"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
															className: "font-mono mt-2 text-2xl tabular-nums",
															children: formatMoney(forecast.nextClose, quote.currency)
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
															className: cn("mt-1 font-mono text-sm tabular-nums", forecast.nextClose >= forecast.lastClose ? "text-gain" : "text-loss"),
															children: [formatPct(forecast.nextClose / forecast.lastClose - 1), " vs last close"]
														})
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "rounded-[var(--radius-md)] bg-elevated p-4",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
															className: "text-xs tracking-wide text-subtle uppercase",
															children: "Stance"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
															className: "mt-2 text-2xl capitalize",
															children: forecast.direction
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
															className: "mt-1 font-mono text-sm text-muted tabular-nums",
															children: [
																"Confidence ",
																Math.round(forecast.confidence * 100),
																"%"
															]
														})
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "rounded-[var(--radius-md)] bg-elevated p-4",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
															className: "text-xs tracking-wide text-subtle uppercase",
															children: "Walk-forward"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
															className: "font-mono mt-2 text-2xl tabular-nums",
															children: [Math.round(forecast.backtest.directionalAccuracy * 100), "%"]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
															className: "mt-1 text-sm text-muted",
															children: [
																"Directional hits, last ",
																forecast.backtest.samples,
																" sessions"
															]
														})
													]
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "block text-sm text-muted",
											children: [
												"Horizon ",
												horizon,
												" session",
												horizon === 1 ? "" : "s",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "range",
													min: 1,
													max: 10,
													value: horizon,
													onChange: (e) => setHorizon(Number(e.target.value)),
													className: "mt-2 w-full accent-[var(--color-accent)]"
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "overflow-x-auto",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
												className: "w-full min-w-[28rem] text-left text-sm",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
													className: "text-xs tracking-wide text-subtle uppercase",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
															className: "pb-2 font-medium",
															children: "Signal"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
															className: "pb-2 font-medium",
															children: "Vote"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
															className: "pb-2 font-medium",
															children: "Note"
														})
													] })
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: forecast.votes.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
													className: "border-t border-border",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
															className: "py-2.5 pr-3",
															children: v.name
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
															className: cn("font-mono py-2.5 pr-3 tabular-nums", v.score > .05 ? "text-gain" : v.score < -.05 ? "text-loss" : "text-muted"),
															children: [v.score > 0 ? "+" : "", formatNumber(v.score, 2)]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
															className: "py-2.5 text-muted",
															children: v.note
														})
													]
												}, v.name)) })]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs leading-relaxed text-subtle",
											children: "Ensemble of linear trend, EMA 12/26, MACD, RSI mean-reversion, SMA 20/50 regime, Bollinger pull, and 10-day momentum. This is not LSTM or a promise of future returns."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex flex-wrap gap-2",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												type: "button",
												variant: "secondary",
												onClick: () => briefing.mutate(),
												disabled: briefing.isPending,
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-4" }), briefing.isPending ? "Writing briefing…" : "Grok briefing"]
											})
										}),
										briefing.data && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "rounded-[var(--radius-md)] border border-border p-4 text-sm leading-relaxed text-muted",
											children: briefing.data.ok ? briefing.data.text : briefing.data.error
										})
									]
								}),
								tab === "news" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewsCards, {
									items: news.data?.news ?? [],
									loading: news.isFetching
								}),
								tab === "market" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketPanel, { onOpen: (s) => {
									submitSymbol(s);
									setTab("quote");
								} }),
								tab === "watch" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WatchPanel, {
									quotes: watchQuotes.data ?? [],
									loading: watchQuotes.isFetching,
									onOpen: (s) => {
										submitSymbol(s);
										setTab("quote");
									}
								}),
								tab === "portfolio" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortfolioPanel, {
									quotes: watchQuotes.data ?? [],
									currentSymbol: symbol
								}),
								tab === "pnl" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PnLPanel, {
									currentSymbol: symbol,
									onOpen: (s) => {
										submitSymbol(s);
									}
								}),
								tab === "compare" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComparePanel, { seed: symbol }),
								tab === "alerts" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertsPanel, {
									currentSymbol: symbol,
									currentPrice: quote.price
								}),
								tab === "profile" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-6 space-y-4",
									children: [profile.isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-muted",
										children: "Loading company file…"
									}), profile.data && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
											className: "grid grid-cols-2 gap-3 text-sm sm:grid-cols-3",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
													label: "Ticker",
													value: profile.data.symbol
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
													label: "Exchange",
													value: profile.data.exchange
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
													label: "Type",
													value: profile.data.type
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
													label: "Sector",
													value: profile.data.sector ?? "—"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
													label: "Industry",
													value: profile.data.industry ?? "—"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
													label: "Currency",
													value: profile.data.currency
												})
											]
										}),
										profile.data.summary && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "max-w-prose text-sm leading-relaxed text-muted",
											children: profile.data.summary
										}),
										profile.data.wikiUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
											href: profile.data.wikiUrl,
											target: "_blank",
											rel: "noreferrer",
											className: "text-sm text-foreground underline decoration-border-strong underline-offset-4",
											children: "Company background"
										})
									] })]
								}),
								tab === "history" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-6",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mb-3 flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm text-muted",
											children: "Recent lookups on this device"
										}), history.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											type: "button",
											variant: "ghost",
											size: "sm",
											onClick: clearHistory,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }), "Clear"]
										})]
									}), history.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-subtle",
										children: "No searches yet."
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
										className: "space-y-1",
										children: history.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "flex h-11 w-full items-center justify-between rounded-[var(--radius-sm)] px-3 text-left hover:bg-elevated",
											onClick: () => submitSymbol(s),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono text-sm",
												children: s
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs text-subtle",
												children: i + 1
											})]
										}) }, `${s}-${i}`))
									})]
								}),
								tab === "dsa" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DsaPanel, { history })
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthorPlate, {})
		]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
		className: "text-xs tracking-wide text-subtle uppercase",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
		className: "font-mono mt-1 tabular-nums",
		children: value
	})] });
}
function AuthorPlate() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
		className: "mt-auto border-t border-border bg-card",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-6xl px-4 py-6 sm:px-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs tracking-[0.22em] text-subtle uppercase",
					children: "The nest"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display mt-1 text-lg italic tracking-tight",
					children: "NestInvest · hatch a view, then take the trade"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-5 grid gap-4 sm:grid-cols-3",
					children: TEAM.map((member) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-start gap-3",
						children: [member.instagram ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: member.instagram,
							target: "_blank",
							rel: "noreferrer",
							className: "shrink-0",
							"aria-label": `${member.name} on Instagram`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MemberPhoto, {
								src: member.photo,
								alt: member.name
							})
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MemberPhoto, {
							src: member.photo,
							alt: member.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-base leading-tight tracking-tight",
									children: member.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs leading-snug text-muted",
									children: DEGREE
								}),
								member.instagram && member.linkedin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 flex gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										href: member.instagram,
										target: "_blank",
										rel: "noreferrer",
										className: "inline-flex h-9 items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border border-border px-2.5 text-xs text-muted hover:text-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InstagramGlyph, {}), "Instagram"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										href: member.linkedin,
										target: "_blank",
										rel: "noreferrer",
										className: "inline-flex h-9 items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border border-border px-2.5 text-xs text-muted hover:text-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LinkedInGlyph, {}), "LinkedIn"]
									})]
								})
							]
						})]
					}, member.name))
				})
			]
		})
	});
}
var DEGREE = "B.Tech CSE · Graphic Era Deemed to be University, Dehradun";
var TEAM = [
	{
		name: "Yash Sharma",
		photo: "/yash.jpg",
		instagram: "https://www.instagram.com/yash_sharma49/",
		linkedin: "https://www.linkedin.com/in/yash-sharma-567a52273"
	},
	{
		name: "Yashraj Rawat",
		photo: "/yashraj.jpg"
	},
	{
		name: "Vivek Rana",
		photo: "/vivek.jpg"
	}
];
function MemberPhoto({ src, alt }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src,
		alt,
		width: 64,
		height: 64,
		className: "size-16 rounded-full border border-border object-cover object-top"
	});
}
function InstagramGlyph() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 24 24",
		className: "size-4",
		fill: "none",
		"aria-hidden": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "3.2",
				y: "3.2",
				width: "17.6",
				height: "17.6",
				rx: "5",
				stroke: "currentColor",
				strokeWidth: "1.7"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "12",
				cy: "12",
				r: "3.6",
				stroke: "currentColor",
				strokeWidth: "1.7"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "17.15",
				cy: "6.85",
				r: "0.9",
				fill: "currentColor"
			})
		]
	});
}
function LinkedInGlyph() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 24 24",
		className: "size-4",
		fill: "currentColor",
		"aria-hidden": true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M6.54 8.5H3.1V20.9h3.44V8.5zM4.82 3.1a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM20.9 13.16c0-4.14-2.21-6.07-5.16-6.07-2.38 0-3.44 1.31-4.03 2.23V8.5H8.28c.05 1.02 0 12.4 0 12.4h3.43v-6.93c0-.37.03-.74.14-1 .3-.74.98-1.51 2.13-1.51 1.5 0 2.1 1.15 2.1 2.83v5.61H20.9v-7.74z" })
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Desk, {});
}
//#endregion
export { Home as component };
