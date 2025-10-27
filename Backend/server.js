import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import adminProductRoutes from "./src/routes/adminProductRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import serviceRoutes from "./src/routes/serviceRoutes.js";
import shippingRoutes from "./src/routes/shippingRoutes.js";
import cartRoutes from "./src/routes/cartRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";
import adminServiceRoutes from "./src/routes/adminServiceRoutes.js";
import adminOrderRoutes from "./src/routes/adminOrderRoutes.js";
import adminSettingsRoutes from "./src/routes/adminSettingsRoutes.js";
import adminReportRoutes from "./src/routes/adminReportRoutes.js";

dotenv.config(); // load environment variables before accessing process.env

const app = express();

app.use(cors());
app.use(express.json()); // multipart/form-data ditangani oleh multer pada route upload

// existing functionality
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/shipping", shippingRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/admin/services", adminServiceRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/settings", adminSettingsRoutes);
app.use("/api/admin/reports", adminReportRoutes);

// new product upload & public catalogue
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/products", productRoutes);

const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

if (!MONGO_URI) {
  console.error("Missing MONGO_URI in environment. Check your .env file.");
  process.exit(1);
}

// Helpful connection event logs
mongoose.connection.on("connected", () => {
  console.log("MongoDB connected");
});
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});
mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected");
});

// Connect to MongoDB and only start server after success
mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: 10000, // fail fast if cluster not reachable
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log("Server running on port", PORT);
    });
  })
  .catch((err) => {
    console.error("MongoDB error:", err);
    // Exit so container/pm2/systemd can restart and logs surface the root cause
    process.exit(1);
  });

// Jalankan server pengembangan:
// 1. Pastikan package.json memiliki script "dev": "nodemon server.js"
// 2. Jalankan perintah: npm run dev
// .env wajib berisi MONGO_URI, CLOUDINARY_NAME, CLOUDINARY_KEY, CLOUDINARY_SECRET, PORT.
