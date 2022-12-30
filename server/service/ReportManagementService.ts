import {
  Frequency,
  PaginatedResponse,
  PaginationQuery,
  Report,
  Repository,
  Ticker,
  TickerDate,
} from "../constant/types";

export class ReportManagementService {
  constructor(private readonly reportRepository: Repository<Report>) {}

  async list(query: PaginationQuery): Promise<PaginatedResponse<Report>> {
    return this.reportRepository.list(query);
  }

  async create(payload: CreateReportPayload): Promise<{ id: string }> {
    return this.reportRepository.create({ ...payload, jobStatus: "new" });
  }
}

export type CreateReportPayload = {
  ticker: Ticker;
  date: TickerDate;
  frequency: Frequency;
};
