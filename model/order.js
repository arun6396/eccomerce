const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    productDetails: [
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
],
    totalAmount: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["Pending", "Shipped", "Delivered", "Cancel"],
      default: "Pending",
    },
    paymentType: {
      type: String,
      enum: ["Card", "UPI", "CashOnDelivery"],
      required: true,
    },
    shipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "shipment",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
