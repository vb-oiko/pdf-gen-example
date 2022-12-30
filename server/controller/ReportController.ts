import { z } from "zod";
import { TRPCInstance } from "..";
import { FREQUENCIES, TICKERS } from "../constant/constants";
import { TickerDate, Report, PaginatedResponse } from "../constant/types";
import { ReportGenerationService } from "../service/ReportGenerationService";
import { ReportManagementService } from "../service/ReportManagementService";
import { isValidTickerDate } from "../utils/isValidTickerDate";

export const listReportsRequest = z.object({
  offset: z.number().optional(),
  limit: z.number().optional(),
});

export const createReportRequest = z.object({
  ticker: z.enum(TICKERS),
  date: z.custom<TickerDate>(isValidTickerDate),
  frequency: z.enum(FREQUENCIES),
});

export default class ReportController {
  constructor(
    private readonly trpcInstance: TRPCInstance,
    private readonly reportManagementService: ReportManagementService,
    private readonly reportGenerationService: ReportGenerationService
  ) {}

  listReports() {
    return this.trpcInstance.procedure
      .input(listReportsRequest)
      .query(async ({ input }): Promise<PaginatedResponse<Report>> => {
        return this.reportManagementService.list(input);
      });
  }

  createReport() {
    return this.trpcInstance.procedure
      .input(createReportRequest)
      .mutation(async ({ input }): Promise<CreateReportResponse> => {
        return this.reportManagementService.create(input);
      });
  }

  generateReport() {
    return this.trpcInstance.procedure
      .input(z.void())
      .mutation(async ({ input }): Promise<void> => {
        return this.reportGenerationService.generateReport();
      });
  }
}

export type CreateReportResponse = {
  id: string;
};
