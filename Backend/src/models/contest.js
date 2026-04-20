const mongoose = require("mongoose");
const { Schema } = mongoose;

const contestSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    duration: { type: Number, required: true }, // duration in minutes
    
    // Coding Problems
    problems: [
      {
        problemId: {
          type: Schema.Types.ObjectId,
          ref: "problem",
          required: true,
        },
        points: { type: Number, default: 100 },
      },
    ],

    // MCQ/Theoretical Questions
    mcqs: [
      {
        question: { type: String, required: true },
        options: [{ type: String, required: true }], // 4 options
        correctOption: { type: Number, required: true }, // index 0-3
        points: { type: Number, default: 50 },
      }
    ],

    creator: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    
    participants: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "user",
        },
        score: {
          type: Number,
          default: 0,
        },
        solvedProblems: [
          {
            type: Schema.Types.ObjectId,
            ref: "problem",
          },
        ],
        solvedMcqs: [
          {
            mcqIndex: { type: Number },
            isCorrect: { type: Boolean },
            submittedAt: { type: Date }
          }
        ],
        submissionTime: {
          type: Date,
        },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contest", contestSchema);
