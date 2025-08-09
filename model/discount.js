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
{timestamps:true});


module.exports=mongoose.model("discount",discountSchema);