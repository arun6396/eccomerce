const mongoose = require("mongoose");
const users = require("./users");

const customerSchema = mongoose.Schema({
  customerName: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
  },
  password:{
    type:String,
    required:true,
  },
  DOB: {
    type: String,
  },
  createdBy:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"users"
  },
},
{
  versionKey:false,
  timestamps: true
}
);

module.exports = mongoose.model("Customer",customerSchema);