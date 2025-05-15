// middleware/auth.js
const jwt = require("jsonwebtoken");

exports.auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).send("Access denied");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // ✅ ตรวจ role ได้จาก req.user.role
    next();
  } catch (err) {
    res.status(400).send("Invalid token");
  }
};

exports.isAdmin = (req, res, next) => {
  console.log("🔒 user.role =", req.user.role);
  if (req.user.role !== "admin") {
    return res.status(403).send("Admin access only"); // ⛔️
  }
  next();
};
