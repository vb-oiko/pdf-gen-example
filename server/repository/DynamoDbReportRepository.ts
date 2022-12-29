import {
  InsertEntity,
  PaginationQuery,
  Report,
  Repository,
  UpdateEntity,
} from "../constant/types";

import { nanoid } from "nanoid";
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";

export class DynamoDbReportRepository implements Repository<Report> {
  private readonly tableName = "pdf-gen-example.jobs";

  constructor(private readonly dynamoDBClient: DynamoDBDocumentClient) {}

  async list({ limit, offset }: PaginationQuery) {
    const scanCommand = new ScanCommand({
      TableName: this.tableName,
    });
    const { Count, Items } = await this.dynamoDBClient.send(scanCommand);

    return { list: (Items as Report[]) || [], total: Count || 0 };
  }

  async create(insertReport: InsertEntity<Report>) {
    const { ticker, frequency, date } = insertReport;
    const id = nanoid();

    const putItem = new PutCommand({
      Item: {
        id,
        created: Date.now(),
        ticker,
        frequency,
        date,
        status: "new",
      },

      TableName: this.tableName,
    });

    await this.dynamoDBClient.send(putItem);

    return { id };
  }

  async update(id: string, partialReport: UpdateEntity<Report>) {}

  async getById(id: string): Promise<Report> {
    throw new Error("Not implemented");
  }
}
