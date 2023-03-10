import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { initTRPC } from "@trpc/server";
import * as dotenv from "dotenv";
import AppSettingsController from "./controller/AppSettingsController";
import ReportController from "./controller/ReportController";
import { DynamoDbReportRepository } from "./repository/DynamoDbReportRepository";
import { ReportGenerationService } from "./service/ReportGenerationService";
import { ReportManagementService } from "./service/ReportManagementService";
import { S3FileStorageService } from "./service/S3FileStorageService";
import { createServer } from "./utils/createServer";
import { getAwsConfiguration } from "./utils/getAwsConfiguration";
import cron from "node-cron";
import { ReportGenerationCron } from "./cron/ReportGenerationCron";
import { LocalLockService } from "./service/LocalLockService";
import {
  REPORT_GENERATION_CRON_EXPRESSION,
  SERVER_PORT,
} from "./constant/constants";

dotenv.config();

const {
  AWS_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_BUCKET_NAME,
} = process.env;

const { awsConfiguration, s3configuration } = getAwsConfiguration(
  AWS_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_BUCKET_NAME
);

const s3client = new S3Client(awsConfiguration);

const dynamoDBClient = new DynamoDBClient(awsConfiguration);
const ddbDocClient = DynamoDBDocumentClient.from(dynamoDBClient);

const reportRepository = await DynamoDbReportRepository.init(
  dynamoDBClient,
  ddbDocClient
);

const reportManagementService = new ReportManagementService(reportRepository);
const reportGenerationService = new ReportGenerationService();
const fileStorageService = new S3FileStorageService(s3client, s3configuration);

const trpcInstance = initTRPC.create();
const reportController = new ReportController(
  trpcInstance,
  reportManagementService
);
const appSettingsController = new AppSettingsController(trpcInstance);

const router = trpcInstance.router;
const appRouter = router({
  listReports: reportController.listReports(),
  createReport: reportController.createReport(),
  getAppSettings: appSettingsController.getAppSettings(),
});

const server = createServer(appRouter);

server.listen(SERVER_PORT);

const lockService = new LocalLockService();
const reportGenerationCron = new ReportGenerationCron(
  lockService,
  reportRepository,
  reportGenerationService,
  fileStorageService
);

cron.schedule(REPORT_GENERATION_CRON_EXPRESSION, () => {
  reportGenerationCron.run();
});

export type AppRouter = typeof appRouter;
export type TRPCInstance = typeof trpcInstance;
