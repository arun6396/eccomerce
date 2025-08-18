const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const productSchema = mongoose.Schema(
  {
    ProductName: {
      type: String,
      required: true,
    },
    price: { type: Number, required: true },
    quantity: { type: Number, default: 1 },
    categoryById: { type: mongoose.Schema.ObjectId, ref: "category" },
    brand: { type: String },
    description: { type: String },
    stock: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
    gstCategoryId: {
      type: mongoose.Schema.ObjectId,
      ref: "gstCategory",
    },
    discountId: {
      type: mongoose.Schema.ObjectId,
      ref: "discount",
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "users",
    },
    updatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "users",
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

productSchema.plugin(AutoIncrement, {
  id: "productIdCounter",
  inc_field: "productId",
});
module.exports = mongoose.model("product", productSchema);
