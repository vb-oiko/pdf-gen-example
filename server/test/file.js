require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
  AWS_BUCkET_NAME,
} = process.env;

const TableNames = {
  jobs: "pdf-gen-example.jobs",
};

const ticker = "1INCHBTC-1s-2022-12-22";
const WORK_FOLDER = "./temp";

const downloadUrl = `https://${AWS_BUCkET_NAME}.s3.${AWS_REGION}.amazonaws.com/${ticker}.pdf`;

const pathname = path.resolve(WORK_FOLDER, `${ticker}.pdf`);

(async () => {
  const client = new S3Client({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
  });

  const blob = fs.readFileSync(pathname);

  const putObjectCommand = new PutObjectCommand({
    Bucket: AWS_BUCkET_NAME,
    Key: `${ticker}.pdf`,
    Body: blob,
  });
  try {
    const results = await client.send(putObjectCommand);
    const downloadUrl = `https://${AWS_BUCkET_NAME}.s3.${AWS_REGION}.amazonaws.com/${ticker}.pdf`;

    console.log(results, downloadUrl);
  } catch (err) {
    console.error(err);
  }
})();
