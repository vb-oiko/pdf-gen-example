import { TickerDate } from "./types";

export const JOB_STATUSES = ["new", "working", "finished"] as const;

export const DATE_RANGE_START = "2021-03-01" as TickerDate;

export const FREQUENCIES = [
  "1m",
  "3m",
  "5m",
  "15m",
  "30m",
  "1h",
  "2h",
  "4h",
  "6h",
  "8h",
  "12h",
] as const;

export const TICKERS = ["1INCHBTC", "1INCHBUSD"] as const;
