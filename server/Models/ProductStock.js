// Models/ProductStock.js
const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    username: { type: String, required: true },
    password: { type: String, required: true },
    isSold: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// 💥 ระบุชื่อ collection ว่า "stocks"
module.exports = mongoose.model("ProductStock", stockSchema, "stocks");
