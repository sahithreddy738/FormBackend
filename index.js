import express from "express";
import AWS from "aws-sdk";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config(); // Load AWS credentials from .env file

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors(
    {
        origin:"http://localhost:5173"
    }
));
app.use(express.json()); // Body parser for JSON



const dynamoDB = new AWS.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION, // Change to your region
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
const TABLE_NAME = "UserData"; // Change this to your table name

// POST Route to Insert Data into DynamoDB
app.post("/submit", async (req, res) => {
  try {
    console.log(req.body);
    const { firstName,lastName, email, password } = req.body.newUser;

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

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
