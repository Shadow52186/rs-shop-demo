const mongoose = require("mongoose");

const purchaseHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    stockId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductStock",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PurchaseHistory", purchaseHistorySchema);
