export type PnLDetails = {
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  projectedPrice: number;
  targetPrice?: number | null;
};

export type PnLResult = {
  cost: number;
  currentValue: number;
  currentPnl: number;
  currentPct: number;
  projectedValue: number;
  projectedPnl: number;
  projectedPct: number;
  targetValue: number | null;
  targetPnl: number | null;
  targetPct: number | null;
  breakEven: number;
  perShareNow: number;
  perShareProjected: number;
};

function pct(pnl: number, cost: number) {
  return cost > 0 ? pnl / cost : 0;
}

export function calculatePnL(details: PnLDetails): PnLResult | null {
  const { quantity, buyPrice, currentPrice, projectedPrice } = details;
  if (!Number.isFinite(quantity) || quantity <= 0) return null;
  if (!Number.isFinite(buyPrice) || buyPrice < 0) return null;
  if (!Number.isFinite(currentPrice) || !Number.isFinite(projectedPrice)) return null;

  const cost = quantity * buyPrice;
  const currentValue = quantity * currentPrice;
  const projectedValue = quantity * projectedPrice;
  const target =
    details.targetPrice != null &&
    Number.isFinite(details.targetPrice) &&
    details.targetPrice > 0
      ? details.targetPrice
      : null;
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
    perShareProjected: projectedPrice - buyPrice,
  };
}
