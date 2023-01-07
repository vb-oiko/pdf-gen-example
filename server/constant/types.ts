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
  downloadUrl?: string;
}

export interface UnfinishedReport extends BaseReport {
  jobStatus: UnfinishedJobStatus;
}

export interface FinishedReport extends BaseReport {
  jobStatus: FinishedJobStatus;
  downloadUrl: string;
}

export type Report = UnfinishedReport | FinishedReport;

export type PaginationQuery = {
  limit?: number;
  offset?: number;
};

export type PaginatedResponse<T> = { list: T[]; total: number };

type AutoAssignedFieldsType = { id: string; created: number };
type AutoAssignedFields = keyof AutoAssignedFieldsType;

export type InsertEntity<T extends AutoAssignedFieldsType> = Omit<
  T,
  AutoAssignedFields
>;

export type UpdateEntity<T> = Partial<Omit<T, AutoAssignedFields>>;

export interface ReportRepository {
  list: ({
    limit,
    offset,
  }: PaginationQuery) => Promise<PaginatedResponse<Report>>;

  create: (insertEntity: InsertEntity<Report>) => Promise<{ id: string }>;

  update: (id: string, updateEntity: UpdateEntity<Report>) => Promise<void>;

  getOneOldestWaiting: () => Promise<Report | null>;
}
