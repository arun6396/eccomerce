const mongoose = require("mongoose");

const shipmentSchema = mongoose.Schema({
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
});

module.exports=mongoose.model("shipment",shipmentSchema);