const mongoose = require("mongoose");

const Status = {
  Pending: 0,
  Shipped: 1,
  Delivery: 2,
  Cancel: 3,
};

const PaymentType = {
  Card: 0,
  UPI: 1,
  CashOnDelivery: 2,
};
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
      type: Number,
      enum: [Status.Pending, Status.Shipped, Status.Delivery, Status.Cancel],
      default: Status.Pending,
    },
    paymentType: {
      type: Number,
      enum: [PaymentType.Card, PaymentType.UPI, PaymentType.CashOnDelivery],
      required: true,
    },
    shipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "shipment",
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
module.exports.Status = Status;
module.exports.PaymentType = PaymentType;
