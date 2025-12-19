import express from "express";
import { verifyToken } from "../middleware/jwt.js";
import { getNotifications, markAsRead, getAllNotifications } from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", verifyToken, getNotifications);
router.get("/all", verifyToken, getAllNotifications);
router.put("/:id/read", verifyToken, markAsRead);

export default router; 