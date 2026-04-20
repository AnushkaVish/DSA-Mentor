const jwt = require("jsonwebtoken");
const User = require("../models/user");
const redisClient = require("../config/redis")

const adminMiddleware = async (req,res,next)=>{

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

        if(!result){
            throw new Error("User Doesn't Exist");
        }

        // Check role (case-insensitive and support Role/role)
        const userRole = (payload.role || payload.Role || result.role || "").toLowerCase();
        if(userRole !== 'admin')
            throw new Error("Access Denied: Admin role required");

        // Redis Check - Safe & Non-Blocking
        try {
            if (redisClient.isOpen) {
                const IsBlocked = await redisClient.exists(`token:${token}`);
                if (IsBlocked) throw new Error("Token is blacklisted");
            }
        } catch (redisErr) {
            console.error("Redis Error in Admin Middleware:", redisErr.message);
        }

        req.result = result;
        req.user = result; 

        next();
    }
    catch(err){
        // Only log if it's an actual error (like invalid token), not just missing token
        if (err.message !== "Token is not present") {
            console.error("Admin Auth Error:", err.message);
        }
        res.status(401).json({ message: "Unauthorized", error: err.message });
    }

}


module.exports = adminMiddleware;
