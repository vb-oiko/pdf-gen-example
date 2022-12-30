import { Report, Repository } from "../constant/types";

export class ReportGenerationService {
  constructor(private readonly reportRepository: Repository<Report>) {}

  async generateReport(): Promise<void> {
    const nextReportToGenerate =
      await this.reportRepository.getOneCreatedAscWithNewStatus();
    console.warn(nextReportToGenerate);
  }
}
