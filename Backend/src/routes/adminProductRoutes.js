import express from "express";
import uploadProductImage from "../middleware/uploadProductImage.js";
import {
  adminListProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/", adminListProducts);

router.post(
  "/",
  uploadProductImage.single("image"), // field file wajib bernama "image"
  createProduct
);

router.put(
  "/:id",
  uploadProductImage.single("image"),
  updateProduct
);

router.delete("/:id", deleteProduct);

export default router;
