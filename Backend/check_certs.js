const mongoose = require('mongoose');
require('dotenv').config();
const Certificate = require('./src/models/certificate');

const checkCerts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/codemaster');
        console.log("Connected to DB");

        const certs = await Certificate.find({});
        console.log(`Found ${certs.length} certificates:`);
        certs.forEach(c => {
            console.log(`ID: ${c.certId}, User: ${c.userName}, Date: ${c.issueDate}`);
        });

        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
};

checkCerts();
