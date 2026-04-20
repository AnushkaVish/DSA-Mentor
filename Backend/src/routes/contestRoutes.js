const express = require("express");
const router = express.Router();
const contestController = require("../controllers/contestController");
const adminMiddleware = require("../middleware/adminMiddleware");
const userMiddleware = require("../middleware/userMiddleware");

// Admin routes
router.post("/create", adminMiddleware, contestController.createContest);
router.put("/update/:id", adminMiddleware, contestController.updateContest);
router.delete("/delete/:id", adminMiddleware, contestController.deleteContest);

// Public/User routes
router.get("/getAllContests", contestController.getAllContests);
router.get("/:id", contestController.getContestById);
router.post("/register/:id", userMiddleware, contestController.registerForContest);
router.post("/submit-mcq", userMiddleware, contestController.submitMcq);

module.exports = router;
