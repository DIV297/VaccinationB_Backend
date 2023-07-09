const jwt = require('jsonwebtoken');
const JWT_SECRET = 'DivanshSignature'
const fetchuser =(req, res, next)=>{
    // to convert auth token into user details
    const token = req.header('auth-token');
    console.log(token);
    if(!token){
        console.log("if")
        return res.status(401).send({error:"Please authenticate using adfs valid token"})
    }
    try{
        console.log("try")
        console.log(token);
        const data = jwt.verify(token, JWT_SECRET);
        req.user= data.user;
        next()
    }catch(error){
        console.log("catch")
       return res.status(401).send({error:"Please authenticate using a valid token"})
    }
}

module.exports = fetchuser;