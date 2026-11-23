import {
  Area,
  CartesianGrid,
  ComposedChart,
  Customized,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Candle } from "@/lib/predict";
import type { ChartRange } from "@/lib/market";
import type { Forecast } from "@/lib/predict";
import { formatMoney } from "@/lib/utils";

type Point = {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  actual?: number;
  forecast?: number;
};

export type ChartStyle = "line" | "candle";

function formatTick(t: number, range: ChartRange) {
  const d = new Date(t);
  if (range === "1D") {
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
  if (range === "1W") {
    return d.toLocaleDateString("en-US", { weekday: "short", hour: "numeric" });
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function CandleLayer(props: {
  xAxisMap?: Record<string, { scale: (v: number) => number }>;
  yAxisMap?: Record<string, { scale: (v: number) => number }>;
  candles: Point[];
}) {
  const xAxis = props.xAxisMap ? Object.values(props.xAxisMap)[0] : undefined;
  const yAxis = props.yAxisMap ? Object.values(props.yAxisMap)[0] : undefined;
  if (!xAxis || !yAxis || props.candles.length === 0) return null;
  const slot =
    props.candles.length > 1
      ? Math.abs(xAxis.scale(props.candles[1]!.t) - xAxis.scale(props.candles[0]!.t))
      : 8;
  const w = Math.max(2, Math.min(9, slot * 0.55));
  return (
    <g>
      {props.candles.map((c) => {
        const x = xAxis.scale(c.t);
        const up = c.c >= c.o;
        const color = up ? "var(--color-gain)" : "var(--color-loss)";
        const top = Math.min(yAxis.scale(c.o), yAxis.scale(c.c));
        const body = Math.max(1, Math.abs(yAxis.scale(c.c) - yAxis.scale(c.o)));
        return (
          <g key={c.t}>
            <line
              x1={x}
              x2={x}
              y1={yAxis.scale(c.h)}
              y2={yAxis.scale(c.l)}
              stroke={color}
              strokeWidth={1}
            />
            <rect x={x - w / 2} y={top} width={w} height={body} fill={color} />
          </g>
        );
      })}
    </g>
  );
}

export function PriceChart({
  candles,
  forecast,
  currency,
  range = "1Y",
  style = "line",
}: {
  candles: Candle[];
  forecast: Forecast | null;
  currency: string;
  range?: ChartRange;
  style?: ChartStyle;
}) {
  const recent = range === "1Y" && style === "line" ? candles.slice(-90) : candles;
  const points: Point[] = recent.map((c) => ({
    t: c.t,
    o: c.o,
    h: c.h,
    l: c.l,
    c: c.c,
    actual: c.c,
  }));
  if (forecast && points.length) {
    const last = points[points.length - 1]!;
    points[points.length - 1] = { ...last, forecast: last.c };
    for (const p of forecast.path) {
      points.push({
        t: last.t + p.day * 86_400_000,
        o: p.price,
        h: p.price,
        l: p.price,
        c: p.price,
        forecast: p.price,
      });
    }
  }
  const plotted = style === "candle" ? points.filter((p) => p.actual != null) : points;

  return (
    <div className="h-64 w-full sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="fillActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-chart)" stopOpacity={0.28} />
              <stop offset="100%" stopColor="var(--color-chart)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--color-grid)" vertical={false} />
          <XAxis
            dataKey="t"
            tickFormatter={(v) => formatTick(Number(v), range)}
            tick={{ fill: "var(--color-subtle)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            minTickGap={28}
          />
          <YAxis
            domain={["auto", "auto"]}
            dataKey="c"
            tickFormatter={(v) =>
              Number(v).toLocaleString("en-US", { maximumFractionDigits: 0 })
            }
            tick={{ fill: "var(--color-subtle)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-elevated)",
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              fontSize: 12,
              color: "var(--color-foreground)",
            }}
            labelFormatter={(v) =>
              range === "1D" || range === "1W"
                ? new Date(Number(v)).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })
                : new Date(Number(v)).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
            }
            formatter={(value, name) => {
              if (name === "forecast") return [formatMoney(Number(value), currency), "Forecast"];
              if (name === "actual" || name === "c") return [formatMoney(Number(value), currency), "Close"];
              return [formatMoney(Number(value), currency), String(name)];
            }}
          />
          {style === "line" ? (
            <Area
              type="monotone"
              dataKey="actual"
              stroke="var(--color-chart)"
              fill="url(#fillActual)"
              strokeWidth={1.6}
              dot={false}
              connectNulls={false}
              isAnimationActive={false}
            />
          ) : (
            <Customized
              component={(raw) => {
                const props = (raw ?? {}) as {
                  xAxisMap?: Record<string, { scale: (v: number) => number }>;
                  yAxisMap?: Record<string, { scale: (v: number) => number }>;
                };
                return <CandleLayer {...props} candles={plotted} />;
              }}
            />
          )}
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="var(--color-accent)"
            strokeDasharray="4 4"
            strokeWidth={1.6}
            dot={false}
            connectNulls
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}