const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const replacementSchema = mongoose.Schema({
_id:{
    type:Number
},
previousOrderId:{
type:Number,
ref:'order'
},
replaceOrderId : {
    type:Number,
    ref:'order'
},

newProductId:{
    type:Number,
    ref:'product'
},
},
{
    versionKey:false,
},
{timestamps:true}
)
replacementSchema.plugin(AutoIncrement,{id:'replacementId',$inc_field:'_id'});

module.exports = mongoose.model("replacement",replacementSchema);