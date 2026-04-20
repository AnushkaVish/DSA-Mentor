const redisClient = require("../config/redis");
const User =  require("../models/user")
const validate = require('../utils/validator');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const Submission = require("../models/submission")


const isProduction = process.env.NODE_ENV === 'production';

const cookieOptions = {
    maxAge: 60 * 60 * 1000,
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax'
};

const register = async (req,res)=>{
    
    try{
        console.log("Registering user:", req.body.emailId);
        // validate the data;
      validate(req.body); 
      const {firstName, emailId, password}  = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ emailId: emailId.toLowerCase() });
      if (existingUser) {
          return res.status(400).json({ message: "User already exists with this email" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = await User.create({
          firstName,
          emailId: emailId.toLowerCase(),
          password: hashedPassword,
          role: 'user'
      });

     const token =  jwt.sign({_id:user._id , emailId:user.emailId, role:'user'},process.env.JWT_KEY,{expiresIn: 60*60});
     const reply = {
        firstName: user.firstName,
        emailId: user.emailId,
        _id: user._id,
        role:user.role,
    }
    
     res.cookie('token', token, cookieOptions);
     res.status(201).json({
        user:reply,
        message:"Registered and Logged in Successfully"
    })
    }
    catch(err){
        console.error("Registration Error:", err.message);
        res.status(400).json({ message: err.message || "Registration failed" });
    }
}


const login = async (req,res)=>{

    try{
        const {emailId, password} = req.body;
        console.log(`[LOGIN] Attempt for: ${emailId}`);

        if(!emailId || !password) {
            console.log("[LOGIN] FAILED: Missing email or password");
            throw new Error("Email and password are required");
        }

        // Use lowercase email for matching since registration stores as lowercase
        const normalizedEmail = emailId.toLowerCase();
        const user = await User.findOne({emailId: normalizedEmail});
        
        if(!user) {
            console.log(`[LOGIN] FAILED: User not found for email: ${normalizedEmail}`);
            throw new Error("Invalid Credentials");
        }

        const match = await bcrypt.compare(password, user.password);

        if(!match) {
            console.log(`[LOGIN] FAILED: Password mismatch for email: ${normalizedEmail}`);
            throw new Error("Invalid Credentials");
        }

        console.log(`[LOGIN] SUCCESS: User ${user._id} logged in`);
        
        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role: user.role,
        }

        if (!process.env.JWT_KEY) {
            console.error("[LOGIN] ERROR: JWT_KEY is not defined in environment!");
            throw new Error("Internal Server Error: Auth configuration missing");
        }

        const token = jwt.sign(
            { _id: user._id, emailId: user.emailId, role: user.role },
            process.env.JWT_KEY,
            { expiresIn: '1h' }
        );
        
        console.log("[LOGIN] Setting cookie with options:", JSON.stringify(cookieOptions));
        res.cookie('token', token, cookieOptions);
        
        return res.status(200).json({
            user: reply,
            message: "Login Successfully"
        });
    }
    catch(err){
        console.error("[LOGIN] ERROR:", err.message);
        return res.status(401).json({ message: err.message });
    }
}


// logOut feature

const logout = async(req,res)=>{

    try{
        const {token} = req.cookies;
        if (token) {
            const payload = jwt.decode(token);
            if (payload && payload.exp) {
                await redisClient.set(`token:${token}`,'Blocked');
                await redisClient.expireAt(`token:${token}`,payload.exp);
            }
        }

        res.cookie("token", null, { ...cookieOptions, maxAge: 0 });
        res.send("Logged Out Succesfully");
    }
    catch(err){
       res.status(503).send("Error: "+err);
    }
}


const adminRegister = async(req,res)=>{
    try{
        // validate the data;
      validate(req.body); 
      const {firstName, emailId, password}  = req.body;

      // Check if admin already exists
      const existingUser = await User.findOne({ emailId: emailId.toLowerCase() });
      if (existingUser) {
          return res.status(400).json({ message: "Admin/User already exists with this email" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = await User.create({
          firstName,
          emailId: emailId.toLowerCase(),
          password: hashedPassword,
          role: 'admin' // FORCE role to admin
      });

     const token =  jwt.sign({_id:user._id , emailId:user.emailId, role:user.role},process.env.JWT_KEY,{expiresIn: 60*60});
     res.cookie('token', token, cookieOptions);
     res.status(201).json({
         message: "Admin Registered Successfully",
         user: {
             firstName: user.firstName,
             emailId: user.emailId,
             role: user.role
         }
     });
    }
    catch(err){
        console.error("Admin Registration Error:", err.message);
        res.status(400).json({ message: err.message || "Admin registration failed" });
    }
}

const deleteProfile = async(req,res)=>{
  
    try{
       const userId = req.result._id;
      
    // userSchema delete
    await User.findByIdAndDelete(userId);

    // Submission se bhi delete karo...
    
    // await Submission.deleteMany({userId});
    
    res.status(200).send("Deleted Successfully");

    }
    catch(err){
      
        res.status(500).send("Internal Server Error");
    }
}

const getProfile = async (req, res) => {
  try {
    const userId = req.result._id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).send("User Not Found");
    }

    res.status(200).json({
      user: user,
      message: "Profile fetched successfully"
    });

  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
};


module.exports = {register, login,logout,adminRegister,deleteProfile,getProfile};