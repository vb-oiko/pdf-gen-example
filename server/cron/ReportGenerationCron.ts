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
    const report = await this.reportRepository.getOneOldestWaiting();

    if (!report) {
      return;
    }

    console.warn("Task processing started: ", report.id.slice(0, 6));

    await this.reportRepository.update(report.id, {
      jobStatus: WORKING,
    });

    let downloadUrl: string | undefined;

    try {
      downloadUrl = await this.processAnsUploadReport(report);
    } catch (error) {
      await this.reportRepository.update(report.id, {
        jobStatus: FAILED,
      });
      return;
    }

    if (!downloadUrl) {
      console.warn("No download url: ", report.id.slice(0, 6));
    }

    await this.reportRepository.update(report.id, {
      jobStatus: FINISHED,
      downloadUrl,
    });
    console.warn("Task processing finished: ", report.id.slice(0, 6));
  }

  private async processAnsUploadReport(report: Report): Promise<string> {
    const { pdfBlob, filename } =
      await this.reportGenerationService.generateReportPdfFile(report);

    await this.fileStorageService.uploadFile(pdfBlob, filename);

    const downloadUrl = this.fileStorageService.getDownloadUrl(filename);

    return downloadUrl;
  }
}
