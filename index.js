import express from "express";
import { DynamoDBClient, CreateTableCommand, PutItemCommand, ScanCommand, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use(express.json());

// AWS DynamoDB Client
const dynamoDB = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const TABLE_NAME = "UserDetails";

// ✅ CREATE TABLE (AWS SDK v3)
const createTable = async () => {
  const params = {
    TableName: TABLE_NAME,
    KeySchema: [{ AttributeName: "email", KeyType: "HASH" }], // Partition Key
    AttributeDefinitions: [{ AttributeName: "email", AttributeType: "S" }], // Only define key attributes
    BillingMode: "PAY_PER_REQUEST",
  };

  try {
    const command = new CreateTableCommand(params);
    const data = await dynamoDB.send(command);
    console.log("✅ Table created successfully:", data);
  } catch (error) {
    if (error.name === "ResourceInUseException") {
      console.log("⚠️ Table already exists. Skipping creation.");
    } else {
      console.error("❌ Error creating table:", error);
    }
  }
};

// ✅ POST (Insert Data)
app.post("/submit", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body.newUser;

    const params = {
      TableName: TABLE_NAME,
      Item: {
        email: { S: email }, // String type
        firstName: { S: firstName },
        lastName: { S: lastName },
        password: { S: password },
      },
    };

    const command = new PutItemCommand(params);
    await dynamoDB.send(command);
    res.status(201).json({ message: "✅ Data saved successfully!" });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Could not save data" });
  }
});

// ✅ GET ALL USERS
app.get("/users", async (req, res) => {
  const params = {
    TableName: TABLE_NAME,
  };

  try {
    const command = new ScanCommand(params);
    const data = await dynamoDB.send(command);
    const users = data.Items.map((item) => ({
      email: item.email.S,
      firstName: item.firstName.S,
      lastName: item.lastName.S,
      password: item.password.S,
    }));
    res.json({ users });
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ error: "Error fetching users" });
  }
});

// ✅ DELETE USER
app.delete("/user/:email", async (req, res) => {
  const { email } = req.params;

  const params = {
    TableName: TABLE_NAME,
    Key: { email: { S: email } },
  };

  try {
    const command = new DeleteItemCommand(params);
    await dynamoDB.send(command);
    res.json({ message: `✅ User with email ${email} deleted successfully.` });
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    res.status(500).json({ error: "Error deleting user" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  createTable();
});
