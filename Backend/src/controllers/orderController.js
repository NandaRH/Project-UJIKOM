import Order from "../models/Order.js";

export const createOrder = async (req, res) => {
  try {
    const userId = req.user?.id;
    let { orderId, customerName, address, items, shipping, status } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "User tidak terautentikasi" });
    }

    const normalizedOrderId =
      typeof orderId === "string" ? orderId.trim() : undefined;
    if (!normalizedOrderId) {
      return res.status(400).json({ message: "orderId wajib diisi" });
    }

    const existingOrder = await Order.findOne({ orderId: normalizedOrderId })
      .select("_id")
      .lean();
    if (existingOrder) {
      return res
        .status(409)
        .json({ message: "orderId sudah digunakan, gunakan nomor lain" });
    }

    // Izinkan items dikirim sebagai string JSON dari form-data
    if (typeof items === "string") {
      try {
        items = JSON.parse(items);
      } catch (err) {
        console.error("Error parsing items:", err.message);
        return res.status(400).json({ message: "Format items tidak valid" });
      }
    }

    if (!customerName || !address) {
      return res
        .status(400)
        .json({ message: "Nama pelanggan dan alamat wajib diisi" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Daftar items tidak valid" });
    }

    const sanitizedItems = [];
    for (const item of items) {
      const price = Number(item?.price);
      const qty = Number(item?.qty);

      if (!item?.name) {
        return res.status(400).json({ message: "Item harus memiliki nama" });
      }
      if (!Number.isFinite(price) || price < 0) {
        return res
          .status(400)
          .json({ message: `Harga item ${item.name} tidak valid` });
      }
      if (!Number.isFinite(qty) || qty <= 0) {
        return res
          .status(400)
          .json({ message: `Qty item ${item.name} tidak valid` });
      }

      sanitizedItems.push({
        productId: item.productId,
        serviceId: item.serviceId,
        name: item.name,
        price,
        qty: Math.ceil(qty),
        type: item.type === "service" ? "service" : "product",
      });
    }

    const itemsTotal = sanitizedItems.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );

    let sanitizedShipping;
    if (shipping && typeof shipping === "object") {
      const weightNumber = Number(shipping.weight);
      const totalCostNumber = Number(shipping.totalCost);

      if (
        shipping.totalCost !== undefined &&
        (!Number.isFinite(totalCostNumber) || totalCostNumber < 0)
      ) {
        return res.status(400).json({ message: "Ongkir tidak valid" });
      }

      sanitizedShipping = {
        totalDistance: shipping.totalDistance,
        totalCost: Number.isFinite(totalCostNumber) ? totalCostNumber : 0,
        service: shipping.service,
        weight:
          Number.isFinite(weightNumber) && weightNumber > 0
            ? weightNumber
            : undefined,
        mode: shipping.mode,
      };
    }

    const shippingCost = sanitizedShipping?.totalCost || 0;
    const computedTotal = itemsTotal + shippingCost;

    const newOrder = new Order({
      userId,
      orderId: normalizedOrderId,
      customerName,
      address,
      items: sanitizedItems,
      total: computedTotal,
      shipping: sanitizedShipping,
    });

    if (status) {
      const allowedStatuses = [
        "pending",
        "paid",
        "processing",
        "shipped",
        "completed",
        "cancelled",
      ];
      const normalizedStatus = String(status).toLowerCase();
      if (!allowedStatuses.includes(normalizedStatus)) {
        return res.status(400).json({ message: "Status pesanan tidak valid" });
      }
      newOrder.status = normalizedStatus;
    }

    newOrder.markUpdatedBy(userId);
    await newOrder.save();

    res.json({
      message: "Pesanan berhasil dibuat",
      order: newOrder,
    });
  } catch (err) {
    console.error("Error createOrder:", err);
    res.status(500).json({
      message: "Gagal membuat pesanan",
      error: err.message,
    });
  }
};

export const getOrderHistory = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User tidak terautentikasi" });
    }

    const { status } = req.query;
    const filter = { userId };

    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    console.error("Error getOrderHistory:", err);
    res.status(500).json({
      message: "Gagal mengambil riwayat pesanan",
      error: err.message,
    });
  }
};
