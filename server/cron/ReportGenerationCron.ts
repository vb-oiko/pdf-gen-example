import { FAILED, FINISHED, WORKING } from "../constant/constants";
import {
  FileStorageService,
  LockService,
  Report,
  ReportRepository,
} from "../constant/types";
import { ReportGenerationService } from "../service/ReportGenerationService";

export class ReportGenerationCron {
  constructor(
    private readonly lockService: LockService,
    private readonly reportRepository: ReportRepository,
    private readonly reportGenerationService: ReportGenerationService,
    private readonly fileStorageService: FileStorageService
  ) {}

  public async run() {
    if (this.lockService.isLocked()) {
      return;
    }

    this.lockService.acquireLock();
    await this.processJob();
    this.lockService.releaseLock();
  }

  private async processJob() {
    let report: Report | null = null;

    try {
      report = await this.reportRepository.getOneOldestWaiting();
    } catch (error) {
      console.warn("Failed to get next task to process", error);
      return;
    }

    if (!report) {
      return;
    }
    console.warn("Task processing started: ", report.id);

    try {
      await this.reportRepository.update(report.id, {
        jobStatus: WORKING,
      });
    } catch (error) {
      console.warn("Failed to update task status", error);
    }

    let downloadUrl: string | undefined;

    try {
      downloadUrl = await this.processAnsUploadReport(report);
    } catch (error) {
      console.warn("Task processing failed");

      try {
        await this.reportRepository.update(report.id, {
          jobStatus: FAILED,
        });
      } catch (error) {
        console.warn("Failed to update task status", error);
      }

      return;
    }

    if (!downloadUrl) {
      console.warn("No download url: ", report.id);
    }

    try {
      await this.reportRepository.update(report.id, {
        jobStatus: FINISHED,
        downloadUrl,
      });
    } catch (error) {
      console.warn("Failed to update task status", error);
    }

    console.warn("Task processing finished: ", report.id);
    return;
  }

  private async processAnsUploadReport(report: Report): Promise<string> {
    const { pdfBlob, filename } =
      await this.reportGenerationService.generateReportPdfFile(report);

    const downloadUrl = await this.fileStorageService.uploadFile(
      pdfBlob,
      filename
    );

    return downloadUrl;
  }
}
