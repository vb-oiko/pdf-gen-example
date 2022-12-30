import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { initTRPC } from "@trpc/server";
import * as dotenv from "dotenv";
import AppSettingsController from "./controller/AppSettingsController";
import ReportController from "./controller/ReportController";
import { DynamoDbReportRepository } from "./repository/DynamoDbReportRepository";
import { ReportGenerationService } from "./service/ReportGenerationService";
import { ReportManagementService } from "./service/ReportManagementService";
import { createServer } from "./utils/createServer";
import { getAwsConfiguration } from "./utils/getAwsConfiguration";

dotenv.config();

const { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = process.env;
const awsConfiguration = getAwsConfiguration(
  AWS_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY
);

const dynamoDBClient = new DynamoDBClient(awsConfiguration);
const ddbDocClient = DynamoDBDocumentClient.from(dynamoDBClient);

const reportRepository = await DynamoDbReportRepository.init(
  dynamoDBClient,
  ddbDocClient
);
const reportManagementService = new ReportManagementService(reportRepository);
const reportGenerationService = new ReportGenerationService(reportRepository);

const trpcInstance = initTRPC.create();
const reportController = new ReportController(
  trpcInstance,
  reportManagementService,
  reportGenerationService
);
const appSettingsController = new AppSettingsController(trpcInstance);

const router = trpcInstance.router;
const appRouter = router({
  listReports: reportController.listReports(),
  createReport: reportController.createReport(),
  getAppSettings: appSettingsController.getAppSettings(),
  generateReport: reportController.generateReport(),
});

const server = createServer(appRouter);

server.listen(2022);

export type AppRouter = typeof appRouter;
export type TRPCInstance = typeof trpcInstance;
