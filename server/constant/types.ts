export const JobStatuses = ["new", "working", "finished"] as const;
export type JobStatus = typeof JobStatuses[number];

export type UnfinishedJobStatus = Exclude<JobStatus, "finished">;
export type FinishedJobStatus = Extract<JobStatus, "finished">;

export type UnfinishedReportJob = {
  id: string;
  created: number;
  status: UnfinishedJobStatus;
};

export type FinishedReportJob = {
  id: string;
  created: number;
  status: FinishedJobStatus;
  url: string;
};

export type ReportJob = UnfinishedReportJob | FinishedReportJob;
