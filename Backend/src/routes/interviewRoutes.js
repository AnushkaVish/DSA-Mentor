// routes/interview.js - AI Interview Routes
const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const userMiddleware = require("../middleware/userMiddleware");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// Initialize Gemini AI
let genAI = null;
const geminiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_KEY;
if (geminiKey && geminiKey.length > 0) {
  genAI = new GoogleGenerativeAI(geminiKey);
  console.log("AI Interview: Gemini AI initialized");
} else {
  console.log("AI Interview: GEMINI_API_KEY or GEMINI_KEY not found - using fallback questions");
}

// Configure multer for recordings
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/interviews";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${req.result._id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/") || file.mimetype.startsWith("audio/")) {
      cb(null, true);
    } else {
      cb(new Error("Only video and audio files allowed"));
    }
  },
});

// AI Generation configs
const FAST_CONFIG = {
  temperature: 0.7,
  topK: 20,
  topP: 0.8,
  maxOutputTokens: 512,
  candidateCount: 1
};

const ULTRA_FAST_CONFIG = {
  temperature: 0.3,
  topK: 10,
  topP: 0.7,
  maxOutputTokens: 256,
  candidateCount: 1
};

// Timeout wrapper for AI calls
const callAIWithTimeout = async (modelCall, timeoutMs = 30000) => {
  return Promise.race([
    modelCall,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('AI_TIMEOUT')), timeoutMs)
    )
  ]);
};

// In-memory session storage (replace with Redis in production)
const interviewSessions = new Map();

// Question pools for different roles
const questionPools = {
  "Frontend Developer": {
    easy: [
      "What is the difference between let, const, and var in JavaScript?",
      "Explain the CSS box model and its components.",
      "What are semantic HTML elements and why are they important?",
      "How do you make a website responsive?",
      "What is the DOM and how do you manipulate it?"
    ],
    medium: [
      "Explain React hooks and give examples of useState and useEffect.",
      "What is the virtual DOM and how does it improve performance?",
      "How would you optimize a React application for better performance?",
      "Explain the difference between server-side and client-side rendering.",
      "What are CSS preprocessors and what are their benefits?"
    ],
    hard: [
      "How would you implement a state management solution for a large React app?",
      "Explain webpack and how you would configure it for a production build.",
      "How would you implement lazy loading and code splitting in React?",
      "Design a system for handling real-time updates in a frontend application.",
      "Explain micro-frontends architecture and its trade-offs."
    ]
  },
  "Backend Developer": {
    easy: [
      "What is REST API and what are HTTP methods?",
      "Explain the difference between SQL and NoSQL databases.",
      "What is middleware in Express.js?",
      "How do you handle errors in Node.js applications?",
      "What is the purpose of environment variables?"
    ],
    medium: [
      "How would you implement authentication and authorization in an API?",
      "Explain database indexing and when to use it.",
      "What are the principles of microservices architecture?",
      "How do you handle concurrency in backend applications?",
      "Explain caching strategies and when to use them."
    ],
    hard: [
      "Design a system to handle millions of concurrent users.",
      "How would you implement distributed transactions?",
      "Explain event-driven architecture and its benefits.",
      "How would you design a rate limiting system?",
      "Explain database sharding strategies and trade-offs."
    ]
  },
  "Full Stack Developer": {
    easy: [
      "Explain the difference between frontend and backend development.",
      "What is CORS and why is it important?",
      "How do you connect a frontend application to a backend API?",
      "What is JSON and how is it used in web development?",
      "Explain the MVC architecture pattern."
    ],
    medium: [
      "How would you design a user authentication system?",
      "Explain the differences between session-based and token-based authentication.",
      "How do you handle file uploads in a full-stack application?",
      "What are WebSockets and when would you use them?",
      "How do you implement real-time features in web applications?"
    ],
    hard: [
      "Design a scalable architecture for a social media platform.",
      "How would you implement a real-time chat application?",
      "Explain how you would handle deployment and CI/CD for a full-stack app.",
      "How would you optimize both frontend and backend performance?",
      "Design a system for handling user-generated content at scale."
    ]
  },
  "Data Scientist": {
    easy: [
      "What is the difference between supervised and unsupervised learning?",
      "Explain what pandas library is used for in Python.",
      "What is the purpose of data visualization?",
      "What are the basic steps in a data science project?",
      "Explain what a dataset is and types of data."
    ],
    medium: [
      "How do you handle missing data in a dataset?",
      "Explain cross-validation and why it's important.",
      "What is feature engineering and why is it crucial?",
      "How do you evaluate the performance of a machine learning model?",
      "Explain the bias-variance tradeoff."
    ],
    hard: [
      "How would you design an A/B testing framework?",
      "Explain how you would build a recommendation system at scale.",
      "How do you handle class imbalance in machine learning?",
      "Design a real-time machine learning pipeline.",
      "Explain different techniques for dimensionality reduction."
    ]
  },
  "DevOps Engineer": {
    easy: [
      "What is DevOps and why is it important?",
      "Explain the difference between CI and CD.",
      "What is containerization and why use Docker?",
      "What is version control and why use Git?",
      "Explain what cloud computing is."
    ],
    medium: [
      "How would you implement a CI/CD pipeline?",
      "Explain Infrastructure as Code (IaC) and its benefits.",
      "What is container orchestration and how does Kubernetes work?",
      "How do you implement monitoring and logging in production?",
      "Explain different deployment strategies (blue-green, canary, etc.)."
    ],
    hard: [
      "Design a highly available and scalable infrastructure for a web application.",
      "How would you implement disaster recovery and backup strategies?",
      "Explain how you would handle security in a DevOps pipeline.",
      "Design a monitoring and alerting system for microservices.",
      "How would you implement compliance and governance in cloud infrastructure?"
    ]
  }
};

// Helper function to get question from pool
const getQuestionFromPool = (role, difficulty, usedQuestions = []) => {
  const roleQuestions = questionPools[role] || questionPools["Full Stack Developer"];
  const questions = roleQuestions[difficulty] || roleQuestions["medium"];
  const availableQuestions = questions.filter(q => !usedQuestions.includes(q));
  
  if (availableQuestions.length === 0) {
    return questions[Math.floor(Math.random() * questions.length)];
  }
  
  return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
};

// START INTERVIEW
router.post("/start", userMiddleware, async (req, res) => {
  console.log("Starting AI interview for user:", req.result.email || req.result.name);
  const startTime = Date.now();
  
  try {
    const { role, experience } = req.body;
    if (!role || !experience) {
      return res.status(400).json({ message: "Role and experience are required" });
    }

    let questionData;

    // Try AI generation first
    if (genAI) {
      const prompt = `Generate a technical interview question for ${role} with ${experience} years experience.

Requirements:
- One clear, specific question
- Appropriate difficulty level
- Be conversational

Respond in JSON:
{
  "question": "Your question",
  "expectedTopics": ["topic1", "topic2"],
  "difficulty": "easy|medium|hard"
}`;

      try {
        const model = genAI.getGenerativeModel({ 
          model: "gemini-1.5-flash",
          generationConfig: FAST_CONFIG
        });
        
        const result = await callAIWithTimeout(
          model.generateContent({ contents: [{ parts: [{ text: prompt }] }] }),
          30000
        );
        
        const response = await result.response;
        const responseText = response.text();
        
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          questionData = JSON.parse(jsonMatch[0]);
          console.log(`AI question generated in ${Date.now() - startTime}ms`);
        } else {
          throw new Error("No valid JSON response");
        }
      } catch (aiError) {
        console.log("AI generation failed, using fallback:", aiError.message);
        questionData = null;
      }
    }

    // Fallback to question pool
    if (!questionData) {
      const difficulty = parseInt(experience) <= 2 ? "easy" : parseInt(experience) <= 6 ? "medium" : "hard";
      questionData = {
        question: getQuestionFromPool(role, difficulty),
        expectedTopics: ["technical knowledge", "problem solving", "experience"],
        difficulty: difficulty,
      };
    }

    const sessionId = `${req.result._id}-${Date.now()}`;
    const sessionData = {
      sessionId,
      userId: req.result._id,
      role,
      experience,
      currentQuestion: 1,
      questions: [questionData],
      answers: [],
      scores: [],
      startTime: new Date(),
      videoOnTime: 0,
      totalTime: 0,
      status: "active",
    };

    interviewSessions.set(sessionId, sessionData);
    console.log(`Interview session created in ${Date.now() - startTime}ms`);

    res.json({
      sessionId,
      question: questionData.question,
      questionNumber: 1,
      expectedTopics: questionData.expectedTopics,
      difficulty: questionData.difficulty,
    });
    
  } catch (error) {
    console.error("Interview start error:", error);
    res.status(500).json({
      message: "Failed to start interview. Please try again.",
      error: error.message,
    });
  }
});

// SUBMIT ANSWER
router.post("/answer", userMiddleware, async (req, res) => {
  console.log("Processing answer for session:", req.body.sessionId?.substring(0, 20));
  const startTime = Date.now();
  
  try {
    const { sessionId, answer, questionNumber } = req.body;

    const session = interviewSessions.get(sessionId);
    if (!session || session.userId.toString() !== req.result._id.toString()) {
      return res.status(404).json({ message: "Session not found" });
    }

    const currentQuestion = session.questions[questionNumber - 1];
    if (!currentQuestion) {
      return res.status(400).json({ message: "Invalid question number" });
    }

    let evaluation;

    // Try AI evaluation
    if (genAI) {
      const evaluationPrompt = `Evaluate this ${session.role} interview answer:

QUESTION: ${currentQuestion.question}
ANSWER: ${answer}
ROLE: ${session.role}
EXPERIENCE: ${session.experience} years

Respond in JSON only:
{
  "score": 1-10,
  "feedback": "Brief feedback (1-2 sentences)",
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "technicalAccuracy": 1-10,
  "communication": 1-10,
  "depth": 1-10
}`;

      try {
        const model = genAI.getGenerativeModel({ 
          model: "gemini-1.5-flash",
          generationConfig: ULTRA_FAST_CONFIG
        });
        
        const result = await callAIWithTimeout(
          model.generateContent({ contents: [{ parts: [{ text: evaluationPrompt }] }] }),
          30000
        );

        const response = await result.response;
        const evaluationText = response.text();
        
        const jsonMatch = evaluationText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          evaluation = JSON.parse(jsonMatch[0]);
          console.log(`AI evaluation completed in ${Date.now() - startTime}ms`);
        } else {
          throw new Error("No valid evaluation JSON");
        }
      } catch (aiError) {
        console.log("AI evaluation failed, using fallback:", aiError.message);
        evaluation = null;
      }
    }

    // Fallback evaluation
    if (!evaluation) {
      const baseScore = 6 + Math.floor(Math.random() * 3); // 6-8
      evaluation = {
        score: baseScore,
        feedback: `Good response showing understanding of ${session.role} concepts. Consider providing more specific examples.`,
        strengths: ["Clear explanation", "Relevant to the role"],
        improvements: ["Add more technical details", "Provide specific examples"],
        technicalAccuracy: Math.max(5, baseScore - 1),
        communication: Math.min(9, baseScore + 1),
        depth: baseScore,
      };
    }

    // Store answer and evaluation
    session.answers.push({
      questionNumber,
      question: currentQuestion.question,
      answer,
      evaluation,
      timestamp: new Date(),
    });
    session.scores.push(evaluation.score);

    let nextQuestion = null;
    const isComplete = questionNumber >= 10;

    if (!isComplete) {
      const avgScore = session.scores.reduce((sum, score) => sum + score, 0) / session.scores.length;
      const nextDifficulty = avgScore >= 7.5 ? "hard" : avgScore >= 6 ? "medium" : "easy";
      
      const usedQuestions = session.questions.map(q => q.question);
      const questionText = getQuestionFromPool(session.role, nextDifficulty, usedQuestions);

      nextQuestion = {
        question: questionText,
        expectedTopics: ["technical knowledge", "problem solving"],
        difficulty: nextDifficulty,
      };

      session.questions.push(nextQuestion);
      session.currentQuestion = questionNumber + 1;
    } else {
      session.status = "completed";
      session.endTime = new Date();
    }

    interviewSessions.set(sessionId, session);
    console.log(`Answer processed in ${Date.now() - startTime}ms`);

    res.json({
      sessionId,
      evaluation,
      nextQuestion: nextQuestion?.question,
      expectedTopics: nextQuestion?.expectedTopics,
      difficulty: nextQuestion?.difficulty,
      questionNumber: questionNumber + 1,
      isComplete,
    });
    
  } catch (error) {
    console.error("Answer processing error:", error);
    res.status(500).json({
      message: "Failed to process answer. Please try again.",
      error: error.message,
    });
  }
});

// GENERATE FINAL REPORT
router.post("/generate-report", userMiddleware, async (req, res) => {
  console.log("Generating final report for session:", req.body.sessionId?.substring(0, 20));
  
  try {
    const { sessionId } = req.body;

    const session = interviewSessions.get(sessionId);
    if (!session || session.userId.toString() !== req.result._id.toString()) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.status !== "completed") {
      return res.status(400).json({ message: "Interview not completed yet" });
    }

    const avgScore = session.scores.reduce((sum, score) => sum + score, 0) / session.scores.length;
    const overallScore = Math.round(avgScore * 10);
    
    const report = {
      overallScore,
      recommendation: overallScore >= 80 ? "hire" : overallScore >= 60 ? "consider" : "reject",
      summary: `Candidate demonstrated ${overallScore >= 70 ? 'strong' : overallScore >= 60 ? 'good' : 'basic'} technical knowledge and communication skills throughout the ${session.questions.length}-question interview.`,
      technicalSkills: { 
        score: Math.round(avgScore), 
        feedback: `${avgScore >= 7 ? 'Strong' : avgScore >= 6 ? 'Good' : 'Adequate'} technical foundation with room for growth.`
      },
      communication: { 
        score: Math.round(avgScore + 0.5), 
        feedback: "Clear communication style with good explanation of technical concepts."
      },
      problemSolving: {
        score: Math.round(avgScore - 0.5),
        feedback: "Demonstrated logical thinking and systematic problem-solving approach."
      },
      videoPresence: {
        score: session.videoOnTime > session.totalTime * 0.7 ? 8 : 6,
        feedback: session.videoOnTime > session.totalTime * 0.7 ? "Professional video presence" : "Consider maintaining video throughout"
      },
      strengths: [
        "Technical knowledge",
        "Communication clarity", 
        "Professional demeanor",
        ...(overallScore >= 70 ? ["Problem-solving approach"] : [])
      ],
      areasForImprovement: [
        "Technical depth in advanced concepts",
        "Specific examples from experience",
        ...(overallScore < 70 ? ["Confidence in explanations"] : ["Leadership experience"])
      ],
      detailedFeedback: `The candidate showed ${overallScore >= 70 ? 'excellent' : 'good'} preparation and understanding of ${session.role} concepts. ${overallScore >= 70 ? 'Strong recommendation for technical roles.' : 'Recommend additional technical training before senior positions.'}`
    };

    session.finalReport = report;
    session.reportGeneratedAt = new Date();
    interviewSessions.set(sessionId, session);

    console.log("Final report generated successfully");
    res.json(report);
    
  } catch (error) {
    console.error("Report generation error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// UPDATE TIMING
router.post("/update-timing", userMiddleware, async (req, res) => {
  try {
    const { sessionId, videoOnTime, totalTime } = req.body;

    const session = interviewSessions.get(sessionId);
    if (!session || session.userId.toString() !== req.result._id.toString()) {
      return res.status(404).json({ message: "Session not found" });
    }

    session.videoOnTime = videoOnTime;
    session.totalTime = totalTime;
    interviewSessions.set(sessionId, session);

    res.json({ message: "Timing updated successfully" });
  } catch (error) {
    console.error("Timing update error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// UPLOAD RECORDING
router.post("/upload-recording", userMiddleware, upload.single("recording"), async (req, res) => {
  try {
    const { sessionId, questionNumber, recordingType } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No recording file provided" });
    }

    const session = interviewSessions.get(sessionId);
    if (!session || session.userId.toString() !== req.result._id.toString()) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (!session.recordings) session.recordings = [];

    session.recordings.push({
      questionNumber: parseInt(questionNumber),
      recordingType,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      uploadedAt: new Date(),
    });

    interviewSessions.set(sessionId, session);
    console.log("Recording uploaded successfully:", req.file.filename);

    res.json({
      message: "Recording uploaded successfully",
      filename: req.file.filename,
      recordingId: session.recordings.length - 1,
    });
  } catch (error) {
    console.error("Recording upload error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET SESSION DETAILS
router.get("/session/:sessionId", userMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = interviewSessions.get(sessionId);
    if (!session || session.userId.toString() !== req.result._id.toString()) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.json(session);
  } catch (error) {
    console.error("Session fetch error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// CLEANUP OLD SESSIONS
router.post("/cleanup-sessions", userMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours

    let cleaned = 0;
    for (const [sessionId, session] of interviewSessions.entries()) {
      if (session.startTime < cutoff) {
        // Clean up files
        if (session.recordings) {
          session.recordings.forEach((recording) => {
            try {
              fs.unlinkSync(recording.path);
            } catch (error) {
              console.error("Error deleting file:", recording.path, error);
            }
          });
        }

        interviewSessions.delete(sessionId);
        cleaned++;
      }
    }

    res.json({ message: `Cleaned up ${cleaned} old sessions` });
  } catch (error) {
    console.error("Session cleanup error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;