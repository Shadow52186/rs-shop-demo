const express = require('express');
const router = express.Router();

const {
  register,
  login,
} = require('../Controllers/auth');

const loginLimiter = require('../Middleware/loginLimiter');
const { auth } = require('../Middleware/auth');
const User = require("../Models/User");

router.post("/register", register);
router.post("/login", loginLimiter, login);

// ✅ แก้ให้ดึงข้อมูลจาก database จริง
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // ลบ password ออกจากผลลัพธ์
    if (!user) return res.status(404).send("ไม่พบผู้ใช้");

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
