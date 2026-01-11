import { validationResult } from "express-validator";
import Service from "../models/Service.js";
import {
  buildPaginationMeta,
  getPaginationParams,
} from "../utils/pagination.js";

const normalizeRoastProfiles = (input) => {
  const allowed = ["lite", "medium", "dark"];
  if (Array.isArray(input)) {
    return Array.from(
      new Set(
        input
          .map((profile) => String(profile).trim().toLowerCase())
          .filter((profile) => allowed.includes(profile))
      )
    );
  }

  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) return allowed;
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        return normalizeRoastProfiles(JSON.parse(trimmed));
      } catch {
        return allowed;
      }
    }
    return normalizeRoastProfiles(trimmed.split(","));
  }

  return allowed;
};

const toNumber = (value, fallback) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const toBoolean = (value, fallback) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes"].includes(normalized)) return true;
    if (["false", "0", "no"].includes(normalized)) return false;
  }
  if (typeof value === "number") return value > 0;
  return fallback;
};

export const createService = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      name,
      description,
      beanType,
      price,
      minWeightKg,
      maxWeightKg,
      roastProfiles,
      imageURL,
      active,
    } = req.body;

    const service = new Service({
      name,
      description,
      beanType: beanType?.toLowerCase(),
      price: toNumber(price, 0),
      minWeightKg: toNumber(minWeightKg, 1),
      maxWeightKg: toNumber(maxWeightKg, 50),
      roastProfiles: normalizeRoastProfiles(roastProfiles),
      imageURL,
      active: toBoolean(active, true),
    });

    await service.save();
    res.status(201).json({ message: "Jasa berhasil dibuat", service });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateService = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Jasa tidak ditemukan" });
    }

    const {
      name,
      description,
      beanType,
      price,
      minWeightKg,
      maxWeightKg,
      roastProfiles,
      imageURL,
      active,
    } = req.body;

    if (typeof name !== "undefined") service.name = name;
    if (typeof description !== "undefined") service.description = description;
    if (typeof beanType !== "undefined")
      service.beanType = beanType.toLowerCase();
    if (typeof price !== "undefined")
      service.price = toNumber(price, service.price);
    if (typeof minWeightKg !== "undefined")
      service.minWeightKg = toNumber(minWeightKg, service.minWeightKg);
    if (typeof maxWeightKg !== "undefined")
      service.maxWeightKg = toNumber(maxWeightKg, service.maxWeightKg);
    if (typeof roastProfiles !== "undefined")
      service.roastProfiles = normalizeRoastProfiles(roastProfiles);
    if (typeof imageURL !== "undefined") service.imageURL = imageURL;
    if (typeof active !== "undefined")
      service.active = toBoolean(active, service.active);

    await service.save();
    res.json({ message: "Jasa berhasil diperbarui", service });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Jasa tidak ditemukan" });
    }

    await service.deleteOne();
    res.json({ message: "Jasa berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listServices = async (req, res) => {
  try {
    const { q, active } = req.query;
    const { page, limit, skip } = getPaginationParams(req.query);

    const filter = {};
    if (q) {
      filter.name = { $regex: q, $options: "i" };
    }
    if (typeof active !== "undefined") {
      filter.active = toBoolean(active, true);
    }

    const [services, total] = await Promise.all([
      Service.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Service.countDocuments(filter),
    ]);

    res.json({ data: services, meta: buildPaginationMeta(total, page, limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

