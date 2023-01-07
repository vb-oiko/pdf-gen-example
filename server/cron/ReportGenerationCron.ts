import { FAILED, FINISHED, WORKING } from "../constant/constants";
import { Report, Repository } from "../constant/types";
import { ReportGenerationService } from "../service/ReportGenerationService";

export class ReportGenerationCron {
  constructor(
    private readonly lockService: LockService,
    private readonly reportRepository: Repository<Report>,
    private readonly reportGenerationService: ReportGenerationService,
    private readonly fileStorageService: FileStorageService
  ) {}

  public async run() {
    console.warn("Cron started");

    if (this.lockService.isLocked()) {
      return;
    }

    this.lockService.acquireLock();

    await this.processJob();

    this.lockService.releaseLock();

    console.warn("Cron finished");
  }

  private async processJob() {
    const report = await this.reportRepository.getOneOldestWaiting();

    if (!report) {
      console.warn("No more jobs");
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
    const pdfBlob = await this.reportGenerationService.generateReportPdfFile(
      report
    );

    const filename = this.reportGenerationService.getFilename(report);

    await this.fileStorageService.uploadFile(pdfBlob, filename);

    const downloadUrl = this.fileStorageService.getDownloadUrl(filename);

    return downloadUrl;
  }
}

export interface FileStorageService {
  uploadFile(blob: Buffer, filename: string): Promise<void>;
  getDownloadUrl(filename: string): string;
}

export interface LockService {
  acquireLock(): void;
  releaseLock(): void;
  isLocked(): boolean;
}
