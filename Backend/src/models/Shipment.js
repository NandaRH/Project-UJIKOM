import mongoose from "mongoose";

const shipmentSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  type: { type: String, enum: ["customer_to_roastery", "roastery_to_customer"], required: true },
  originAddress: { type: String, required: true },
  destinationAddress: { type: String, required: true },
  weight: { type: Number, required: true },
  service: { type: String, default: "JNE Cargo" },
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Shipment", shipmentSchema);
