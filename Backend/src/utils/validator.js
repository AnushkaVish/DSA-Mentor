const validator =require("validator");

// req.body 

const validate = (data)=>{
    console.log("Validating data:", { ...data, password: "[HIDDEN]" });
   
    const mandatoryField = ['firstName',"emailId",'password'];

    const IsAllowed = mandatoryField.every((k)=> Object.keys(data).includes(k));

    if(!IsAllowed)
        throw new Error("Some Field Missing");

    if(!validator.isEmail(data.emailId))
        throw new Error("Invalid Email Format");

    if (!data.password || data.password.length < 4) {
        throw new Error("Password bahut chota hai (min 4 chars required)");
    }
}

module.exports = validate;