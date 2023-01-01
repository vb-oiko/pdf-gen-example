import { LOCK_EXPIRATION_TIMEOUT_MS } from "../constant/constants";
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
    const now = Date.now();
    const lock = await this.lockRepository.getLock();

    if (lock && now - lock.timestamp < LOCK_EXPIRATION_TIMEOUT_MS) {
      return;
    }

    if (lock && now - lock.timestamp >= LOCK_EXPIRATION_TIMEOUT_MS) {
      await this.lockRepository.deleteLock();
    }

    await this.lockRepository.createLock();

    while (true) {
      const nextReport = await this.reportRepository.getOneOldestWaiting();

      if (!nextReport) {
        break;
      }

      const pdfBlob = await this.reportGenerationService.generateReportPdfFile(
        nextReport
      );

      const filename = this.reportGenerationService.getFilename(nextReport);

      await this.fileStorageService.uploadFile(pdfBlob, filename);
    }

    await this.lockRepository.deleteLock();
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
