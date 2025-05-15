const mongoose = require("mongoose");

// สร้าง Schema สำหรับ LoginAttempt
const loginAttemptSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  lastAttempt: { type: Date, default: Date.now },
});

// หากโมเดลถูกสร้างไปแล้วไม่ต้องสร้างซ้ำ
const LoginAttempt = mongoose.models.LoginAttempt || mongoose.model("LoginAttempt", loginAttemptSchema);

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 นาที

const loginLimiter = async (req, res, next) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ message: "Username is required for rate limiting." });
  }

  try {
    let attempt = await LoginAttempt.findOne({ username });

    const now = Date.now();

    if (!attempt) {
      attempt = new LoginAttempt({ username });
    } else if (now - attempt.lastAttempt.getTime() > WINDOW_MS) {
      // เกินเวลา → รีเซ็ตนับใหม่
      attempt.count = 0;
    }

    attempt.count += 1;
    attempt.lastAttempt = now;

    if (attempt.count > MAX_ATTEMPTS) {
      await attempt.save();
      return res.status(429).json({
        message: "Too many login attempts for this username. Please try again after 15 minutes.",
      });
    }

    await attempt.save();

    // ส่งจำนวนที่เหลือกลับใน header
    const remaining = MAX_ATTEMPTS - attempt.count;
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.locals.remainingAttempts = remaining;

    next();
  } catch (err) {
    console.error("LoginLimiter Error:", err);
    return res.status(500).json({ message: "Rate limiter server error" });
  }
};

module.exports = loginLimiter;
