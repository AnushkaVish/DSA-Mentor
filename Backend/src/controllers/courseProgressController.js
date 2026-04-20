const CourseProgress = require('../models/courseProgress');

const getProgress = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.result._id;

        let progress = await CourseProgress.findOne({ user: userId, courseId });
        
        if (!progress) {
            // Return empty progress if none exists yet
            return res.status(200).json({ completedLectures: {} });
        }

        res.status(200).json(progress);
    } catch (err) {
        console.error("Error fetching progress:", err);
        res.status(500).json({ message: "Error fetching progress", error: err.message });
    }
};

const updateProgress = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { completedLectures } = req.body;
        const userId = req.result._id;

        const progress = await CourseProgress.findOneAndUpdate(
            { user: userId, courseId },
            { completedLectures },
            { upsert: true, new: true }
        );

        res.status(200).json(progress);
    } catch (err) {
        console.error("Error updating progress:", err);
        res.status(500).json({ message: "Error updating progress", error: err.message });
    }
};

module.exports = {
    getProgress,
    updateProgress
};
