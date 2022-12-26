import { z } from "zod";
import { TRPCInstance } from "..";
import { ReportJob, UnfinishedReportJob } from "../constant/types";
import { getCurrentTimestamp } from "../utils/getCurrentTimestamp";

export const listReportsRequest = z
  .object({
    offset: z.number().nullish(),
    limit: z.number().nullish(),
  })
  .nullish();

export const createReportRequest = z
  .object({
    ticker: z.string(),
  })
  .nullish();

export default class ReportController {
  constructor(private readonly trpcInstance: TRPCInstance) {}

  listReports() {
    return this.trpcInstance.procedure
      .input(listReportsRequest)
      .query((): ListReportsResponse => {
        return { list: [], total: 0 };
      });
  }

  createReport() {
    return this.trpcInstance.procedure
      .input(listReportsRequest)
      .query((): CreateReportResponse => {
        return { id: "1", status: "new", created: getCurrentTimestamp() };
      });
  }
}

export type ListReportsResponse = {
  list: ReportJob[];
  total: number;
};

export type CreateReportResponse = UnfinishedReportJob;
