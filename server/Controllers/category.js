const Category = require("../Models/Category");
const path = require("path");
const fs = require("fs");

// ✅ ดึงหมวดหมู่ทั้งหมด
exports.listCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

// ✅ เพิ่มหมวดหมู่จาก JSON (ไม่ใช้รูป)
exports.createCategory = async (req, res) => {
  try {
    const { name, image } = req.body;
    const category = await new Category({ name, image }).save();
    res.json(category);
  } catch (err) {
    res.status(500).send("Cannot create category");
  }
};

// ✅ อัปโหลดรูปพร้อมสร้างหมวดหมู่
exports.uploadCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const image = req.file ? `/uploads/categories/${req.file.filename}` : "";

    const category = await new Category({ name, image }).save();
    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error uploading category");
  }
};

// ✅ แก้ไขหมวดหมู่ พร้อมลบรูปเดิมถ้ามี
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    let updatedFields = { name };

    const category = await Category.findById(id);
    if (!category) return res.status(404).send("ไม่พบหมวดหมู่เดิม");

    // ✅ ถ้ามีการอัปโหลดรูปใหม่
    if (req.file) {
      const oldPath = path.join(__dirname, "..", category.image);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
        console.log("✅ ลบรูปเก่า:", oldPath);
      }

      updatedFields.image = `/uploads/categories/${req.file.filename}`;
    }

    const updated = await Category.findByIdAndUpdate(id, updatedFields, {
      new: true,
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).send("แก้ไขหมวดหมู่ล้มเหลว");
  }
};

// ✅ ลบหมวดหมู่และลบรูปภาพออกจาก disk ด้วย
exports.removeCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).send("ไม่พบหมวดหมู่");

    // ✅ ลบไฟล์จาก disk
    if (category.image) {
      const filePath = path.join(__dirname, "..", category.image);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log("✅ ลบรูปสำเร็จ:", filePath);
      } else {
        console.warn("⚠️ ไม่พบไฟล์:", filePath);
      }
    }

    // ✅ ลบจากฐานข้อมูล
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "ลบหมวดหมู่แล้ว", category });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting category");
  }
};
