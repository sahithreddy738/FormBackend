import express from "express";
import AWS from "aws-sdk";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config(); // Load AWS credentials from .env file

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use(express.json()); // Body parser for JSON

const dynamoDB = new AWS.DynamoDB.DocumentClient({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
const TABLE_NAME = "UserData";

// POST Route to Insert Data into DynamoDB
app.post("/submit", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body.newUser;

    const params = {
      TableName: TABLE_NAME,
      Item: {
        email,
        firstName,
        lastName,
        password,
      },
    };

    await dynamoDB.put(params).promise();
    res.status(201).json({ message: "Data saved successfully!" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Could not save data" });
  }
});
app.get("/users", async (req, res) => {
  const params = {
    TableName: TABLE_NAME,
  };

  try {
    const data = await dynamoDB.scan(params).promise();
    res.json({ users: data });
  } catch (error) {
    res.status(500).json({ error: "Error fetching users", details: error });
  }
});
app.delete("/user/:email", async (req, res) => {
  const { email } = req.params;

  const params = {
    TableName: TABLE_NAME,
    Key: { email },
  };

  try {
    await dynamoDB.delete(params).promise();
    res.json({ message: `User with email ${email} deleted successfully.` });
  } catch (error) {
    res.status(500).json({ error: "Error deleting user", details: error });
  }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
