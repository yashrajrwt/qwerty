export type StockRow = {
  symbol: string;
  name: string;
  price: number;
  changePct: number;
  volume: number;
  sector: string;
};

export const SECTORS: Record<string, string> = {
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
  NFLX: "Media",
};

export function sectorOf(symbol: string) {
  return SECTORS[symbol] ?? "Other";
}
