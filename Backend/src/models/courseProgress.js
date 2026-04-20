const mongoose = require('mongoose');
const { Schema } = mongoose;

const courseProgressSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    courseId: {
        type: String,
        required: true
    },
    completedLectures: {
        type: Map,
        of: Boolean,
        default: {}
    }
}, {
    timestamps: true
});

// Ensure a user has only one progress record per course
courseProgressSchema.index({ user: 1, courseId: 1 }, { unique: true });

const CourseProgress = mongoose.model('CourseProgress', courseProgressSchema);

module.exports = CourseProgress;
