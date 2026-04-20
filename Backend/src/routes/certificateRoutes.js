const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const userMiddleware = require('../middleware/userMiddleware');

// Public route for verification
router.get('/verify/:certId', certificateController.verifyCertificate);

// Protected route to issue certificate
router.post('/issue', userMiddleware, certificateController.issueCertificate);

module.exports = router;
