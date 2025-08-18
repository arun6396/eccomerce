const mongoose = require("mongoose");
const customer = require("./customer");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const reviewSchema = mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.ObjectId,
      ref: "Order",
    },

    customerId: {
      type: mongoose.Schema.ObjectId,
      ref: "Customer",
      required: true,
    },

    productId: {
      type: mongoose.Schema.ObjectId,
      ref: "product",
      required: true,
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

reviewSchema.plugin(AutoIncrement, {
  id: "reviewIdCounter",
  inc_field: "reviewId",
});
module.exports = mongoose.model("review", reviewSchema);
