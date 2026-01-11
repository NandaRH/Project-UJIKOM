import { Router } from "express";
import { getOverviewReport } from "../controllers/adminReportController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = Router();

router.get("/overview", verifyToken, isAdmin, getOverviewReport);

export default router;

