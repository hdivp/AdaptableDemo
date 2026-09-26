/** One row in the demo grid. */
export interface Trade {
  id: string;
  ticker: string;
  side: "Buy" | "Sell";
  quantity: number;
  price: number;
  pnl: number;
  tradeDate: string;
  settled: boolean;
}

const TICKERS = [
  "AAPL", "MSFT", "AMZN", "GOOGL", "META", "NVDA", "TSLA", "JPM",
  "BRK.B", "V", "UNH", "XOM", "JNJ", "WMT", "PG", "MA",
];

/**
 * A tiny deterministic generator, so the demo shows the same rows on every
 * run. Not random enough for anything real, and it does not need to be.
 */
function makeRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

export function generateTrades(count = 500): Trade[] {
  const random = makeRandom(20260926);
  const start = Date.UTC(2026, 0, 1);
  const dayMs = 24 * 60 * 60 * 1000;

  return Array.from({ length: count }, (_, index) => {
    const ticker = TICKERS[Math.floor(random() * TICKERS.length)]!;
    const side = random() < 0.5 ? "Buy" : "Sell";
    const quantity = 25 * (1 + Math.floor(random() * 200));
    const price = Math.round((20 + random() * 480) * 100) / 100;
    const pnl = Math.round((random() * 40000 - 15000) * 100) / 100;
    const tradeDate = new Date(start + Math.floor(random() * 260) * dayMs);

    return {
      id: `T-${String(index + 1).padStart(5, "0")}`,
      ticker,
      side,
      quantity,
      price,
      pnl,
      tradeDate: tradeDate.toISOString().slice(0, 10),
      settled: random() < 0.72,
    };
  });
}
