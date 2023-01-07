import { WAITING } from "../constant/constants";
import {
  PaginatedResponse,
  PaginationQuery,
  Report,
  Repository,
} from "../constant/types";

export class ReportManagementService {
  constructor(private readonly reportRepository: Repository<Report>) {}

  async list(query: PaginationQuery): Promise<PaginatedResponse<Report>> {
    return this.reportRepository.list(query);
  }

  async create(payload: CreateReportPayload): Promise<{ id: string }> {
    return this.reportRepository.create({ ...payload, jobStatus: WAITING });
  }
}

export type CreateReportPayload = Pick<Report, "ticker" | "date" | "frequency">;
