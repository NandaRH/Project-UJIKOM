import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const buildTokenPayload = (user) => ({
  id: user._id,
  role: user.role,
  email: user.email,
});

const generateToken = (user) =>
  jwt.sign(buildTokenPayload(user), process.env.JWT_SECRET, {
    expiresIn: "2h",
  });

const buildUserResponse = (user) => ({
  id: user._id,
  full_name: user.full_name,
  username: user.username,
  email: user.email,
  phone: user.phone,
  gender: user.gender,
  birthDate: user.birthDate,
  address: user.address,
  role: user.role,
});

const authenticate = async ({ email, password, roles }) => {
  const query = { email };
  if (roles?.length) {
    query.role = { $in: roles };
  }

  const user = await User.findOne(query);
  if (!user) {
    return { error: "Pengguna tidak ditemukan" };
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return { error: "Password salah" };
  }

  return { user };
};

export const register = async (req, res) => {
  try {
    const {
      full_name,
      username,
      email,
      password,
      phone,
      gender,
      birthDate,
      address,
      role,
    } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email sudah terdaftar" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const parsedBirthDate = birthDate ? new Date(birthDate) : null;
    const userData = {
      full_name,
      username,
      email,
      password: hashedPassword,
      phone,
      gender,
      address,
      role: role || "user",
    };

    if (parsedBirthDate && !isNaN(parsedBirthDate)) {
      userData.birthDate = parsedBirthDate;
    }

    const newUser = new User({
      ...userData,
    });

    await newUser.save();
    res.status(201).json({
      message: "Registrasi berhasil",
      user: buildUserResponse(newUser),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password, role } = req.body;
    const desiredRole = role ? String(role).toLowerCase() : null;
    const roles = desiredRole ? [desiredRole] : ["admin", "user"];

    const { user, error } = await authenticate({ email, password, roles });
    if (error) {
      return res.status(400).json({ message: error });
    }

    const token = generateToken(user);
    res.json({
      message: "Login berhasil",
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, error } = await authenticate({
      email,
      password,
      roles: ["user"],
    });
    if (error) return res.status(400).json({ message: error });

    const token = generateToken(user);

    res.status(200).json({
      message: "Login berhasil (User)",
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, error } = await authenticate({
      email,
      password,
      roles: ["admin"],
    });
    if (error) return res.status(400).json({ message: error });

    const token = generateToken(user);

    res.status(200).json({
      message: "Login berhasil (Admin)",
      token,
      admin: {
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
