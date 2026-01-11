import { validationResult } from "express-validator";
import Settings from "../models/Settings.js";

const ensureSettings = async () => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = new Settings();
    await settings.save();
  }
  return settings;
};

const deepMerge = (target, source) => {
  if (!source || typeof source !== "object") {
    return target;
  }

  Object.keys(source).forEach((key) => {
    const sourceValue = source[key];
    const targetValue = target[key];

    if (
      Array.isArray(sourceValue) &&
      Array.isArray(targetValue) &&
      key === "bank"
    ) {
      target[key] = sourceValue.map((item) => ({
        bankName: item.bankName || "",
        accountName: item.accountName || "",
        accountNumber: item.accountNumber || "",
      }));
      return;
    }

    if (
      sourceValue &&
      typeof sourceValue === "object" &&
      !Array.isArray(sourceValue)
    ) {
      if (!targetValue || typeof targetValue !== "object") {
        target[key] = {};
      }
      deepMerge(target[key], sourceValue);
      return;
    }

    if (typeof sourceValue !== "undefined") {
      target[key] = sourceValue;
    }
  });

  return target;
};

const envFlags = {
  hasLocationIqKey: Boolean(process.env.LOCATIONIQ_KEY),
  hasJwtSecret: Boolean(process.env.JWT_SECRET),
  hasMongoUri: Boolean(process.env.MONGO_URI),
};

export const getSettings = async (_req, res) => {
  try {
    const settings = await ensureSettings();
    res.json({ settings, envFlags });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSettings = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const settings = await ensureSettings();
    const payload = { ...req.body };
    delete payload.envFlags;
    deepMerge(settings, payload);
    await settings.save();

    res.json({
      message: "Pengaturan berhasil diperbarui",
      settings,
      envFlags,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
