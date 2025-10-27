import Product from "../models/Product.js";
import cloudinary from "../utils/cloudinary.js";

const parseBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }
  return false;
};

const parseNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isNaN(num) ? fallback : num;
};

const normalizeTags = (tags) =>
  typeof tags === "string"
    ? tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : Array.isArray(tags)
    ? tags.map((t) => String(t).trim()).filter(Boolean)
    : [];

const allowedBeanTypes = ["arabika", "robusta"];
const allowedProcesses = ["natural", "fullwash", "honey", "eksperimental"];

const normalizeBeanType = (value) => {
  if (!value) return null;
  const normalized = String(value).toLowerCase();
  return allowedBeanTypes.includes(normalized) ? normalized : null;
};

const normalizeProcess = (value) => {
  if (!value) return null;
  const normalized = String(value).toLowerCase();
  return allowedProcesses.includes(normalized) ? normalized : null;
};

export const adminListProducts = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limitRaw = parseInt(req.query.limit, 10);
    const limit = Number.isNaN(limitRaw)
      ? 10
      : Math.min(Math.max(limitRaw, 1), 50);
    const search = (req.query.q || "").trim();

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
        { beanType: { $regex: search, $options: "i" } },
      ];
    }

    const [rawItems, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    const items = rawItems.map((item) => ({
      ...item,
      imageUrl: item.imageUrl || item.imageURL || null,
    }));

    const totalPages = total === 0 ? 1 : Math.ceil(total / limit);

    return res.json({
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
      },
    });
  } catch (err) {
    console.error("Error adminListProducts:", err);
    return res.status(500).json({
      message: "Gagal mengambil daftar produk",
      error: err.message,
    });
  }
};

export const createProduct = async (req, res) => {
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

    if (!name) {
      return res.status(400).json({ message: "Nama produk wajib diisi." });
    }

    const normalizedBeanType = normalizeBeanType(beanType);
    const normalizedProcess = normalizeProcess(process);

    if (!normalizedBeanType || !normalizedProcess) {
      return res.status(400).json({
        message:
          "Jenis biji atau proses tidak valid. Gunakan arabika/robusta dan natural/fullwash/honey/eksperimental.",
      });
    }

    const numericPrice = parseNumber(price, NaN);
    if (Number.isNaN(numericPrice)) {
      return res.status(400).json({ message: "Harga harus berupa angka." });
    }

    const imageUrl = req.file?.path || null;
    const imagePublicId = req.file?.filename || null;

    const productBaru = await Product.create({
      name,
      description,
      beanType: normalizedBeanType,
      process: normalizedProcess,
      price: numericPrice,
      stock: parseNumber(stock, 0),
      tags: normalizeTags(tags),
      active: parseBoolean(active),
      imageUrl,
      imagePublicId,
    });

    // Tidak menyimpan Buffer/base64 image ke MongoDB; hanya URL Cloudinary agar storage Atlas hemat.
    return res.status(201).json({
      message: "Produk berhasil dibuat",
      data: productBaru,
    });
  } catch (err) {
    console.error("Error createProduct:", err);
    return res.status(500).json({
      message: "Gagal membuat produk",
      error: err.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
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

    const hasNewImage = Boolean(req.file);
    if (hasNewImage && product.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(product.imagePublicId);
      } catch (destroyErr) {
        console.warn("Gagal menghapus gambar lama di Cloudinary:", destroyErr);
      }
    }

    product.name = name ?? product.name;
    product.description = description ?? product.description;

    const finalBeanType = normalizeBeanType(
      beanType !== undefined ? beanType : product.beanType
    );
    if (!finalBeanType) {
      return res.status(400).json({
        message: "Jenis biji tidak valid. Gunakan arabika atau robusta.",
      });
    }
    product.beanType = finalBeanType;

    const finalProcess = normalizeProcess(
      process !== undefined ? process : product.process
    );
    if (!finalProcess) {
      return res.status(400).json({
        message:
          "Proses tidak valid. Gunakan natural/fullwash/honey/eksperimental.",
      });
    }
    product.process = finalProcess;
    if (price !== undefined) {
      product.price = parseNumber(price, product.price);
    }
    if (stock !== undefined) {
      product.stock = parseNumber(stock, product.stock);
    }
    if (tags !== undefined) {
      product.tags = normalizeTags(tags);
    }
    if (active !== undefined) {
      product.active = parseBoolean(active);
    }

    if (hasNewImage) {
      product.imageUrl = req.file.path;
      product.imagePublicId = req.file.filename;
    } else if (imageURL) {
      product.imageUrl = imageURL;
    }

    await product.save();

    return res.json({
      message: "Produk diperbarui",
      data: product,
    });
  } catch (err) {
    console.error("Error updateProduct:", err);
    return res.status(500).json({
      message: "Gagal memperbarui produk",
      error: err.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    if (product.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(product.imagePublicId);
      } catch (destroyErr) {
        console.warn("Gagal menghapus gambar Cloudinary:", destroyErr);
      }
    }

    await product.deleteOne();

    return res.json({ message: "Produk dihapus" });
  } catch (err) {
    console.error("Error deleteProduct:", err);
    return res.status(500).json({
      message: "Gagal menghapus produk",
      error: err.message,
    });
  }
};

export const listPublicProducts = async (_req, res) => {
  try {
    const products = await Product.find({ active: true })
      .sort({ createdAt: -1 })
      .select("name price beanType process stock imageUrl imageURL description tags createdAt")
      .lean();

    // Jangan limit: frontend butuh SEMUA produk aktif.
    return res.json(
      products.map((item) => ({
        ...item,
        imageUrl: item.imageUrl || item.imageURL || null,
      }))
    );
  } catch (err) {
    console.error("Error listPublicProducts:", err);
    return res.status(500).json({
      message: "Gagal mengambil produk",
      error: err.message,
    });
  }
};
