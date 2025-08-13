const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);

const productSchema = mongoose.Schema(
  {
    _id:{
      type:Number,
    },

    ProductName: {
      type: String,
      required: true,
    },
    price: { type: Number, required: true },
    quantity: { type: Number, default: 1 },
    categoryById: { type:Number, ref: "category" },
    brand: { type: String },
    description: { type: String },
    stock: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
    gstCategoryId: {
      type:Number,
      ref: "gstCategory",
    },
    discountId: {
      type: Number,
      ref: "discount",
    },
    createdBy: {
      type: Number,
      ref: "User",
    },
    updatedBy: {
      type:Number,
      ref: "User",
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

productSchema.plugin(AutoIncrement,{id:'productId',$inc_field:'_id'})
module.exports = mongoose.model("product", productSchema);
