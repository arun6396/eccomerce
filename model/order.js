const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const Status = {
  Pending: 0,
  Shipped: 1,
  Delivery: 2,
  Cancel: 3,
  ReturnRequested: 4,
};

const PaymentType = {
  Card: 0,
  UPI: 1,
  CashOnDelivery: 2,
};
const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.ObjectId,
      ref: "Customer",
      required: true,
    },


   products: [
  {
    productId: { type: mongoose.Schema.ObjectId, ref: "product", required: true },
    quantity: { type: Number, required: true,min:1 }
  }
]
,
    totalAmount: {
      type: Number,
    },
    status: {
      type: Number,
      enum: [
        Status.Pending,
        Status.Shipped,
        Status.Delivery,
        Status.Cancel,
        Status.ReturnRequested,
      ],
      default: Status.Pending,
    },
    paymentType: {
      type: Number,
      enum: [PaymentType.Card, PaymentType.UPI, PaymentType.CashOnDelivery],
      required: true,
    },
    shipmentId: {
      type: mongoose.Schema.ObjectId,
      ref: "shipment",
      required: true,
    },
    validReason: {
      type: String,
      default: null,
    },
    deliveryDate: {
      type: Date,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

orderSchema.plugin(AutoIncrement, {
  id: "orderIdCounter",
  inc_field: "orderId",
});

module.exports = mongoose.model("Order", orderSchema);
module.exports.Status = Status;
module.exports.PaymentType = PaymentType;
