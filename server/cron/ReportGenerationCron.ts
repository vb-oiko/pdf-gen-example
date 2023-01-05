import {
  FAILED,
  FINISHED,
  LOCK_EXPIRATION_TIMEOUT_MS,
  WORKING,
} from "../constant/constants";
import { Report, Repository } from "../constant/types";
import { ReportGenerationService } from "../service/ReportGenerationService";

export class ReportGenerationCron {
  constructor(
    private readonly lockRepository: LockRepository,
    private readonly reportRepository: Repository<Report>,
    private readonly reportGenerationService: ReportGenerationService,
    private readonly fileStorageService: FileStorageService
  ) {}

  public async run() {
    console.warn("Cron started");

    const now = Date.now();
    const lock = await this.lockRepository.getLock();

    if (lock) {
      const lockLifeTime = now - lock.timestamp;
      console.warn("Lock lifetime: ", lockLifeTime);

      if (lockLifeTime < LOCK_EXPIRATION_TIMEOUT_MS) {
        console.warn("Cron stopped: previous one is still working");
        return;
      }

      if (lockLifeTime >= LOCK_EXPIRATION_TIMEOUT_MS) {
        console.warn("Remove expired lock");
        await this.lockRepository.deleteLock();
      }
    }

    await this.lockRepository.createLock();

    while (true) {
      const report = await this.reportRepository.getOneOldestWaiting();

      if (!report) {
        console.warn("Cron stopped: no more jobs");
        break;
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
        break;
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

    await this.lockRepository.deleteLock();
    console.warn("Cron finished");
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

export interface LockRepository {
  createLock(): Promise<void>;
  deleteLock(): Promise<void>;
  getLock(): Promise<{ timestamp: number } | null>;
}

export interface FileStorageService {
  uploadFile(blob: Buffer, filename: string): Promise<void>;
  getDownloadUrl(filename: string): string;
}
