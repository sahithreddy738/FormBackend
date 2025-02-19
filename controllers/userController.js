import { DeleteItemCommand, PutItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { products } from "../models/products.js";
import { dynamoDb } from "../models/index.js";

export const userAdd = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body.newUser;

    const params = {
      TableName: products.TableName,
      Item: {
        email: { S: email }, // String type
        firstName: { S: firstName },
        lastName: { S: lastName },
        password: { S: password },
      },
    };

    const command = new PutItemCommand(params);
    await dynamoDb.send(command);
    res.status(201).json({ message: "✅ Data saved successfully!" });
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
