import express from "express";
import { body } from "express-validator";
import { register, loginUser, loginAdmin, login } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email tidak valid"),
    body("password").isLength({ min: 6 }).withMessage("Password minimal 6 karakter"),
    body("role")
      .optional({ values: "undefined" })
      .isIn(["admin", "user"])
      .withMessage("Role tidak valid"),
  ],
  login
);
router.post("/login-user", loginUser);
router.post("/login-admin", loginAdmin);

export default router;
