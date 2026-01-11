import fetch from "node-fetch";
import Shipment from "../models/Shipment.js";
import User from "../models/User.js";
import Settings from "../models/Settings.js";
import Order from "../models/Order.js";
import dotenv from "dotenv";

dotenv.config();

const getCoords = async (input) => {
  const key = process.env.LOCATIONIQ_KEY;
  if (!input) return null;

  const coordRegex = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/;
  if (coordRegex.test(input)) {
    const [lat, lon] = input.split(",").map((value) => parseFloat(value.trim()));
    return { lat, lon };
  }

  const url = `https://us1.locationiq.com/v1/search?key=${key}&q=${encodeURIComponent(
    input
  )}&format=json`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn("Alamat tidak ditemukan:", input);
      return { lat: -6.974097, lon: 107.597262 };
    }

    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
    };
  } catch (error) {
    console.error("Gagal mengambil koordinat:", error);
    return { lat: -6.974097, lon: 107.597262 };
  }
};

const calcDistance = (a, b) => {
  const R = 6371;
  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

export const calculateShipping = async (req, res) => {
  try {
    const { orderId, customerAddress, weight, type, hasService } = req.body;

    const weightNumber = Number(weight);
    if (Number.isNaN(weightNumber) || weightNumber <= 0) {
      return res.status(400).json({ message: "Berat paket tidak valid" });
    }

    const normalizedOrderId =
      typeof orderId === "string" ? orderId.trim() : "";
    if (!normalizedOrderId) {
      return res.status(400).json({ message: "orderId wajib diisi" });
    }

    const serviceType = type || "regular";
    const hasServiceFlag =
      typeof hasService === "string"
        ? hasService.toLowerCase() === "true"
        : Boolean(hasService);

    let resolvedAddress =
      typeof customerAddress === "string" ? customerAddress.trim() : "";
    let addressSource = "payload";

    if (!resolvedAddress && req.user?.id) {
      const profile = await User.findById(req.user.id)
        .select("address")
        .lean();
      if (profile?.address) {
        resolvedAddress = profile.address;
        addressSource = "profile";
      }
    }

    if (!resolvedAddress) {
      return res.status(400).json({ message: "Alamat pembeli wajib diisi" });
    }

    const settings = await Settings.findOne().lean();
    const roasteryCoordSetting = settings?.shipping?.originCoords;
    const roastery = roasteryCoordSetting?.lat && roasteryCoordSetting?.lng
      ? { lat: roasteryCoordSetting.lat, lon: roasteryCoordSetting.lng }
      : { lat: -6.974097, lon: 107.597262 };
    const roasteryAddress =
      settings?.shipping?.originAddress ||
      "Jl. Nata Endah No.11B, Margahayu Tengah, Kabupaten Bandung, Jawa Barat 40228";

    const coordCustomer = await getCoords(resolvedAddress);

    if (!coordCustomer) {
      return res
        .status(404)
        .json({ message: "Koordinat pembeli tidak ditemukan" });
    }

    const perKm = serviceType === "cargo" ? 2500 : 4000;
    const weightRules = settings?.shipping?.weightRules || {};
    const useCargo = Boolean(settings?.shipping?.useJNECargo);

    if (serviceType === "cargo" && useCargo) {
      const minCargo = Number(weightRules.cargoMinKg) || 0;
      if (weightNumber < minCargo) {
        return res.status(400).json({
          message: `Berat minimal untuk JNE Cargo adalah ${minCargo} kg`,
        });
      }
    }
    let totalDistance = 0;
    let cost = 0;
    const shipments = [];

    const upsertShipment = async (type, data) => {
      const existing = await Shipment.findOne({
        orderId: normalizedOrderId,
        type,
      });

      if (existing) {
        if (["pending", "pickup_scheduled"].includes(existing.status)) {
          existing.originAddress = data.originAddress;
          existing.destinationAddress = data.destinationAddress;
          existing.weight = data.weight;
          existing.service = data.service;
          existing.status = data.status ?? existing.status;
          await existing.save();
        }
        return existing;
      }

      const created = new Shipment({
        ...data,
        orderId: normalizedOrderId,
        type,
      });
      await created.save();
      return created;
    };

    if (hasServiceFlag) {
      const distanceIn = calcDistance(coordCustomer, roastery);
      const distanceOut = calcDistance(roastery, coordCustomer);
      totalDistance = distanceIn + distanceOut;
      cost = Math.round(perKm * totalDistance * (weightNumber / 10));

      const inbound = await upsertShipment("customer_to_roastery", {
        originAddress: resolvedAddress,
        destinationAddress: roasteryAddress,
        weight: weightNumber,
        service: serviceType,
        status: "pickup_scheduled",
      });

      const outbound = await upsertShipment("roastery_to_customer", {
        originAddress: roasteryAddress,
        destinationAddress: resolvedAddress,
        weight: weightNumber,
        service: serviceType,
        status: "pending",
      });

      shipments.push(inbound, outbound);
    } else {
      await Shipment.deleteMany({
        orderId: normalizedOrderId,
        type: "customer_to_roastery",
        status: { $in: ["pending", "pickup_scheduled"] },
      });

      const distance = calcDistance(roastery, coordCustomer);
      totalDistance = distance;
      cost = Math.round(perKm * totalDistance * (weightNumber / 10));

      const outbound = await upsertShipment("roastery_to_customer", {
        originAddress: roasteryAddress,
        destinationAddress: resolvedAddress,
        weight: weightNumber,
        service: serviceType,
        status: "pending",
      });

      shipments.push(outbound);
    }

    res.json({
      message: "Penghitungan ongkir berhasil",
      summary: {
        totalDistance: `${totalDistance.toFixed(2)} km`,
        totalCost: cost,
        service: serviceType,
        weight: weightNumber,
        mode: hasServiceFlag ? "two_way" : "one_way",
      },
      address: {
        value: resolvedAddress,
        source: addressSource,
      },
      shipments,
    });
  } catch (error) {
    console.error("Error menghitung ongkir:", error);
    res.status(500).json({
      message: "Error menghitung ongkir",
      error: error.message,
    });
  }
};

export const trackShipment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const normalizedOrderId =
      typeof orderId === "string" ? orderId.trim() : "";
    if (!normalizedOrderId) {
      return res.status(400).json({ message: "orderId wajib disediakan" });
    }

    const [shipments, order] = await Promise.all([
      Shipment.find({ orderId: normalizedOrderId }),
      Order.findOne({ orderId: normalizedOrderId }).select("userId"),
    ]);

    if (!order) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan" });
    }

    const isAdmin = req.user?.role === "admin";
    const isOwner = order.userId?.toString() === req.user?.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "Akses tidak diizinkan" });
    }

    if (!shipments.length) {
      return res
        .status(404)
        .json({ message: "Data pengiriman tidak ditemukan" });
    }

    res.json({ orderId: normalizedOrderId, shipments });
  } catch (error) {
    console.error("Error tracking shipment:", error);
    res.status(500).json({
      message: "Gagal mengambil data pengiriman",
      error: error.message,
    });
  }
};
