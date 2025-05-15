const User = require("../Models/User");
const jwt = require("jsonwebtoken");

// controllers/auth.js

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send("User Already Exists!!");
    }

    // ✨ เพิ่ม role ให้เป็น 'user' โดยอัตโนมัติ (ป้องกันคนแอบใส่ admin)
    const user = new User({ username, password, role: "user" });
    await user.save();

    return res.status(201).send("Register Successfully!!");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server Error");
  }
};


exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user || user.password !== password) {
      return res.status(401).send("Invalid username or password");
    }

    const payload = {
      id: user._id,
      username: user.username,
      role: user.role || "user",
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" });

    return res.status(200).json({
      message: "Login success",
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role || "user",
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server Error");
  }
};
