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
  waitUntilTableExists,
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

    const waiterResult = await waitUntilTableExists(
      { client: dynamoDBClient, maxWaitTime: 120 },
      { TableName: DynamoDbReportRepository.tableName }
    );

    if (waiterResult.state !== "SUCCESS") {
      throw new Error(
        `Failed to create DynamoDB table. State: ${waiterResult.state}, reason: ${waiterResult.reason}`
      );
    }

    return new DynamoDbReportRepository(ddbDocClient);
  }

  async list({ limit, exclusiveStartKey }: PaginationQuery) {
    const scanCommand = new ScanCommand({
      TableName: DynamoDbReportRepository.tableName,
      ExclusiveStartKey: exclusiveStartKey,
      Limit: limit,
    });
    const { Items, LastEvaluatedKey } = await this.ddbDocClient.send(
      scanCommand
    );

    return {
      list: (Items as Report[]) || [],
      lastEvaluatedKey: LastEvaluatedKey,
    };
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
