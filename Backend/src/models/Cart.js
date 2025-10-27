import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
      name: String,
      price: Number,
      qty: { type: Number, default: 1 },
      type: { type: String, enum: ["product", "service"], default: "product" },
    },
  ],
  totalAmount: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Cart", cartSchema);
