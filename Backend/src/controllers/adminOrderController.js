import { validationResult } from "express-validator";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Settings from "../models/Settings.js";
import {
  buildPaginationMeta,
  getPaginationParams,
} from "../utils/pagination.js";
import { streamInvoice } from "../utils/invoice.js";

const allowedStatuses = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "completed",
  "cancelled",
];

const transitions = {
  pending: ["paid", "processing", "cancelled"],
  paid: ["processing", "shipped", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

const normalizeStatus = (status) =>
  typeof status === "string" ? status.trim().toLowerCase() : status;

const adjustStockForOrder = async (order) => {
  if (order.stockAdjusted) return;

  const productItems = order.items.filter(
    (item) => item.type === "product" && item.productId
  );

  if (!productItems.length) {
    order.stockAdjusted = true;
    return;
  }

  const grouped = productItems.reduce((acc, item) => {
    const key = String(item.productId);
    const qty = Number(item.qty) || 0;
    if (!acc.has(key)) acc.set(key, 0);
    acc.set(key, acc.get(key) + qty);
    return acc;
  }, new Map());

  const products = await Product.find({
    _id: { $in: Array.from(grouped.keys()) },
  });

  await Promise.all(
    products.map(async (product) => {
      const decrement = grouped.get(String(product._id)) || 0;
      if (!decrement) return;
      const newStock = Math.max((product.stock || 0) - decrement, 0);
      product.stock = newStock;
      await product.save();
    })
  );

  order.stockAdjusted = true;
};

export const listOrders = async (req, res) => {
  try {
    const { status, q, from, to } = req.query;
    const { page, limit, skip } = getPaginationParams(req.query);

    const filter = {};
    if (status) {
      const normalized = normalizeStatus(status);
      if (allowedStatuses.includes(normalized)) {
        filter.status = normalized;
      }
    }

    if (q) {
      filter.$or = [
        { orderId: { $regex: q, $options: "i" } },
        { customerName: { $regex: q, $options: "i" } },
        { address: { $regex: q, $options: "i" } },
      ];
    }

    if (from || to) {
      filter.createdAt = {};
      if (from) {
        const fromDate = new Date(from);
        if (!Number.isNaN(fromDate.getTime())) {
          filter.createdAt.$gte = fromDate;
        }
      }
      if (to) {
        const toDate = new Date(to);
        if (!Number.isNaN(toDate.getTime())) {
          filter.createdAt.$lte = toDate;
        }
      }
      if (!Object.keys(filter.createdAt).length) {
        delete filter.createdAt;
      }
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    res.json({
      data: orders,
      meta: buildPaginationMeta(total, page, limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderDetail = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.productId", "name stock price")
      .populate("userId", "full_name email");

    if (!order) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan" });
    }

    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const desiredStatus = normalizeStatus(req.body.status);
    if (!allowedStatuses.includes(desiredStatus)) {
      return res.status(400).json({ message: "Status tidak valid" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan" });
    }

    if (order.status === desiredStatus) {
      return res.json({ message: "Status tidak berubah", order });
    }

    if (["completed", "cancelled"].includes(order.status)) {
      return res
        .status(400)
        .json({ message: "Pesanan sudah selesai atau dibatalkan" });
    }

    if (!transitions[order.status]?.includes(desiredStatus)) {
      return res.status(400).json({
        message: `Perubahan status dari '${order.status}' ke '${desiredStatus}' tidak diizinkan`,
      });
    }

    order.status = desiredStatus;
    order.markUpdatedBy(req.user?.id);

    if (["paid", "processing"].includes(desiredStatus)) {
      await adjustStockForOrder(order);
    }

    await order.save();
    const freshOrder = await Order.findById(order._id);

    res.json({
      message: "Status pesanan berhasil diperbarui",
      order: freshOrder,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan" });
    }

    const settings = await Settings.findOne().lean();
    streamInvoice(res, order, settings || {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const exportOrdersCsv = async (req, res) => {
  try {
    const { status, from, to } = req.query;
    const filter = {};

    if (status && allowedStatuses.includes(normalizeStatus(status))) {
      filter.status = normalizeStatus(status);
    }

    if (from || to) {
      filter.createdAt = {};
      if (from) {
        const fromDate = new Date(from);
        if (!Number.isNaN(fromDate.getTime())) {
          filter.createdAt.$gte = fromDate;
        }
      }
      if (to) {
        const toDate = new Date(to);
        if (!Number.isNaN(toDate.getTime())) {
          filter.createdAt.$lte = toDate;
        }
      }
      if (!Object.keys(filter.createdAt).length) {
        delete filter.createdAt;
      }
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
    const header = [
      "orderId",
      "customerName",
      "status",
      "total",
      "shippingCost",
      "itemsCount",
      "createdAt",
    ];

    const lines = [header.join(",")];
    orders.forEach((order) => {
      lines.push(
        [
          order.orderId,
          `"${(order.customerName || "").replace(/"/g, '""')}"`,
          order.status,
          order.total,
          order.shipping?.totalCost ?? 0,
          order.items?.length ?? 0,
          order.createdAt?.toISOString(),
        ].join(",")
      );
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=orders-export.csv"
    );
    res.send(lines.join("\n"));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

