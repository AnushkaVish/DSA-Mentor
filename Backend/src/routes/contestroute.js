const express = require("express");
const router = express.Router();
const Contest = require("../models/contest");

const adminMiddleware = require("../middleware/adminMiddleware");


// ─────────────────────────────────────────────
// ADMIN: Create a new contest
// POST /api/contests
// ─────────────────────────────────────────────
router.post("/", adminMiddleware,  async (req, res) => {
  try {
    const { title, description, questions, duration, startTime, endTime } =
      req.body;

    if (!questions || questions.length < 5) {
      return res
        .status(400)
        .json({ message: "Minimum 5 questions required" });
    }

    const contest = new Contest({
      title,
      description,
      questions,
      duration,
      startTime,
      endTime,
      createdBy: req.user.id,
    });

    await contest.save();
    res
      .status(201)
      .json({ message: "Contest created successfully", contest });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────
// ALL USERS: Get all active contests
// GET /api/contests
// ─────────────────────────────────────────────
router.get("/", adminMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const contests = await Contest.find({ isActive: true })
      .select("-questions.correctOption -submissions.answers") // hide answers
      .sort({ startTime: -1 });

    // Attach attempt status for current user
    const contestsWithStatus = contests.map((c) => {
      const obj = c.toJSON();
      const userSubmission = c.submissions.find(
        (s) => s.userId.toString() === req.user.id
      );
      obj.attempted = !!userSubmission;
      obj.userScore = userSubmission ? userSubmission.score : null;
      obj.userPercentage = userSubmission ? userSubmission.percentage : null;
      obj.status =
        now < new Date(c.startTime)
          ? "upcoming"
          : now > new Date(c.endTime)
          ? "ended"
          : "live";
      return obj;
    });

    res.json(contestsWithStatus);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────
// USER: Get single contest (with questions, no correct answers)
// GET /api/contests/:id
// ─────────────────────────────────────────────
router.get("/:id", adminMiddleware, async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest || !contest.isActive)
      return res.status(404).json({ message: "Contest not found" });

    const now = new Date();
    if (now < new Date(contest.startTime))
      return res.status(403).json({ message: "Contest has not started yet" });

    // Check if already attempted
    const alreadyAttempted = contest.submissions.some(
      (s) => s.userId.toString() === req.user.id
    );
    if (alreadyAttempted)
      return res
        .status(403)
        .json({ message: "Already attempted", attempted: true });

    // Send questions WITHOUT correctOption
    const safeContest = {
      _id: contest._id,
      title: contest.title,
      description: contest.description,
      duration: contest.duration,
      endTime: contest.endTime,
      totalQuestions: contest.questions.length,
      questions: contest.questions.map((q) => ({
        _id: q._id,
        questionText: q.questionText,
        options: q.options,
        marks: q.marks,
      })),
    };

    res.json(safeContest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────
// USER: Submit contest answers
// POST /api/contests/:id/submit
// ─────────────────────────────────────────────
router.post("/:id/submit", adminMiddleware, async (req, res) => {
  try {
    const { answers, timeTaken } = req.body; // answers: array of selected indices
    const contest = await Contest.findById(req.params.id);

    if (!contest || !contest.isActive)
      return res.status(404).json({ message: "Contest not found" });

    const now = new Date();
    if (now > new Date(contest.endTime))
      return res.status(400).json({ message: "Contest has ended" });

    // Check duplicate submission
    const alreadyAttempted = contest.submissions.some(
      (s) => s.userId.toString() === req.user.id
    );
    if (alreadyAttempted)
      return res.status(400).json({ message: "Already submitted" });

    // Calculate score
    let score = 0;
    const totalMarks = contest.questions.reduce((s, q) => s + q.marks, 0);

    contest.questions.forEach((q, i) => {
      if (answers[i] !== undefined && answers[i] === q.correctOption) {
        score += q.marks;
      }
    });

    const percentage = Math.round((score / totalMarks) * 100);

    contest.submissions.push({
      userId: req.user.id,
      answers,
      score,
      totalMarks,
      percentage,
      timeTaken: timeTaken || 0,
    });

    await contest.save();

    res.json({
      message: "Submitted successfully!",
      score,
      totalMarks,
      percentage,
      correctAnswers: contest.questions.map((q) => q.correctOption), // reveal after submit
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────
// ALL: Get Leaderboard for a contest
// GET /api/contests/:id/leaderboard
// ─────────────────────────────────────────────
router.get("/:id/leaderboard", adminMiddleware, async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id).populate(
      "submissions.userId",
      "username name avatar"
    );
    if (!contest) return res.status(404).json({ message: "Not found" });

    const leaderboard = contest.submissions
      .sort((a, b) => b.score - a.score || a.timeTaken - b.timeTaken)
      .map((s, i) => ({
        rank: i + 1,
        user: s.userId,
        score: s.score,
        totalMarks: s.totalMarks,
        percentage: s.percentage,
        timeTaken: s.timeTaken,
        submittedAt: s.submittedAt,
      }));

    res.json({ title: contest.title, leaderboard });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────
// ADMIN: Delete/Toggle contest
// DELETE /api/contests/:id
// ─────────────────────────────────────────────
router.delete("/:id", adminMiddleware, 
    adminMiddleware, async (req, res) => {
  try {
    await Contest.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: "Contest deactivated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;