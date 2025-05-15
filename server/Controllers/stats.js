const User = require("../Models/User");
const Product = require("../Models/Product");

exports.getStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();
    const soldCount = 9298; // ใส่ค่าจริงหรือดึงจากระบบยอดขาย

    res.json({
      users: userCount,
      products: productCount,
      sold: soldCount,
      categories: 4, // หรือดึงจาก Category.countDocuments()
    });
  } catch (err) {
    res.status(500).send("Error loading stats");
  }
};
