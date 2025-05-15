const Product = require("../Models/Product");
const ProductStock = require("../Models/ProductStock");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const PurchaseHistory = require("../Models/PurchaseHistory");
const User = require("../Models/User");

// Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage }).single("image");

// ✅ Upload Product
exports.uploadProduct = (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).send("Upload Error");

    try {
      const { name, detail, price, categoryId } = req.body;
      if (!name || !detail || !price || !categoryId)
        return res.status(400).send("Missing fields");

      const product = new Product({
        name,
        detail,
        price,
        image: req.file ? `/uploads/${req.file.filename}` : undefined,
        categoryId,
      });

      await product.save();
      res.status(201).send("Product uploaded successfully");
    } catch (e) {
      console.error(e);
      res.status(500).send("Server error");
    }
  });
};

// ✅ Update Product
exports.updateProduct = (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).send("Upload error");

    try {
      const { name, detail, price, categoryId } = req.body;

      const updated = { name, detail, price, categoryId };
      if (req.file) updated.image = `/uploads/${req.file.filename}`;

      await Product.findByIdAndUpdate(req.params.id, updated);
      res.send("Product updated successfully");
    } catch (err) {
      console.error(err);
      res.status(500).send("Update failed");
    }
  });
};

// ✅ Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send("ไม่พบสินค้า");

    const filePath = path.join(__dirname, "..", product.image.replace(/^\/+/, ""));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await Product.findByIdAndDelete(req.params.id);
    await ProductStock.deleteMany({ productId: req.params.id }); // ลบ stock ด้วย
    res.send("ลบสินค้าสำเร็จ");
  } catch (err) {
    console.error(err);
    res.status(500).send("ลบสินค้าล้มเหลว");
  }
};

// ✅ เพิ่มสต็อก
exports.addStock = async (req, res) => {
  try {
    const { productId, username, password } = req.body;
    if (!productId || !username || !password)
      return res.status(400).send("ข้อมูลไม่ครบ");

    const stock = new ProductStock({ productId, username, password });
    await stock.save();
    res.send("เพิ่มสต็อกสำเร็จ");
  } catch (err) {
    console.error(err);
    res.status(500).send("เพิ่มสต็อกล้มเหลว");
  }
};

// ✅ ดูสต็อกทั้งหมดของสินค้านี้
exports.getStockByProduct = async (req, res) => {
  try {
    const stock = await ProductStock.find({ productId: req.params.id });
    res.json(stock);
  } catch (err) {
    console.error(err);
    res.status(500).send("โหลดสต็อกล้มเหลว");
  }
};

// ✅ ลบสต็อก
exports.deleteStock = async (req, res) => {
  try {
    await ProductStock.findByIdAndDelete(req.params.id);
    res.send("ลบสต็อกสำเร็จ");
  } catch (err) {
    console.error(err);
    res.status(500).send("ลบสต็อกล้มเหลว");
  }
};

// ✅ ซื้อสินค้า
exports.buyProduct = async (req, res) => {
  const userId = req.user.id;
  const productId = req.params.id;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).send("ไม่พบสินค้า");

    const user = await User.findById(userId);
    if (!user) return res.status(401).send("ไม่พบผู้ใช้");

    const stockItem = await ProductStock.findOne({ productId, isSold: false });
    if (!stockItem) return res.status(400).send("❌ ไม่มีสินค้าในสต็อก");

    const price = parseInt(product.price);
    if (user.point < price) return res.status(400).send("❌ ยอดเงินไม่พอ");

    // ✅ หักเงิน
    user.point -= price;
    await user.save();

    // ✅ mark ว่าขายแล้ว (ไม่ลบ)
    stockItem.isSold = true;
    await stockItem.save();

    // ✅ บันทึกประวัติ
    const history = new PurchaseHistory({
      userId,
      productId,
      stockId: stockItem._id,
    });
    await history.save();

    res.json({
      message: "✅ ซื้อสินค้าสำเร็จ",
      stock: {
        username: stockItem.username,
        password: stockItem.password,
      },
    });
  } catch (err) {
    console.error("❌ ซื้อสินค้าไม่สำเร็จ", err);
    res.status(500).send("Server error");
  }
};



exports.getPurchaseHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const history = await PurchaseHistory.find({ userId })
      .populate("productId", "name")
      .populate("stockId", "username password")
      .sort({ createdAt: -1 });

    const formatted = history.map((h) => ({
      product: h.productId,
      stock: h.stockId,
      createdAt: h.createdAt,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("❌ โหลดประวัติไม่สำเร็จ:", err);
    res.status(500).send("Server error");
  }
};