import { TickerDate } from "./types";

export const WAITING = "waiting";
export const WORKING = "working";
export const FINISHED = "finished";
export const FAILED = "finished";

export const JOB_STATUSES = [WAITING, WORKING, FINISHED, FAILED] as const;

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

export const LOCK_EXPIRATION_TIMEOUT_MS = 5_000;
export const REPORT_GENERATION_CRON_EXPRESSION = "*/2 * * * * *"; // every 2 seconds

export const SERVER_PORT = 2022;
