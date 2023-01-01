import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  DynamoDBClient,
  ListTablesCommand,
  CreateTableCommand,
  DeleteTableCommand,
} from "@aws-sdk/client-dynamodb";
import { LockRepository } from "../cron/ReportGenerationCron";

export class DynamoDbLockRepository implements LockRepository {
  public static readonly tableName = "pdf-gen-example.lock";

  constructor(
    private readonly dynamoDBClient: DynamoDBClient,
    private readonly ddbDocClient: DynamoDBDocumentClient
  ) {}

  public static async init(
    dynamoDBClient: DynamoDBClient,
    ddbDocClient: DynamoDBDocumentClient
  ) {
    await DynamoDbLockRepository.createTableIfNotExists(dynamoDBClient);

    return new DynamoDbLockRepository(dynamoDBClient, ddbDocClient);
  }

  private static async tableExists(
    dynamoDBClient: DynamoDBClient
  ): Promise<boolean> {
    const listTablesCommand = new ListTablesCommand({});
    const { TableNames } = await dynamoDBClient.send(listTablesCommand);
    return Boolean(TableNames?.includes(DynamoDbLockRepository.tableName));
  }

  private static async createTableIfNotExists(
    dynamoDBClient: DynamoDBClient
  ): Promise<void> {
    if (await DynamoDbLockRepository.tableExists(dynamoDBClient)) {
      return;
    }

    const createTableCommand = new CreateTableCommand({
      AttributeDefinitions: [
        { AttributeName: "timestamp", AttributeType: "N" },
      ],
      TableName: DynamoDbLockRepository.tableName,
      KeySchema: [{ KeyType: "HASH", AttributeName: "timestamp" }],
      BillingMode: "PAY_PER_REQUEST",
    });

    await dynamoDBClient.send(createTableCommand);
  }

  async createLock(): Promise<void> {
    await DynamoDbLockRepository.createTableIfNotExists(this.dynamoDBClient);

    const putItem = new PutCommand({
      Item: { timestamp: Date.now() },
      TableName: DynamoDbLockRepository.tableName,
    });

    await this.ddbDocClient.send(putItem);
  }

  async deleteLock(): Promise<void> {
    if (await DynamoDbLockRepository.tableExists(this.dynamoDBClient)) {
      return;
    }

    const deleteTableCommand = new DeleteTableCommand({
      TableName: DynamoDbLockRepository.tableName,
    });

    await this.dynamoDBClient.send(deleteTableCommand);
    await DynamoDbLockRepository.createTableIfNotExists(this.dynamoDBClient);
  }

  async getLock(): Promise<{ timestamp: number } | null> {
    await DynamoDbLockRepository.createTableIfNotExists(this.dynamoDBClient);

    const scanCommand = new ScanCommand({
      TableName: DynamoDbLockRepository.tableName,
      Limit: 1,
    });

    const { Items: items } = await this.ddbDocClient.send(scanCommand);
    return items ? (items[0] as { timestamp: number }) : null;
  }
}
