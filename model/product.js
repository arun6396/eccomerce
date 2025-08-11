const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    ProductName: {
      type: String,
      required: true,
    },
    price: { type: Number, required: true },
    quantity: { type: Number, default: 1 },
    categoryById: { type: mongoose.Schema.Types.ObjectId, ref: "category" },
    brand: { type: String },
    description: { type: String },
    stock: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
    gstCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "gstCategory",
    },
    discountId: {
      type: mongoose.Schema.ObjectId,
      ref: "discount",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("product", productSchema);
