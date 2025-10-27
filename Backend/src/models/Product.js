import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    beanType: {
      type: String,
      enum: ["arabika", "robusta"],
      required: true,
    },
    process: {
      type: String,
      enum: ["natural", "fullwash", "honey", "eksperimental"],
      required: true,
    },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    tags: [{ type: String }],
    active: { type: Boolean, default: true },
    imageUrl: { type: String },
    imagePublicId: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Product", ProductSchema);
