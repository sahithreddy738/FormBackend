import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import initializeDynamoDatabase from "./models/index.js";
import createBucket from "./config/s3-bucket.js";

const app = express();

dotenv.config();

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use(express.json());

app.use("/", userRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  initializeDynamoDatabase();
  createBucket();
});
