import { z } from "zod";
import { TRPCInstance } from "..";
import { FREQUENCIES, TICKERS, WORKING } from "../constant/constants";
import { TickerDate, Report, PaginatedResponse } from "../constant/types";
import { DynamoDbReportRepository } from "../repository/DynamoDbReportRepository";
import { ReportGenerationService } from "../service/ReportGenerationService";
import { ReportManagementService } from "../service/ReportManagementService";
import { S3FileStorageService } from "../service/S3FileStorageService";
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
    private readonly reportGenerationService: ReportGenerationService,
    private readonly fileStorageService: S3FileStorageService,
    private readonly reportRepository: DynamoDbReportRepository
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
      .input(
        z.object({
          id: z.string(),
        })
      )
      .mutation(async ({ input }): Promise<void> => {
        const report = await this.reportRepository.getOneOldestWaiting();
        if (!report) {
          console.warn("no reports for generation");

          return;
        }

        const pdfBlob =
          await this.reportGenerationService.generateReportPdfFile(report);

        const filename = this.reportGenerationService.getFilename(report);

        await this.fileStorageService.uploadFile(pdfBlob, filename);
        const downloadUrl = this.fileStorageService.getDownloadUrl(filename);

        await this.reportRepository.update(report.id, {
          jobStatus: "finished",
          downloadUrl,
        });

        console.warn({ report });
      });
  }
}

export type CreateReportResponse = {
  id: string;
};
