const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);

const categorySchema = mongoose.Schema(
  {

    _id: { type: Number }, 
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
      type: Number,
      ref: "User",
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

categorySchema.plugin(AutoIncrement,{id:'categoryId',$inc_field : '_id'});
module.exports = mongoose.model("category", categorySchema);
