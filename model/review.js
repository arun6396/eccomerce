const mongoose = require("mongoose");
const customer = require("./customer");
const AutoIncrement = require('mongoose-sequence')(mongoose);

const reviewSchema = mongoose.Schema(
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
      type: Number,
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

reviewSchema.plugin(AutoIncrement,{id:'reviewId',$inc_field:'_id'});
module.exports = mongoose.model("review", reviewSchema);
