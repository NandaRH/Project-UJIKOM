import Service from "../models/Service.js";

export const addService = async (req, res) => {
  try {
    const {
      name,
      description,
      beanType,
      roastProfiles,
      price,
      minWeightKg,
      maxWeightKg,
      imageURL,
      active,
    } = req.body;

    const service = new Service({
      name,
      description,
      beanType,
      roastProfiles,
      price,
      minWeightKg,
      maxWeightKg,
      imageURL,
      active: active ?? true,
    });

    await service.save();
    res.status(201).json({
      message: "Jasa roasting berhasil ditambahkan",
      service,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getServices = async (req, res) => {
  try {
    const { active } = req.query;
    const filter = {};

    if (typeof active !== "undefined") {
      filter.active = active === "true";
    }

    const services = await Service.find(filter).sort({ createdAt: -1 });
    res.status(200).json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const calculateRoastingCost = async (req, res) => {
  try {
    const { serviceId, weight, roastProfile } = req.body;
    const numericWeight = Number(weight);

    if (!Number.isFinite(numericWeight) || numericWeight <= 0) {
      return res.status(400).json({ message: "Berat tidak valid" });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Jasa tidak ditemukan" });
    }

    const min = service.minWeightKg ?? 1;
    const max = service.maxWeightKg ?? 50;
    if (numericWeight < min || numericWeight > max) {
      return res
        .status(400)
        .json({ message: `Berat harus antara ${min}kg - ${max}kg` });
    }

    if ((numericWeight * 10) % 5 !== 0) {
      return res.status(400).json({
        message: "Berat hanya bisa kelipatan 0.5kg (contoh: 1, 1.5, 2, 2.5)",
      });
    }

    const normalizedProfile = String(roastProfile || "")
      .trim()
      .toLowerCase();
    if (
      normalizedProfile &&
      !service.roastProfiles.includes(normalizedProfile)
    ) {
      return res.status(400).json({
        message: `Profil roasting '${roastProfile}' tidak tersedia.`,
      });
    }

    const totalCost = service.price * numericWeight;

    res.status(200).json({
      message: "Perhitungan berhasil",
      data: {
        serviceName: service.name,
        beanType: service.beanType,
        roastProfile: normalizedProfile || service.roastProfiles[0],
        weight: numericWeight,
        pricePerKg: service.price,
        totalCost,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
