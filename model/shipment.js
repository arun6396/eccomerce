const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const shipmentSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    postalCode: {
      type: String,
    },
    country: {
      type: String,
    },
    mobileNumber: {
      type: Number,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

shipmentSchema.plugin(AutoIncrement, {
  id: "shipmentIdCounter",
  inc_field: "shipmentId",
});
module.exports = mongoose.model("shipment", shipmentSchema);
