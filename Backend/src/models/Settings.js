import mongoose from "mongoose";

const bankAccountSchema = new mongoose.Schema(
  {
    bankName: { type: String, default: "" },
    accountName: { type: String, default: "" },
    accountNumber: { type: String, default: "" },
  },
  { _id: false }
);

const settingsSchema = new mongoose.Schema(
  {
    storeProfile: {
      name: { type: String, default: "" },
      address: { type: String, default: "" },
      phone: { type: String, default: "" },
      email: { type: String, default: "" },
    },
    payments: {
      bank: { type: [bankAccountSchema], default: [] },
      qris: {
        label: { type: String, default: "" },
        instructions: { type: String, default: "" },
      },
    },
    shipping: {
      originAddress: { type: String, default: "" },
      originCoords: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 },
      },
      useJNECargo: { type: Boolean, default: false },
      weightRules: {
        cargoMinKg: { type: Number, default: 10 },
        cargoDefault: { type: Number, default: 5 },
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Settings", settingsSchema);

