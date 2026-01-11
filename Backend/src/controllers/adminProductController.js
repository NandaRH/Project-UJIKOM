import { validationResult } from "express-validator";
import Product from "../models/Product.js";
import {
  buildProductImageURL,
  removeFileIfExists,
} from "../utils/fileStorage.js";
import {
  buildPaginationMeta,
  getPaginationParams,
} from "../utils/pagination.js";

const parseTags = (rawTags) => {
  if (Array.isArray(rawTags)) {
    return rawTags.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean);
  }

  if (typeof rawTags === "string") {
    const trimmed = rawTags.trim();
    if (!trimmed) return [];

    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed)
          ? parsed.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean)
          : [];
      } catch {
        return trimmed
          .split(",")
          .map((tag) => tag.trim().toLowerCase())
          .filter(Boolean);
      }
    }

    return trimmed
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);
  }

  return [];
};

const toBoolean = (value, fallback = true) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes"].includes(normalized)) return true;
    if (["false", "0", "no"].includes(normalized)) return false;
  }
  if (typeof value === "number") return value > 0;
  return fallback;
};

const toNumber = (value, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

export const createProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      name,
      description,
      beanType,
      process,
      price,
      stock,
      tags,
      active,
    } = req.body;

    const product = new Product({
      name,
      description,
      beanType: beanType?.toLowerCase(),
      process: process?.toLowerCase(),
      price: toNumber(price),
      stock: toNumber(stock, 0),
      tags: parseTags(tags),
      active: toBoolean(active, true),
    });

    if (req.file) {
      product.imageURL = buildProductImageURL(req.file.filename);
    } else if (req.body.imageURL) {
      product.imageURL = req.body.imageURL;
    }

    await product.save();
    res.status(201).json({
      message: "Produk berhasil dibuat",
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file) {
      removeFileIfExists(buildProductImageURL(req.file.filename));
    }
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      if (req.file) {
        removeFileIfExists(buildProductImageURL(req.file.filename));
      }
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    const {
      name,
      description,
      beanType,
      process,
      price,
      stock,
      tags,
      active,
      imageURL,
    } = req.body;

    if (typeof name !== "undefined") product.name = name;
    if (typeof description !== "undefined") product.description = description;
    if (typeof beanType !== "undefined")
      product.beanType = beanType.toLowerCase();
    if (typeof process !== "undefined")
      product.process = process.toLowerCase();
    if (typeof price !== "undefined")
      product.price = toNumber(price, product.price);
    if (typeof stock !== "undefined")
      product.stock = toNumber(stock, product.stock);
    if (typeof active !== "undefined")
      product.active = toBoolean(active, product.active);
    if (typeof tags !== "undefined") product.tags = parseTags(tags);

    if (req.file) {
      removeFileIfExists(product.imageURL);
      product.imageURL = buildProductImageURL(req.file.filename);
    } else if (typeof imageURL !== "undefined") {
      product.imageURL = imageURL;
    }

    await product.save();
    res.json({ message: "Produk berhasil diperbarui", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    if (product.imageURL) {
      removeFileIfExists(product.imageURL);
    }

    await product.deleteOne();
    res.json({ message: "Produk berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listProducts = async (req, res) => {
  try {
    const { q, active } = req.query;
    const { page, limit, skip } = getPaginationParams(req.query);

    const filter = {};
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
      ];
    }

    if (typeof active !== "undefined") {
      filter.active = toBoolean(active, true);
    }

    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);

    res.json({
      data: products,
      meta: buildPaginationMeta(total, page, limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

