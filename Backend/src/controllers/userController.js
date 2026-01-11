import User from "../models/User.js";

// Ambil profil user login
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });
    res.json({ user });
  } catch (err) {
    console.error("Gagal ambil profil:", err);
    res.status(500).json({
      message: "Gagal ambil data profil",
      error: err.message,
    });
  }
};

// Update profil user
export const updateProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Akses tidak valid." });
    }

    const {
      full_name,
      username,
      email,
      phone,
      gender,
      birthDate,
      address,
    } = req.body;

    const fieldsToUpdate = {};

    if (full_name !== undefined) fieldsToUpdate.full_name = full_name;
    if (username !== undefined) fieldsToUpdate.username = username;
    if (phone !== undefined) fieldsToUpdate.phone = phone;
    if (email !== undefined) fieldsToUpdate.email = email;

    if (gender !== undefined) {
      const allowedGender = ["Pria", "Wanita"];
      if (gender && !allowedGender.includes(gender)) {
        return res.status(400).json({ message: "Gender tidak valid" });
      }
      fieldsToUpdate.gender = gender;
    }

    if (birthDate !== undefined) {
      if (birthDate === null || birthDate === "") {
        fieldsToUpdate.birthDate = null;
      } else {
        const parsedBirthDate = new Date(birthDate);
        if (isNaN(parsedBirthDate)) {
          return res.status(400).json({ message: "Tanggal lahir tidak valid" });
        }
        fieldsToUpdate.birthDate = parsedBirthDate;
      }
    }

    if (address !== undefined) fieldsToUpdate.address = address;

    const updated = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
    }).select("-password");

    if (!updated) return res.status(404).json({ message: "User tidak ditemukan" });

    res.json({ message: "Profil berhasil diperbarui", user: updated });
  } catch (err) {
    console.error("Gagal update profil:", err);
    res.status(500).json({
      message: "Gagal memperbarui profil",
      error: err.message,
    });
  }
};

