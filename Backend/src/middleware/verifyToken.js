import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token tidak ditemukan" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id || decoded._id,
      role: decoded.role,
      email: decoded.email,
    };
    next();
  } catch (err) {
    console.error("Error verifyToken:", err.message);
    return res.status(403).json({ message: "Token tidak valid" });
  }
};

