import express from "express";
import { getUserByEmail, getUsers, updateUser, userAdd, userDelete } from "../controllers/userController.js";
import multer from "multer";
const router = express.Router();
const storage = multer.memoryStorage();
export const upload = multer({ storage });

router.delete("/user/:email", userDelete);
router.post("/submit", upload.single("file"),userAdd);
router.get("/users", getUsers);
router.get("/user/:email",getUserByEmail);
router.put("/edit/:email",upload.single("file"),updateUser);
export default router;
