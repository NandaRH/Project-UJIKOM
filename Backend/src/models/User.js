import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    full_name: { type: String, required: true },
    username: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    gender: { type: String, enum: ["Pria", "Wanita"], default: "Pria" },
    birthDate: { type: Date },
    address: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    resetToken: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
