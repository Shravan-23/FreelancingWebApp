import express from "express";
import {
  createBid,
  getBids,
  updateBidStatus,
} from "../controllers/bid.controller.js";
import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();

router.post("/", verifyToken, createBid);
router.get("/:gigId", getBids);
router.put("/:id", verifyToken, updateBidStatus);

export default router; 