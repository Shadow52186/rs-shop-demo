const axios = require("axios");
const qs = require("qs"); // ต้องติดตั้งด้วย: npm i qs

const User = require("../Models/User");
const TopupHistory = require("../Models/TopupHistory");
const UsedTrueMoney = require("../Models/UsedTrueMoney");

exports.redeemTrueMoney = async (req, res) => {
  const userId = req.user.id;
  const { link } = req.body;

  const keyapi = process.env.BYSHOP_API_KEY;
  const phone = process.env.BYSHOP_PHONE;

  console.log("✅ ENV DEBUG:", { keyapi, phone });

  if (!link) return res.status(400).send("กรุณาใส่ลิงก์ซอง");

  const existing = await UsedTrueMoney.findOne({ link });
  if (existing) {
    return res.status(400).json({ error: "ลิงก์นี้ถูกใช้งานไปแล้ว" });
  }

  try {
    const form = qs.stringify({
      keyapi,
      phone,
      gift_link: link,
    });

    const response = await axios.post("https://byshop.me/api/truewallet", form, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    console.log("✅ ByShop Response:", response.data);

    const { amount, status, message } = response.data;

    if (!amount || isNaN(amount)) {
      await UsedTrueMoney.create({ link, usedBy: userId, status: "fail" });
      return res.status(400).json({ error: message || "ไม่สามารถเติมเงินได้" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { point: amount } },
      { new: true }
    );

    await UsedTrueMoney.create({ link, usedBy: userId, amount, status: "success" });

    await new TopupHistory({
      userId,
      amount,
      note: "เติมผ่านซองอั่งเปา",
    }).save();

    res.json({ message: `เติมเงินสำเร็จ ${amount} บาท`, newPoint: user.point });
  } catch (err) {
    console.error("❌ ByShop Error:", err.response?.data || err.message);
    await UsedTrueMoney.create({ link, usedBy: userId, status: "fail" });
    return res.status(400).json({ error: "ลิงก์ไม่ถูกต้อง หรือซองนี้หมดอายุแล้ว" });
  }
};
