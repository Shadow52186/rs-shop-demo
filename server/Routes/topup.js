const express = require("express");
const router = express.Router();
const { redeemTrueMoney } = require("../Controllers/topup");
const { auth } = require("../Middleware/auth");

router.post("/topup/redeem", auth, redeemTrueMoney);

module.exports = router;
