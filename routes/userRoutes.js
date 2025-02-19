import express from "express";
import { getUsers, userAdd, userDelete } from "../controllers/userController.js";
const router = express.Router();

router.delete("user/:email", userDelete);
router.post("/submit", userAdd);
router.get("/users", getUsers);
export default router;
