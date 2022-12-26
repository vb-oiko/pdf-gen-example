import { FREQUENCIES, JOB_STATUSES, TICKERS } from "./constants";

export type Frequency = typeof FREQUENCIES[number];

export type Ticker = typeof TICKERS[number];

export type JobStatus = typeof JOB_STATUSES[number];
export type UnfinishedJobStatus = Exclude<JobStatus, "finished">;
export type FinishedJobStatus = Extract<JobStatus, "finished">;

export type TickerDate = string & { __type: "TickerDate" };

export interface BaseReport {
  id: string;
  created: number;
  date: TickerDate;
  ticker: Ticker;
  frequency: Frequency;
}

export interface UnfinishedReport extends BaseReport {
  status: UnfinishedJobStatus;
}

export interface FinishedReport extends BaseReport {
  status: FinishedJobStatus;
  url: string;
}

export type Report = UnfinishedReport | FinishedReport;

export interface Repository<T extends { id: string; created: number }> {
  list: ({
    limit,
    offset,
  }: {
    limit?: number;
    offset?: number;
  }) => Promise<T[]>;

  create: (insertEntity: Omit<T, "id" | "created">) => Promise<{ id: string }>;

  update: (
    id: string,
    insertEntity: Partial<Omit<T, "id" | "created">>
  ) => Promise<void>;

  getById: (id: string) => Promise<T>;
}
