import {
  InsertEntity,
  PaginationQuery,
  Report,
  Repository,
  UpdateEntity,
} from "../constant/types";

export class DynamoDbReportRepository implements Repository<Report> {
  async list({ limit, offset }: PaginationQuery) {
    return { list: [], total: 0 };
  }

  async create(insertReport: InsertEntity<Report>) {
    return { id: "1" };
  }

  async update(id: string, partialReport: UpdateEntity<Report>) {}

  async getById(id: string): Promise<Report> {
    throw new Error("Not implemented");
  }
}