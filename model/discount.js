const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose)

const discountSchema = mongoose.Schema({
    _id:{
        type:Number,
    },
    minDiscount:{
        type:Number,
    },
    maxDiscount:{
        type:Number
    },
    createdBy:{
        type:Number,
        ref:"User"
    }

},
{
   versionKey:false,
   timestamps: true
  });

discountSchema.plugin(AutoIncrement, { id: 'discountId', inc_field: '_id' });

module.exports=mongoose.model("discount",discountSchema);