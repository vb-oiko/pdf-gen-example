import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { S3configuration } from "../utils/getAwsConfiguration";

export class S3FileStorageService {
  constructor(
    private readonly s3client: S3Client,
    private readonly S3configuration: S3configuration
  ) {}

  public async uploadFile(blob: Buffer, filename: string): Promise<void> {
    const { bucketName } = this.S3configuration;

    const putObjectCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: `${filename}.pdf`,
      Body: blob,
    });

    await this.s3client.send(putObjectCommand);
  }

  public getDownloadUrl(filename: string) {
    const { bucketName, region } = this.S3configuration;
    return `https://${bucketName}.s3.${region}.amazonaws.com/${filename}.pdf`;
  }
}
