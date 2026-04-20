const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
    certId: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    courseName: {
        type: String,
        required: true
    },
    issueDate: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Certificate', certificateSchema);
