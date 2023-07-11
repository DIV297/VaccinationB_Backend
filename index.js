const connectToMongo = require("./db");
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json())
app.use('/auth/user',require("./routes/user"));
app.use('/auth/admin',require("./routes/admin"));
app.get('/',(req,res)=>{
    console.log("hi");
    res.send("welcome to Vaccination Booking app")
})
app.listen(5000);
connectToMongo