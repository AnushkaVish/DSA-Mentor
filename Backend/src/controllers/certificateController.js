const Certificate = require('../models/certificate');

// Issue a new certificate
const issueCertificate = async (req, res) => {
    try {
        const { courseName } = req.body;
        const userId = req.result._id;
        
        // Fetch user info from DB to ensure correct name
        const User = require('../models/user');
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const userName = `${user.firstName} ${user.lastName || ''}`.trim();

        console.log(`Issuing certificate for user: ${userName}, course: ${courseName}`);

        // Check if certificate already exists for this user and course
        const existingCert = await Certificate.findOne({ user: userId, courseName });
        if (existingCert) {
            console.log(`Certificate already exists for user ${userId} and course ${courseName}.`);
            return res.status(200).json(existingCert);
        }

        // Generate a unique certId if not already exists
        const certId = 'DM-' + Math.floor(100000 + Math.random() * 900000);

        const newCert = await Certificate.create({
            certId,
            user: userId,
            userName,
            courseName
        });
        
        console.log(`Successfully issued certificate: ${certId}`);
        res.status(201).json(newCert);
    } catch (err) {
        console.error("Error issuing certificate:", err);
        res.status(500).json({ message: "Error issuing certificate", error: err.message });
    }
};

// Verify a certificate by ID
const verifyCertificate = async (req, res) => {
    try {
        const { certId } = req.params;
        console.log(`Verifying certificate: ${certId}`);
        
        // Search case-insensitive just in case
        const cert = await Certificate.findOne({ 
            certId: { $regex: new RegExp(`^${certId}$`, "i") } 
        }).populate('user', 'firstName lastName emailId');

        if (!cert) {
            console.log(`Certificate ${certId} not found.`);
            return res.status(404).json({ message: "Certificate not found or invalid ID" });
        }

        console.log(`Certificate ${certId} verified successfully.`);
        res.status(200).json(cert);
    } catch (err) {
        console.error("Error verifying certificate:", err);
        res.status(500).json({ message: "Error verifying certificate", error: err.message });
    }
};

module.exports = {
    issueCertificate,
    verifyCertificate
};
