const express = require("express");
const router = express.Router();
const {
  uploadProduct,
  updateProduct,
  deleteProduct,
  addStock,
  getStockByProduct,
  deleteStock,
  buyProduct,
} = require("../Controllers/product");

const Product = require("../Models/Product"); // ✅ ต้องมี!
const { auth } = require("../Middleware/auth");
const { getPurchaseHistory } = require("../Controllers/product");

// ✅ ดึงสินค้าทั้งหมด
router.get("/product", async (req, res) => {
  try {
    const filter = {};
    if (req.query.categoryId) filter.categoryId = req.query.categoryId;

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// ✅ จัดการสินค้า
router.post("/product/upload", uploadProduct);
router.put("/product/:id", updateProduct);
router.delete("/product/:id", deleteProduct);

// ✅ จัดการสต็อก
router.post("/stock", addStock);
router.get("/stock/:id", getStockByProduct);
router.delete("/stock/:id", deleteStock);

// ✅ ซื้อสินค้า (ต้อง login ก่อน)
router.post("/purchase/:id", auth, buyProduct);

router.get("/purchase/history", auth, getPurchaseHistory);

module.exports = router;
