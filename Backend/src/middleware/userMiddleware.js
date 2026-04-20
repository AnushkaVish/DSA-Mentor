const jwt = require("jsonwebtoken");
const User = require("../models/user");
const redisClient = require("../config/redis")

const userMiddleware = async (req,res,next)=>{

    try{
        
        const {token} = req.cookies;
        if(!token)
            throw new Error("Token is not present");

        const payload = jwt.verify(token,process.env.JWT_KEY);

        const {_id} = payload;

        if(!_id){
            throw new Error("Invalid token payload");
        }

        const result = await User.findById(_id);

        if (!result) {
            throw new Error("User Doesn't Exist");
        }

        // Redis Check - Safe & Non-Blocking
        try {
            if (redisClient.isOpen) {
                const IsBlocked = await redisClient.exists(`token:${token}`);
                if (IsBlocked) throw new Error("Token is blacklisted");
            }
        } catch (redisErr) {
            console.error("Redis Error in Middleware:", redisErr.message);
        }

        req.result = result;
        req.user = result; 

        next();
    }
    catch(err){
        // Don't log if token is just missing (it's normal for unauthenticated users)
        if (err.message !== "Token is not present") {
            console.error("User Auth Error:", err.message);
        }
        res.status(401).json({ message: "Unauthorized", error: err.message });
    }

}


module.exports = userMiddleware;
