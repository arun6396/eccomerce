const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
    },
    description: {
      type: String,
    },
    status: {
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

categorySchema.plugin(AutoIncrement, {
  id: "categoryIdCounter",
  inc_field: "categoryId",
});
module.exports = mongoose.model("category", categorySchema);
