const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);
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
    _id:{
      type:Number,
    },
    customerId: {
      type: Number,
      ref: "Customer",
      required: true,
    },
    
        productId: {
          type:Number,
          ref: "product",
          required: true,
        },
        
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      
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
      type: Number,
      ref: "shipment",
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

orderSchema.plugin(AutoIncrement,{id:'orderId',$inc_field:'_id'})

module.exports = mongoose.model("Order", orderSchema);
module.exports.Status = Status;
module.exports.PaymentType = PaymentType;
