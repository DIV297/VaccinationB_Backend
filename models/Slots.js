const mongoose = require('mongoose')

const Slots = mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
   name:{
        type:String,
        required:true
    },
    place:{
        type:String,
        required:true
    },
    slotdate:{
        type:String
    },
    date:{
        type:Date,
        default:Date.now
    }
});
module.exports=mongoose.model('slots',Slots)