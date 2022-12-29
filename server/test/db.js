require("dotenv").config();

const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION } = process.env;

const TableNames = {
  jobs: "pdf-gen-example.jobs",
};

const {
  DynamoDBClient,
  ListTablesCommand,
  PutItemCommand,
  ScanCommand,
} = require("@aws-sdk/client-dynamodb");

(async () => {
  const client = new DynamoDBClient({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
  });

  //   const listTablesCommand = new ListTablesCommand({});
  //   try {
  //     const results = await client.send(listTablesCommand);
  //     console.log(results.TableNames.join("\n"));
  //   } catch (err) {
  //     console.error(err);

  const putItem = new PutItemCommand({
    Item: { id: { S: "1" }, created: { N: Date.now().toString() } },
    TableName: TableNames.jobs,
  });
  try {
    const results = await client.send(putItem);
    console.log(results);
  } catch (err) {
    console.error(err);
  }

  const scanCommand = new ScanCommand({
    TableName: TableNames.jobs,
  });
  try {
    const results = await client.send(scanCommand);
    console.log(results.Items);
  } catch (err) {
    console.error(err);
  }
})();
