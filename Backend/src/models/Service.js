import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    type: { type: String, default: "service", immutable: true },
    price: { type: Number, required: true, min: 0, alias: "pricePerKg" },
    beanType: {
      type: String,
      enum: ["arabika", "robusta"],
      required: true,
      lowercase: true,
      trim: true,
    },
    roastProfiles: {
      type: [String],
      enum: ["lite", "medium", "dark"],
      default: ["lite", "medium", "dark"],
      set: (profiles) =>
        Array.isArray(profiles)
          ? Array.from(
              new Set(
                profiles
                  .map((profile) => String(profile).trim().toLowerCase())
                  .filter((profile) =>
                    ["lite", "medium", "dark"].includes(profile)
                  )
              )
            )
          : ["lite", "medium", "dark"],
    },
    minWeightKg: {
      type: Number,
      min: 0,
      default() {
        return typeof this.minWeight === "number" ? this.minWeight : 1;
      },
    },
    maxWeightKg: {
      type: Number,
      min: 0,
      default() {
        return typeof this.maxWeight === "number" ? this.maxWeight : 50;
      },
    },
    imageURL: { type: String, trim: true, alias: "imageUrl" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

serviceSchema.index({ name: "text" });

export default mongoose.model("Service", serviceSchema);
