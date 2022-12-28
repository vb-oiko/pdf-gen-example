import { DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";

export const getAwsConfiguration = (
  region: string | undefined,
  accessKeyId: string | undefined,
  secretAccessKey: string | undefined
): DynamoDBClientConfig => {
  if (!region || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Failed to load AWS configuration parameters. Please check .env file."
    );
  }

  return {
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  };
};
