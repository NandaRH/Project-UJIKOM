import { Router } from "express";
import { body } from "express-validator";
import { getSettings, updateSettings } from "../controllers/adminSettingsController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = Router();

const validators = [
  body("storeProfile").optional().isObject(),
  body("storeProfile.name").optional({ values: "undefined" }).isString(),
  body("storeProfile.address").optional({ values: "undefined" }).isString(),
  body("storeProfile.phone").optional({ values: "undefined" }).isString(),
  body("storeProfile.email").optional({ values: "undefined" }).isString(),
  body("payments").optional().isObject(),
  body("payments.bank")
    .optional({ values: "undefined" })
    .isArray()
    .withMessage("Bank harus berupa array"),
  body("payments.bank.*.bankName").optional({ values: "undefined" }).isString(),
  body("payments.bank.*.accountName")
    .optional({ values: "undefined" })
    .isString(),
  body("payments.bank.*.accountNumber")
    .optional({ values: "undefined" })
    .isString(),
  body("payments.qris").optional({ values: "undefined" }).isObject(),
  body("payments.qris.label").optional({ values: "undefined" }).isString(),
  body("payments.qris.instructions")
    .optional({ values: "undefined" })
    .isString(),
  body("shipping").optional().isObject(),
  body("shipping.originAddress")
    .optional({ values: "undefined" })
    .isString(),
  body("shipping.originCoords")
    .optional({ values: "undefined" })
    .isObject(),
  body("shipping.originCoords.lat")
    .optional({ values: "undefined" })
    .isFloat({ min: -90, max: 90 }),
  body("shipping.originCoords.lng")
    .optional({ values: "undefined" })
    .isFloat({ min: -180, max: 180 }),
  body("shipping.useJNECargo")
    .optional({ values: "undefined" })
    .isBoolean(),
  body("shipping.weightRules")
    .optional({ values: "undefined" })
    .isObject(),
  body("shipping.weightRules.cargoMinKg")
    .optional({ values: "undefined" })
    .isFloat({ min: 0 }),
  body("shipping.weightRules.cargoDefault")
    .optional({ values: "undefined" })
    .isFloat({ min: 0 }),
];

router.get("/", verifyToken, isAdmin, getSettings);
router.put("/", verifyToken, isAdmin, validators, updateSettings);

export default router;

