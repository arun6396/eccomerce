const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const returnStatus = {
  Requested: 0,
  Approved: 1,
  Rejected: 2,
  InTransist: 3,
  Success: 4,
};

const refundType = {
  Wallet: 0,
  Replacement: 1,
};

const returnOrderSchema = mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.ObjectId,
      ref:"Order",
      required: true,
    },
    customerId: {
      type: mongoose.Schema.ObjectId,
      ref:"Customer",
      required: true,
    },
    status: {
      type: Number,
      enum: [
        returnStatus.Requested,
        returnStatus.Approved,
        returnStatus.InTransist,
        returnStatus.Success,
      ],
    },
    processedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "users",
    },
    refundType: {
      type: Number,
      enum: [refundType.Wallet, refundType.Replacement],
    },
  },
  { versionKey: false, timeStamps: true }
);

returnOrderSchema.plugin(AutoIncrement, {
  id: "returnOrderIdCounter",
  inc_field: "returnOrderId",
});

module.exports = mongoose.model("returnOrder", returnOrderSchema);
