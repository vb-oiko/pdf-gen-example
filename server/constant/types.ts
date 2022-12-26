import { FREQUENCIES, JOB_STATUSES, TICKERS } from "./constants";

export type Frequency = typeof FREQUENCIES[number];

export type Ticker = typeof TICKERS[number];

export type JobStatus = typeof JOB_STATUSES[number];
export type UnfinishedJobStatus = Exclude<JobStatus, "finished">;
export type FinishedJobStatus = Extract<JobStatus, "finished">;

export type TickerDate = string & { __type: "TickerDate" };

export interface BaseReportJob {
  id: string;
  created: number;
  date: TickerDate;
  ticker: Ticker;
  frequency: Frequency;
}

export interface UnfinishedReportJob {
  status: UnfinishedJobStatus;
}

export interface FinishedReportJob {
  status: FinishedJobStatus;
  url: string;
}

export type ReportJob = UnfinishedReportJob | FinishedReportJob;

export interface Repository<T> {
  list: ({
    limit,
    offset,
  }: {
    limit?: number;
    offset?: number;
  }) => Promise<T[]>;

  add: ({ limit, offset }: { limit?: number; offset?: number }) => Promise<T[]>;
}
