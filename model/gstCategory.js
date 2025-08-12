const mongoose = require('mongoose');

const gstCategorySchema = mongoose.Schema({

gstCategoryName :{
    type : String
},
description : {
    type: String
},
percentage:{
    type:Number
},

},
{versionKey:false,
    timestamps: true
}

);

module.exports = mongoose.model("gstCategory",gstCategorySchema);