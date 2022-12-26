import { z } from "zod";
import { TRPCInstance } from "..";
import { FREQUENCIES, TICKERS } from "../constant/constants";
import { TickerDate, ReportJob } from "../constant/types";
import { isValidTickerDate } from "../utils/isValidTickerDate";

export const listReportsRequest = z
  .object({
    offset: z.number().nullish(),
    limit: z.number().nullish(),
  })
  .nullish();

export const createReportRequest = z
  .object({
    ticker: z.enum(TICKERS),
    date: z.custom<TickerDate>(isValidTickerDate),
    frequency: z.enum(FREQUENCIES),
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
      .input(createReportRequest)
      .query((): CreateReportResponse => {
        return { id: "1" };
      });
  }
}

export type ListReportsResponse = {
  list: ReportJob[];
  total: number;
};

export type CreateReportResponse = {
  id: string;
};
