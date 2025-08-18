const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const gstCategorySchema = mongoose.Schema(
  {
    gstCategoryName: {
      type: String,
    },
    description: {
      type: String,
    },
    percentage: {
      type: Number,
    },
  },
  { versionKey: false, timestamps: true }
);

gstCategorySchema.plugin(AutoIncrement, {
  id: "gstCategoryIdCounter",
  inc_field: "gstCategoryId",
});

module.exports = mongoose.model("gstCategory", gstCategorySchema);
