const mongoose = require('mongoose');

const discountSchema = mongoose.Schema({
    minDiscount:{
        type:Number,
    },
    maxDiscount:{
        type:Number
    },
    createdBy:{
        type:mongoose.Schema.ObjectId,
        ref:"User"
    }

},
{
   versionKey:false,
   timestamps: true
  });


module.exports=mongoose.model("discount",discountSchema);