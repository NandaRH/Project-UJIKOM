import express from "express";
import {
  addService,
  getServices,
  calculateRoastingCost
} from "../controllers/serviceController.js";

const router = express.Router();

router.post("/", addService);
router.get("/", getServices);
router.post("/calculate", calculateRoastingCost);

export default router;
