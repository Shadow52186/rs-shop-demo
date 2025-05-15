const express = require("express");
const router = express.Router();
const {
  listCategories,
  uploadCategory,
  removeCategory,
  updateCategory,
} = require("../Controllers/category");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Category = require("../Models/Category");

// ตั้งค่า multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, "../uploads/categories");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

router.get("/categories", listCategories);

// ✅ เพิ่ม API สำหรับดึงหมวดหมู่เดียว
router.get("/categories/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).send("Category not found");
    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.post("/category/upload", upload.single("image"), uploadCategory);
router.put("/category/:id", upload.single("image"), updateCategory);
router.delete("/category/:id", removeCategory);

module.exports = router;
