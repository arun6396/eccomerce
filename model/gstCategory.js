const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const gstCategorySchema = mongoose.Schema(
  {
    _id: {
      type: Number,
    },
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

gstCategorySchema.plugin(AutoIncrement,{id:'gstCategoryId',$inc_field:'_id'});

module.exports = mongoose.model("gstCategory", gstCategorySchema);
