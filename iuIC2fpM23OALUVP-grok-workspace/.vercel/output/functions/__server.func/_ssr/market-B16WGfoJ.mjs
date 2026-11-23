import { n as createServerFn, r as TSS_SERVER_FUNCTION } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/market-B16WGfoJ.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
function cleanSymbol(symbol) {
	const s = symbol.trim().toUpperCase();
	if (!/^[A-Z0-9.^|=-]{1,16}$/.test(s)) throw new Error("Enter a valid ticker (letters, numbers, dots).");
	return s;
}
async function yahoo(url) {
	const res = await fetch(url, { headers: {
		"User-Agent": UA,
		Accept: "application/json"
	} });
	if (!res.ok) throw new Error(`Market data error (${res.status})`);
	return res.json();
}
var RANGE_SPEC = {
	"1D": {
		range: "1d",
		interval: "5m"
	},
	"1W": {
		range: "5d",
		interval: "15m"
	},
	"1M": {
		range: "1mo",
		interval: "1d"
	},
	"3M": {
		range: "3mo",
		interval: "1d"
	},
	"1Y": {
		range: "1y",
		interval: "1d"
	}
};
var MARKET_INDEXES = [
	{
		symbol: "^GSPC",
		label: "S&P 500"
	},
	{
		symbol: "^DJI",
		label: "Dow"
	},
	{
		symbol: "^IXIC",
		label: "Nasdaq"
	},
	{
		symbol: "^RUT",
		label: "Russell 2000"
	},
	{
		symbol: "^VIX",
		label: "VIX"
	}
];
function parseChart(raw, symbol) {
	const chart = raw;
	const result = chart.chart?.result?.[0];
	if (!result) throw new Error(chart.chart?.error?.description || `No data for ${symbol}`);
	const meta = result.meta;
	const ts = result.timestamp ?? [];
	const q = result.indicators?.quote?.[0];
	const adj = result.indicators?.adjclose?.[0]?.adjclose;
	const candles = [];
	for (let i = 0; i < ts.length; i++) {
		const c = adj?.[i] ?? q?.close?.[i];
		const o = q?.open?.[i];
		const h = q?.high?.[i];
		const l = q?.low?.[i];
		const v = q?.volume?.[i];
		if (c == null || !Number.isFinite(c)) continue;
		candles.push({
			t: ts[i] * 1e3,
			o: Number(o ?? c),
			h: Number(h ?? c),
			l: Number(l ?? c),
			c: Number(c),
			v: Number(v ?? 0)
		});
	}
	const price = Number(meta.regularMarketPrice ?? candles.at(-1)?.c ?? 0);
	const changePct = Number(meta.regularMarketChangePercent ?? 0) / 100;
	const previousClose = Number.isFinite(changePct) && changePct > -.95 ? price / (1 + changePct) : Number(candles.at(-2)?.c ?? price);
	const change = price - previousClose;
	return {
		quote: {
			symbol: String(meta.symbol ?? symbol),
			name: String(meta.longName || meta.shortName || symbol),
			currency: String(meta.currency || "USD"),
			exchange: String(meta.fullExchangeName || meta.exchangeName || ""),
			price,
			previousClose,
			change,
			changePct,
			open: candles.at(-1)?.o ?? null,
			high: Number(meta.regularMarketDayHigh ?? candles.at(-1)?.h ?? 0) || null,
			low: Number(meta.regularMarketDayLow ?? candles.at(-1)?.l ?? 0) || null,
			volume: Number(meta.regularMarketVolume ?? 0) || null,
			high52: Number(meta.fiftyTwoWeekHigh ?? 0) || null,
			low52: Number(meta.fiftyTwoWeekLow ?? 0) || null
		},
		candles
	};
}
var fetchQuoteBundle_createServerFn_handler = createServerRpc({
	id: "165c8c7d1b1302128302346993c8b4e3aca297ee51230c7cdea2882cc56dc925",
	name: "fetchQuoteBundle",
	filename: "src/lib/market.ts"
}, (opts) => fetchQuoteBundle.__executeServer(opts));
var fetchQuoteBundle = createServerFn({ method: "POST" }).validator((input) => input).handler(fetchQuoteBundle_createServerFn_handler, async ({ data }) => {
	const symbol = cleanSymbol(data.symbol);
	return parseChart(await yahoo(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1y&interval=1d&includePrePost=false`), symbol);
});
var fetchChart_createServerFn_handler = createServerRpc({
	id: "11b2e9f6090e34ea4cca52560bded20defa3707b2fb20dd7133db960bb90d972",
	name: "fetchChart",
	filename: "src/lib/market.ts"
}, (opts) => fetchChart.__executeServer(opts));
var fetchChart = createServerFn({ method: "POST" }).validator((input) => input).handler(fetchChart_createServerFn_handler, async ({ data }) => {
	const symbol = cleanSymbol(data.symbol);
	const spec = RANGE_SPEC[data.range] ?? RANGE_SPEC["1M"];
	const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${spec.range}&interval=${spec.interval}&includePrePost=false`;
	try {
		return parseChart(await yahoo(url), symbol);
	} catch (err) {
		if (data.range !== "1D") throw err;
		return parseChart(await yahoo(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=15m&includePrePost=false`), symbol);
	}
});
var fetchCharts_createServerFn_handler = createServerRpc({
	id: "d3f4d1e032bd334d01cf7a63c3b5f8ec619ee272b284db198d1e0e8c83fb6015",
	name: "fetchCharts",
	filename: "src/lib/market.ts"
}, (opts) => fetchCharts.__executeServer(opts));
var fetchCharts = createServerFn({ method: "POST" }).validator((input) => input).handler(fetchCharts_createServerFn_handler, async ({ data }) => {
	const spec = RANGE_SPEC[data.range] ?? RANGE_SPEC["3M"];
	const symbols = [...new Set(data.symbols.map((s) => s.trim().toUpperCase()))].filter((s) => /^[A-Z0-9.^|=-]{1,16}$/.test(s)).slice(0, 4);
	return (await Promise.all(symbols.map(async (symbol) => {
		try {
			return parseChart(await yahoo(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${spec.range}&interval=${spec.interval}&includePrePost=false`), symbol);
		} catch {
			return null;
		}
	}))).filter((x) => x != null);
});
var fetchMarketOverview_createServerFn_handler = createServerRpc({
	id: "fc815e5644405810182412ae1a21ce6a9631c588befda1895470ea659be41c2f",
	name: "fetchMarketOverview",
	filename: "src/lib/market.ts"
}, (opts) => fetchMarketOverview.__executeServer(opts));
var fetchMarketOverview = createServerFn({ method: "POST" }).handler(fetchMarketOverview_createServerFn_handler, async () => {
	return (await Promise.all(MARKET_INDEXES.map(async (idx) => {
		try {
			const { quote } = parseChart(await yahoo(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(idx.symbol)}?range=5d&interval=1d`), idx.symbol);
			return {
				...quote,
				label: idx.label
			};
		} catch {
			return null;
		}
	}))).filter((x) => x != null);
});
var searchTickers_createServerFn_handler = createServerRpc({
	id: "4d70ceadd7bc3d3d8b056f2fb28f9c8ebfb53a9c28892d40bf6438745b4ae850",
	name: "searchTickers",
	filename: "src/lib/market.ts"
}, (opts) => searchTickers.__executeServer(opts));
var searchTickers = createServerFn({ method: "POST" }).validator((input) => input).handler(searchTickers_createServerFn_handler, async ({ data }) => {
	const q = data.q.trim();
	if (q.length < 1) return {
		quotes: [],
		news: []
	};
	const raw = await yahoo(`https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=8&newsCount=12`);
	return {
		quotes: (raw.quotes ?? []).filter((x) => typeof x.symbol === "string").map((x) => ({
			symbol: String(x.symbol),
			name: String(x.longname || x.shortname || x.symbol),
			type: String(x.typeDisp || x.quoteType || "Equity"),
			exchange: String(x.exchDisp || x.exchange || ""),
			sector: x.sector ? String(x.sector) : void 0,
			industry: x.industry ? String(x.industry) : void 0
		})),
		news: (raw.news ?? []).map((n) => {
			const thumb = n.thumbnail;
			const thumbnail = thumb?.resolutions?.[0]?.url ? String(thumb.resolutions[0].url) : void 0;
			return {
				id: String(n.uuid ?? n.title ?? Math.random()),
				title: String(n.title ?? "Untitled"),
				publisher: String(n.publisher ?? "News"),
				url: String(n.link ?? n.url ?? "#"),
				published: Number(n.providerPublishTime ?? 0) * 1e3,
				thumbnail
			};
		})
	};
});
var fetchProfile_createServerFn_handler = createServerRpc({
	id: "b7056b6fe563adf9182ad5e165f06180a751f5aa5a13cd759c202bb4bd498123",
	name: "fetchProfile",
	filename: "src/lib/market.ts"
}, (opts) => fetchProfile.__executeServer(opts));
var fetchProfile = createServerFn({ method: "POST" }).validator((input) => input).handler(fetchProfile_createServerFn_handler, async ({ data }) => {
	const symbol = cleanSymbol(data.symbol);
	const [search, chartRaw] = await Promise.all([yahoo(`https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(symbol)}&quotesCount=5&newsCount=0`), yahoo(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=5d&interval=1d`)]);
	const { quote } = parseChart(chartRaw, symbol);
	const hit = search.quotes?.find((x) => String(x.symbol).toUpperCase() === symbol) ?? search.quotes?.[0];
	const name = quote.name;
	let summary;
	let wikiUrl;
	try {
		const wikiName = name.replace(/,?\s+(Inc\.|Corp\.|Corporation|Ltd\.|plc|Co\.)$/i, "");
		const wiki = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiName)}`, { headers: {
			"User-Agent": UA,
			Accept: "application/json"
		} });
		if (wiki.ok) {
			const page = await wiki.json();
			if (page.type !== "disambiguation" && page.extract) {
				summary = page.extract;
				wikiUrl = page.content_urls?.desktop?.page;
			}
		}
	} catch {}
	return {
		symbol: quote.symbol,
		name,
		exchange: quote.exchange,
		currency: quote.currency,
		type: String(hit?.typeDisp || hit?.quoteType || "Equity"),
		sector: hit?.sector ? String(hit.sector) : void 0,
		industry: hit?.industry ? String(hit.industry) : void 0,
		summary,
		wikiUrl
	};
});
var fetchWatchQuotes_createServerFn_handler = createServerRpc({
	id: "a4093e02d189c2fc3e9f72c9ded39a1f6235470aa0f3c27fa3341ad3133bd80a",
	name: "fetchWatchQuotes",
	filename: "src/lib/market.ts"
}, (opts) => fetchWatchQuotes.__executeServer(opts));
var fetchWatchQuotes = createServerFn({ method: "POST" }).validator((input) => input).handler(fetchWatchQuotes_createServerFn_handler, async ({ data }) => {
	const symbols = [...new Set(data.symbols.map((s) => s.trim().toUpperCase()))].filter((s) => /^[A-Z0-9.^|=-]{1,16}$/.test(s)).slice(0, 24);
	return (await Promise.all(symbols.map(async (symbol) => {
		try {
			return parseChart(await yahoo(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=5d&interval=1d`), symbol).quote;
		} catch {
			return null;
		}
	}))).filter((x) => x != null);
});
var explainForecast_createServerFn_handler = createServerRpc({
	id: "9897c6d734ad9c62bedcb29b889b8782609585e9f6ee757e2ba0927f3a53889e",
	name: "explainForecast",
	filename: "src/lib/market.ts"
}, (opts) => explainForecast.__executeServer(opts));
var explainForecast = createServerFn({ method: "POST" }).validator((input) => input).handler(explainForecast_createServerFn_handler, async ({ data }) => {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "AI briefing is not available here."
	};
	const res = await fetch("https://api.x.ai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model: "grok-4.5",
			max_tokens: 280,
			temperature: .4,
			messages: [{
				role: "system",
				content: "You are a markets desk analyst. Explain a technical ensemble forecast in 2 short paragraphs plus 3 bullets. Be precise, skeptical, and never give personalized investment advice. Mention this is a statistical sketch, not a guarantee."
			}, {
				role: "user",
				content: JSON.stringify(data)
			}]
		})
	});
	if (!res.ok) return {
		ok: false,
		error: `Briefing failed (${res.status})`
	};
	return {
		ok: true,
		text: (await res.json()).choices[0]?.message.content ?? ""
	};
});
//#endregion
export { explainForecast_createServerFn_handler, fetchChart_createServerFn_handler, fetchCharts_createServerFn_handler, fetchMarketOverview_createServerFn_handler, fetchProfile_createServerFn_handler, fetchQuoteBundle_createServerFn_handler, fetchWatchQuotes_createServerFn_handler, searchTickers_createServerFn_handler };
