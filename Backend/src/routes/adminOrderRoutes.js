import { Router } from "express";
import { body } from "express-validator";
import {
  exportOrdersCsv,
  getOrderDetail,
  getOrderInvoice,
  listOrders,
  updateOrderStatus,
} from "../controllers/adminOrderController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = Router();

router.get("/", verifyToken, isAdmin, listOrders);
router.get("/export.csv", verifyToken, isAdmin, exportOrdersCsv);
router.get("/:id", verifyToken, isAdmin, getOrderDetail);
router.patch(
  "/:id/status",
  verifyToken,
  isAdmin,
  [body("status").exists({ checkFalsy: true }).withMessage("Status wajib diisi")],
  updateOrderStatus
);
router.get("/:id/invoice", verifyToken, isAdmin, getOrderInvoice);

export default router;

