const mongoose = require('mongoose');
require('dotenv').config();

async function main() {
    try {
        console.log("Connecting...");

        await mongoose.connect(process.env.DB_CONNECT_STRING);

        console.log("MongoDB Connected ✅");
    } catch (err) {
        console.log("MongoDB Error ❌", err.message);
        process.exit(1); // important
    }
}

module.exports = main;