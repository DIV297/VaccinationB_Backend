const mongoose = require('mongoose')
const connectToMongo=()=>{
try{
mongoose.connect("mongodb+srv://divbajaj297:Divanshbajaj297$@cluster0.nhxzsge.mongodb.net/vaccination");
// mongoose.connect("mongodb://localhost:27017")
// mongoose.connect("mongodb://localhost:27017/vaccination");
console.log("connected to db");

}catch(error){
    console.log("Network error")
}
}
connectToMongo()
module.exports = connectToMongo;
