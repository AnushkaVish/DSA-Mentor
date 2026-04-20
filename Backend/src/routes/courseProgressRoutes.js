const express = require('express');
const router = express.Router();
const courseProgressController = require('../controllers/courseProgressController');
const userMiddleware = require('../middleware/userMiddleware');

router.get('/:courseId', userMiddleware, courseProgressController.getProgress);
router.post('/:courseId', userMiddleware, courseProgressController.updateProgress);

module.exports = router;
