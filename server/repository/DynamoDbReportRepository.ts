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
import {
  DynamoDBClient,
  ListTablesCommand,
  CreateTableCommand,
} from "@aws-sdk/client-dynamodb";

export class DynamoDbReportRepository implements Repository<Report> {
  public static readonly tableName = "pdf-gen-example.jobs";

  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  public static async init(
    dynamoDBClient: DynamoDBClient,
    ddbDocClient: DynamoDBDocumentClient
  ) {
    const listTablesCommand = new ListTablesCommand({});
    const { TableNames } = await dynamoDBClient.send(listTablesCommand);

    if (!TableNames?.includes(DynamoDbReportRepository.tableName)) {
      const createTableCommand = new CreateTableCommand({
        AttributeDefinitions: [
          { AttributeName: "status", AttributeType: "S" },
          { AttributeName: "created", AttributeType: "N" },
        ],
        TableName: DynamoDbReportRepository.tableName,
        KeySchema: [
          { KeyType: "HASH", AttributeName: "status" },
          { KeyType: "RANGE", AttributeName: "created" },
        ],
        BillingMode: "PAY_PER_REQUEST",
      });

      await dynamoDBClient.send(createTableCommand);
    }

    return new DynamoDbReportRepository(ddbDocClient);
  }

  async list({ limit, offset }: PaginationQuery) {
    const scanCommand = new ScanCommand({
      TableName: DynamoDbReportRepository.tableName,
      // FilterExpression: "",
    });
    const { Count, Items } = await this.ddbDocClient.send(scanCommand);

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

      TableName: DynamoDbReportRepository.tableName,
    });

    await this.ddbDocClient.send(putItem);

    return { id };
  }

  async update(id: string, partialReport: UpdateEntity<Report>) {}

  async getById(id: string): Promise<Report> {
    throw new Error("Not implemented");
  }
}
