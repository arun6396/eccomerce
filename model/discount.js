const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const discountSchema = mongoose.Schema(
  {
    minDiscount: {
      type: Number,
    },
    maxDiscount: {
      type: Number,
    },
    createdBy: { 
      type: mongoose.Schema.ObjectId,
      ref: "users",
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

discountSchema.plugin(AutoIncrement, {
  id: "discountIdCounter",
  inc_field: "discountId",
  start_seq: 1,
});

module.exports = mongoose.model("discount", discountSchema);
