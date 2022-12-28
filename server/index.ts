import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { initTRPC } from "@trpc/server";
import * as dotenv from "dotenv";
import AppSettingsController from "./controller/AppSettingsController";
import ReportController from "./controller/ReportController";
import { DynamoDbReportRepository } from "./repository/DynamoDbReportRepository";
import { ReportService } from "./service/ReportService";
import { createServer } from "./utils/createServer";
import { getAwsConfiguration } from "./utils/getAwsConfiguration";

dotenv.config();

const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION } = process.env;
const awsConfiguration = getAwsConfiguration(
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION
);

const dynamoDBClient = new DynamoDBClient(awsConfiguration);

const reportRepository = new DynamoDbReportRepository(dynamoDBClient);
const reportService = new ReportService(reportRepository);

const trpcInstance = initTRPC.create();
const reportController = new ReportController(trpcInstance, reportService);
const appSettingsController = new AppSettingsController(trpcInstance);

const router = trpcInstance.router;
const appRouter = router({
  listReports: reportController.listReports(),
  createReport: reportController.createReport(),
  getAppSettings: appSettingsController.getAppSettings(),
});

const server = createServer(appRouter);
server.listen(2022);

export type AppRouter = typeof appRouter;
export type TRPCInstance = typeof trpcInstance;
