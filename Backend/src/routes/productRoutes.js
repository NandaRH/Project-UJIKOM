import express from "express";
import { listPublicProducts } from "../controllers/productController.js";

const router = express.Router();

router.get("/", listPublicProducts);

export default router;
