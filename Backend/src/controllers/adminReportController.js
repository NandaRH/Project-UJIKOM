import Order from "../models/Order.js";
import Product from "../models/Product.js";

const revenueStatuses = ["paid", "processing", "shipped", "completed"];

export const getOverviewReport = async (_req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [todayOrders, todayRevenueAgg, monthRevenueAgg, lowStockCount, topProductsAgg] = await Promise.all([
      Order.countDocuments({
        createdAt: { $gte: startOfToday, $lte: endOfToday },
      }),
      Order.aggregate([
        {
          $match: {
            status: { $in: revenueStatuses },
            createdAt: { $gte: startOfToday, $lte: endOfToday },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$total" },
          },
        },
      ]),
      Order.aggregate([
        {
          $match: {
            status: { $in: revenueStatuses },
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$total" },
          },
        },
      ]),
      Product.countDocuments({ stock: { $lte: 10 }, active: true }),
      Order.aggregate([
        {
          $match: {
            status: { $in: revenueStatuses },
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        { $unwind: "$items" },
        { $match: { "items.type": "product" } },
        {
          $group: {
            _id: "$items.name",
            qty: { $sum: "$items.qty" },
          },
        },
        { $sort: { qty: -1 } },
        { $limit: 5 },
      ]),
    ]);

    res.json({
      todayOrders,
      todayRevenue: todayRevenueAgg[0]?.total || 0,
      monthRevenue: monthRevenueAgg[0]?.total || 0,
      lowStockCount,
      topProducts: topProductsAgg.map((item) => ({
        name: item._id,
        qty: item.qty,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

