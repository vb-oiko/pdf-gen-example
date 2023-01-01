export const getAwsConfiguration = (
  region: string | undefined,
  accessKeyId: string | undefined,
  secretAccessKey: string | undefined,
  bucketName: string | undefined
) => {
  if (!region || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Failed to load AWS configuration parameters. Please check .env file."
    );
  }
  if (!bucketName) {
    throw new Error(
      "Failed to load AWS S3 bucket name. Please check .env file."
    );
  }

  const awsConfiguration = {
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  };

  const s3configuration = {
    bucketName,
    region,
  };

  return { awsConfiguration, s3configuration };
};

export type S3configuration = {
  bucketName: string;
  region: string;
};
