const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String }, // path หรือ URL รูปภาพ
});

module.exports = mongoose.model("Category", categorySchema);
