import {
  InsertEntity,
  PaginationQuery,
  Report,
  ReportRepository,
  UpdateEntity,
} from "../constant/types";

import { nanoid } from "nanoid";
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  DynamoDBClient,
  ListTablesCommand,
  CreateTableCommand,
} from "@aws-sdk/client-dynamodb";
import { WAITING } from "../constant/constants";

export class DynamoDbReportRepository implements ReportRepository {
  public static readonly tableName = "pdf-gen-example.jobs";
  public static readonly indexName = "created-jobStatus-index";

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
          { AttributeName: "id", AttributeType: "S" },
          { AttributeName: "created", AttributeType: "N" },
          { AttributeName: "jobStatus", AttributeType: "S" },
        ],
        TableName: DynamoDbReportRepository.tableName,
        KeySchema: [{ KeyType: "HASH", AttributeName: "id" }],
        BillingMode: "PAY_PER_REQUEST",
        GlobalSecondaryIndexes: [
          {
            IndexName: DynamoDbReportRepository.indexName,
            Projection: { ProjectionType: "ALL" },
            KeySchema: [
              { AttributeName: "jobStatus", KeyType: "HASH" },
              { AttributeName: "created", KeyType: "RANGE" },
            ],
          },
        ],
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
        jobStatus: WAITING,
      },

      TableName: DynamoDbReportRepository.tableName,
    });

    await this.ddbDocClient.send(putItem);

    return { id };
  }

  async update(id: string, partialReport: UpdateEntity<Report>): Promise<void> {
    const updateKeys = Object.keys(
      partialReport
    ) as (keyof UpdateEntity<Report>)[];

    if (!updateKeys.length) {
      return;
    }

    const updateExpressionParts = updateKeys.map((key) => `${key} = :${key}`);
    const expressionAttributeValuesParts = updateKeys.map((key) => [
      `:${key}`,
      partialReport[key],
    ]);

    const updateCommand = new UpdateCommand({
      TableName: DynamoDbReportRepository.tableName,
      Key: {
        id,
      },
      UpdateExpression: `set ${updateExpressionParts.join(", ")}`,
      ExpressionAttributeValues: Object.fromEntries(
        expressionAttributeValuesParts
      ),
    });

    await this.ddbDocClient.send(updateCommand);
  }

  async getOneOldestWaiting(): Promise<Report | null> {
    const query = new QueryCommand({
      TableName: DynamoDbReportRepository.tableName,
      IndexName: DynamoDbReportRepository.indexName,
      KeyConditionExpression: "jobStatus = :jobStatus",
      Limit: 1,
      ScanIndexForward: true, // true = ascending, false = descending
      ExpressionAttributeValues: {
        ":jobStatus": WAITING,
      },
    });

    const { Items: items } = await this.ddbDocClient.send(query);
    return items ? (items[0] as Report) : null;
  }
}
