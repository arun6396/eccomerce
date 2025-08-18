const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const customerSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    mobileNumber: { type: Number, required: true },
    email: { type: String },
    password: { type: String, required: true },
    DOB: { type: String },

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

customerSchema.plugin(AutoIncrement, {
  id: "customerIdCounter",
  inc_field: "customerId",
});

module.exports = mongoose.model("Customer", customerSchema);
