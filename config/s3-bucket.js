import {
  S3Client,
  CreateBucketCommand,
  ListBucketsCommand,
} from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

export const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const bucketName = process.env.S3_BUCKET_NAME;

const createBucket = async () => {
  try {
    const { Buckets } = await s3.send(new ListBucketsCommand({}));

    if (Buckets.some((bucket) => bucket.Name === bucketName)) {
      console.log(`Bucket "${bucketName}" already exists. Skipping creation.`);
      return;
    }
    const command = new CreateBucketCommand({ Bucket: bucketName });
    await s3.send(command);
    console.log(`Bucket "${bucketName}" created successfully.`);
  } catch (error) {
    console.error("Error creating bucket:", error);
  }
};

export default createBucket;
