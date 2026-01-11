import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    address: { type: String, required: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        qty: { type: Number, required: true, min: 1 },
        type: {
          type: String,
          enum: ["product", "service"],
          default: "product",
        },
      },
    ],
    total: { type: Number, required: true, min: 0 },
    shipping: {
      totalDistance: { type: String },
      totalCost: { type: Number, default: 0 },
      service: { type: String },
      weight: { type: Number },
      mode: { type: String },
    },
    status: {
      type: String,
      enum: ["pending", "paid", "processing", "shipped", "completed", "cancelled"],
      default: "pending",
      index: true,
    },
    statusHistory: {
      type: [
        {
          status: String,
          changedAt: { type: Date, default: Date.now },
          changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        },
      ],
      default: [],
    },
    stockAdjusted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

orderSchema.pre("save", function preSave(next) {
  if (this.isNew) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
      changedBy: this._updatedBy,
    });
  } else if (this.isModified("status")) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
      changedBy: this._updatedBy,
    });
  }
  next();
});

orderSchema.methods.markUpdatedBy = function markUpdatedBy(userId) {
  this._updatedBy = userId;
};

orderSchema.index({ createdAt: -1 });
orderSchema.index({ customerName: "text", orderId: "text" });

export default mongoose.model("Order", orderSchema);
