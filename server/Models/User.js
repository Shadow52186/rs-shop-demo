// models/User.js

const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
  {
    username: String,
    password: String,
    point: { type: Number, default: 0 }, // ✅ เพิ่มตรงนี้
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user', // ✅ กำหนด default เป็น user
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
