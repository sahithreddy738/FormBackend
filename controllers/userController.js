import {
  DeleteItemCommand,
  GetItemCommand,
  ScanCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { products } from "../models/products.js";
import { dynamoDb } from "../models/index.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/s3-bucket.js";

export const userAdd = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: "File is required!" });
    }
    const fileName = `${Date.now()}-${req.file.originalname}`;
    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };
    await s3.send(new PutObjectCommand(uploadParams));
    const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${fileName}`;

    const getParams = {
      TableName: products.TableName,
      Key: { email: { S: email } },
    };

    const existingUser = await dynamoDb.send(new GetItemCommand(getParams));

    let fileUrls = [];

    if (existingUser.Item && existingUser.Item.fileUrls) {
      // **2. Retrieve existing file URLs and append the new one**
      fileUrls = existingUser.Item.fileUrls.L.map((item) => item.S);
    }

    fileUrls.push(fileUrl); // Add the new file URL to the array

    // **3. Update DynamoDB with the new list of URLs**
    const updateParams = {
      TableName: products.TableName,
      Key: { email: { S: email } },
      UpdateExpression:
        "SET firstName = :fn, lastName = :ln, password = :pw, fileUrls = :urls",
      ExpressionAttributeValues: {
        ":fn": { S: firstName },
        ":ln": { S: lastName },
        ":pw": { S: password },
        ":urls": { L: fileUrls.map((url) => ({ S: url })) }, // Store URLs as a list
      },
    };

    await dynamoDb.send(new UpdateItemCommand(updateParams));

    res.status(201).json({ message: "✅ Data saved successfully!", fileUrls });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Could not save data" });
  }
};

export const getUsers = async (req, res) => {
  const params = {
    TableName: products.TableName,
  };

  try {
    const command = new ScanCommand(params);
    const data = await dynamoDb.send(command);
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
};

export const userDelete = async (req, res) => {
  const { email } = req.params;

  const params = {
    TableName: products.TableName,
    Key: { email: { S: email } },
  };

  try {
    const command = new DeleteItemCommand(params);
    await dynamoDb.send(command);
    res.json({ message: `✅ User with email ${email} deleted successfully.` });
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    res.status(500).json({ error: "Error deleting user" });
  }
};

export const getUserByEmail = async (req, res) => {
  const { email } = req.params;

  const params = {
    TableName: products.TableName,
    Key: { email: { S: email } },
  };

  try {
    const command = new GetItemCommand(params);
    const data = await dynamoDb.send(command);

    if (!data.Item) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = {
      email: data.Item.email.S,
      firstName: data.Item.firstName.S,
      lastName: data.Item.lastName.S,
      password: data.Item.password.S,
      fileUrls: data.Item.fileUrls ? data.Item.fileUrls.L.map((item) => item.S) : [],
    };

    res.json({ user });
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    res.status(500).json({ error: "Error fetching user" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { email } = req.params;
    const { firstName, lastName, password } = req.body;

    let fileUrl = null;

    // If a new file is uploaded, store it in S3
    if (req.file) {
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const uploadParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileName,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      };

      await s3.send(new PutObjectCommand(uploadParams));
      fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${fileName}`;
    }

    // Fetch the existing user to get current fileUrls list
    const getUserParams = {
      TableName: products.TableName,
      Key: { email: { S: email } },
      ProjectionExpression: "fileUrls",
    };

    const userData = await dynamoDb.send(new GetItemCommand(getUserParams));
    const existingFileUrls = userData.Item?.fileUrls?.L?.map(item => item.S) || [];

    // If a new file is uploaded, append to the list, otherwise keep the list unchanged
    const updatedFileUrls = fileUrl ? [...existingFileUrls, fileUrl] : existingFileUrls;

    // Update the user details in DynamoDB
    const updateParams = {
      TableName: products.TableName,
      Key: { email: { S: email } },
      UpdateExpression: "SET firstName = :fn, lastName = :ln, password = :pw, fileUrls = :urls",
      ExpressionAttributeValues: {
        ":fn": { S: firstName },
        ":ln": { S: lastName },
        ":pw": { S: password },
        ":urls": { L: updatedFileUrls.map(url => ({ S: url })) }, // Store the updated list
      },
    };

    await dynamoDb.send(new UpdateItemCommand(updateParams));

    res.status(200).json({ message: "✅ User updated successfully", fileUrls: updatedFileUrls });
  } catch (error) {
    console.error("❌ Error updating user:", error);
    res.status(500).json({ error: "Could not update user" });
  }
};
