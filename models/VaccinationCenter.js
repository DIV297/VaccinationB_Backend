const mongoose = require('mongoose');
const VCSchema = mongoose.Schema(
    {
        name:{
            type:String,
            required:true
        },
        place:{
            type:String,
            required:true,
            unique:true
        },
        dosage:{
            type:Number,
            required:true
        }
    }
)
module.exports = mongoose.model('vaccinationcenter',VCSchema);