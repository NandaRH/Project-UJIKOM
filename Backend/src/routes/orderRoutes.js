import express from "express";
import { createOrder, getOrderHistory } from "../controllers/orderController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/create", verifyToken, createOrder);
router.get("/history", verifyToken, getOrderHistory);

export default router;
