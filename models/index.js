import { CreateTableCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { products } from "./products.js";

const client = new DynamoDBClient({ region: "ap-south-1" });
export const dynamoDb = DynamoDBDocumentClient.from(client);

async function checkIfTableExists(table_name) {
  try {
    await dynamoDb.describeTable({ TableName: table_name }).promise();
    return true;
  } catch (err) {
    if (err.code === "ResourceNotFoundException") {
      return false;
    }
  }
}

const tableNames = [products];

async function createTable(params) {
  try {
    const command = new CreateTableCommand(params);
    const response = await dynamoDb.send(command);
    console.log("success");
  } catch (err) {
    console.log(err, "erroor");
  }
}

async function initializeDatabase(table_name, params) {
  const exists = await checkIfTableExists(table_name);
  console.log("table intializing");

  if (!exists) {
    try {
      await createTable(params);
      console.log("table created works");
    } catch (err) {
      console.log(err);
    }
  }
}

async function initializeDynamoDatabase() {
  for (let i = 0; i < tableNames.length; i++) {
    initializeDatabase(tableNames[i].TableName, tableNames[i]);
  }
  console.log(" initializing db works");
}


export default  initializeDynamoDatabase;

