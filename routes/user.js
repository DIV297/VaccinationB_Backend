const express = require('express');

const User = require("../models/User")
const VCSchema = require("../models/VaccinationCenter");
const router = express.Router();
const JWT_SECRET = 'DivanshSignature'
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {body,validationResult, check} = require('express-validator');
const fetchuser = require("../middleware/fetchuser");
const Slots = require('../models/Slots');

//signup
router.post('/adduser',[
    body('name','Enter a valid name').isLength({min:3}),
    body('age', 'Enter valid age').isLength({ min: 1 }),
    body('mobileno', 'Moblile number should have 10 digits').isLength({ min: 10 }),
    body('city', 'city should have at least 2 characters').isLength({ min: 2}),
    body('state', 'state should have at least 2 characters').isLength({ min: 2}),
    body('password', 'Password should have atleast 3 characters').isLength({ min: 3 }),
    body('email','Enter valid email').isEmail()
    
],async (req,res)=>{
    let answer = 0;
    let success  = false;
    console.log(req.body);
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        answer=1;
        return res.status(400).json({answer,success,errors:errors.array()});
    }
    try{
    let user = await User.findOne({email:req.body.email});
    let userwithmob = await User.findOne({mobileno:req.body.mobileno});
    if(user){
        answer = 2;
        return res.status(400).json({answer,success,error:"sorry user with this email exits"})
    }
    if(userwithmob){
        answer = 3;
        return res.status(400).json({answer,success,error:"sorry user with this mobile no exits"})
    }
    console.log(req.body);
    const salt = bcrypt.genSaltSync(10);
    const securedPassword = bcrypt.hashSync(req.body.password, salt);
    console.log(req.body);
    user = await User.create({
        name:req.body.name,
        age:req.body.age,
        mobileno : req.body.mobileno ,
        city:req.body.city,
        state:req.body.state,
        email:req.body.email,
        password:securedPassword}
    )
    const data ={
        user:{
            id:user.id
        }
    } 
    var token = jwt.sign(data, JWT_SECRET);
    success = true;
    res.send({answer,success,token});
    }
    catch(err){
        return res.status(500).json({error:err})
    }
}) 

//login
router.post("/loginuser", [
    body('password', 'Password should have atleast 3 characters').isLength({ min: 3 }),
    body('email', 'Enter valid email').isEmail()
], async (request, response) => {
    let success = false;
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(400).json({success,error: errors.array() })
    }
    const { email, password } = request.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return response.status(400).json({success, error: "Please login with correct crudentials" })
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return response.status(400).json({success, error: "Please login with correct crudentials" })
        }
        const data = {
            user: {
                id: user.id
            }
        }
        var token = jwt.sign(data, JWT_SECRET);
        success = true;
        console.log(success);
        console.log(token);
        response.send({success, token });
    } catch (error) {
        response.status(500).send(error); 
    } 
});

// fetchuser
router.post('/getuser', fetchuser, async (request, response) => {
    try {
        userId = request.user.id;
        const user = await User.findById(userId).select("-password")
        response.send(user)
    } catch (error) {
        console.error(error.message);
        response.status(401).send('Internal Server Error');
    }
})
//display all vaccination centers
router.post('/displaycenter',async (request,response)=>{
    try{
    let center = await VCSchema.find({dosage:{$gte:1}});
    console.log(center);
    response.send(center);
    }
    catch(error){
        response.status(500).json(error);
    }
})

router.post('/displaybookedslot',fetchuser,async (request,response)=>{
    try{
        
    let bookedslot = await Slots.find({user: request.user.id});
    if(bookedslot)
    response.send(bookedslot);
    }
    catch(error){
        response.status(500).json(error);
    }
})



//apply for slot
router.put('/applyforslot/:id/:value',fetchuser,async (req,res)=>{
    try {
        console.log("divansh");
        let str = (req.params.value)
        console.log(str);
        console.log(typeof str);
        let success = false;
        let slotbooked = await Slots.find({user:req.user.id});
        // console.log(slotbooked); 
    let slotavailabe = await VCSchema.findById(req.params.id);
    if(slotbooked.length===0){
          let sl = await Slots.create(
            {
            name:slotavailabe.name,
              place:slotavailabe.place,
              slotdate:str,
              user:req.user.id
            }
        )
        success = true;
        await VCSchema.findByIdAndDelete(req.params.id);
        let dosageAfterbooking = slotavailabe.dosage - 1;
        await VCSchema.create(
            {
                name:slotavailabe.name,
                place:slotavailabe.place,
                dosage:dosageAfterbooking
            }
        )
        res.json({success,slots:sl});
    }
    else{
        return res.status(400).json({success})
    }
    
    } catch(error){
        console.error(error.message);
        res.status(500).send('Internal Server Error');
      }
    
})
router.delete('/deleteaccount',fetchuser,async(req,res)=>{
    try {
        let deleteuser = await User.findByIdAndDelete(req.user.id);
        res.json({msg:"Account deleted"});
    } catch (error) {
        res.status(500).send(error);
    }
})
router.delete('/deletebookedslots/:id',async (req,res)=>{
    try{
    let deletedslot = await Slots.findByIdAndDelete(req.params.id);
    console.log(deletedslot)
    console.log("deleted");
    let checkslot = await VCSchema.find({name:deletedslot.name});
    await VCSchema.deleteOne({
        name:deletedslot.name,
        place:deletedslot.place
    });
    var dosageafterdel = checkslot[0].dosage + 1;
    await VCSchema.create({
        name:checkslot[0].name,
        place:checkslot[0].place,
        dosage:dosageafterdel
    })
    res.json({centers:deletedslot});
    }
    catch(err){
        res.status(500).json(err);
    }
})
module.exports = router;