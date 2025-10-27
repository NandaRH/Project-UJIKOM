import { Router } from "express";
import { body } from "express-validator";
import {
  createService,
  deleteService,
  listServices,
  updateService,
} from "../controllers/adminServiceController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = Router();

const roastProfilesValidator = (value) => {
  if (Array.isArray(value)) {
    return value.every((profile) =>
      ["lite", "medium", "dark"].includes(String(profile).toLowerCase())
    );
  }

  if (typeof value === "string") {
    if (!value.trim()) return true;
    if (value.trim().startsWith("[") && value.trim().endsWith("]")) {
      try {
        return roastProfilesValidator(JSON.parse(value));
      } catch {
        return false;
      }
    }
    return value
      .split(",")
      .every((profile) =>
        ["lite", "medium", "dark"].includes(profile.trim().toLowerCase())
      );
  }

  return false;
};

const serviceValidators = [
  body("name").optional({ values: "undefined" }).isString().trim().notEmpty(),
  body("description").optional({ values: "undefined" }).isString(),
  body("beanType")
    .optional({ values: "undefined" })
    .isIn(["arabika", "robusta"])
    .withMessage("Bean type tidak valid"),
  body("price")
    .optional({ values: "undefined" })
    .isFloat({ min: 0 })
    .withMessage("Harga minimal 0"),
  body("minWeightKg")
    .optional({ values: "undefined" })
    .isFloat({ min: 0 })
    .withMessage("Berat minimal tidak valid"),
  body("maxWeightKg")
    .optional({ values: "undefined" })
    .isFloat({ min: 0 })
    .withMessage("Berat maksimal tidak valid"),
  body("roastProfiles")
    .optional({ values: "undefined" })
    .custom(roastProfilesValidator)
    .withMessage("Profil roasting tidak valid"),
  body("imageURL").optional({ values: "undefined" }).isString(),
  body("active").optional({ values: "undefined" }).isBoolean(),
];

router.get("/", verifyToken, isAdmin, listServices);

router.post(
  "/",
  verifyToken,
  isAdmin,
  [
    body("name").exists({ checkFalsy: true }).withMessage("Nama jasa wajib diisi"),
    body("beanType")
      .exists({ checkFalsy: true })
      .isIn(["arabika", "robusta"])
      .withMessage("Bean type tidak valid"),
    body("price")
      .exists({ checkFalsy: true })
      .isFloat({ min: 0 })
      .withMessage("Harga minimal 0"),
    body("roastProfiles")
      .optional({ values: "undefined" })
      .custom(roastProfilesValidator)
      .withMessage("Profil roasting tidak valid"),
  ],
  createService
);

router.put("/:id", verifyToken, isAdmin, serviceValidators, updateService);

router.delete("/:id", verifyToken, isAdmin, deleteService);

export default router;

