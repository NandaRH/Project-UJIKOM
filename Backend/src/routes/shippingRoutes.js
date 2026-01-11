import express from "express";
import {
  calculateShipping,
  trackShipment,
} from "../controllers/shippingController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/calculate", verifyToken, calculateShipping);
router.get("/track/:orderId", verifyToken, trackShipment);

export default router;
