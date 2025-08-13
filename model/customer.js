const mongoose = require("mongoose");
const users = require("./users");
const AutoIncrement = require('mongoose-sequence')(mongoose)

const customerSchema = mongoose.Schema({
  _id:{
    type:Number
  },
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
    type:Number,
    ref:"users"
  },
},
{
  versionKey:false,
  timestamps: true
}
);
customerSchema.plugin(AutoIncrement,{id:'customerId',$inc_field:'_id'})

module.exports = mongoose.model("Customer",customerSchema);