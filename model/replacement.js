const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const replacementSchema = mongoose.Schema(
  {
    previousOrderId: {
      type: mongoose.Schema.ObjectId,
      ref: "order",
    },
    replaceOrderId: {
      type: mongoose.Schema.ObjectId,

      ref: "order",
    },

    newProductId: {
      type: mongoose.Schema.ObjectId,
      ref: "product",
    },
  },
  {
    versionKey: false,
  },
  { timestamps: true }
);
replacementSchema.plugin(AutoIncrement, {
  id: "replacementIdCounter",
  inc_field: "replacementId",
});

module.exports = mongoose.model("replacement", replacementSchema);
