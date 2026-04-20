// controllers/geminiController.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiController {
  constructor() {
    // Ensure API key is present
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set. AI functionalities may not work.');
      // You might want to throw an error or handle this more gracefully in a real application
      // For now, we'll proceed but operations will likely fail.
    }
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Interview sessions storage (use database in production)
    this.interviewSessions = new Map();
    
    // Technical question pool for fallback
    this.questionPool = [
      {
        category: 'arrays',
        difficulty: 'easy',
        question: 'Explain how you would find the maximum element in an array and what would be the time complexity?'
      },
      {
        category: 'strings',
        difficulty: 'easy', 
        question: 'How would you check if a string is a palindrome? Walk me through your approach.'
      },
      {
        category: 'linkedlist',
        difficulty: 'medium',
        question: 'Explain how you would reverse a linked list iteratively and what are the edge cases to consider?'
      },
      {
        category: 'trees',
        difficulty: 'medium',
        question: 'How would you implement binary tree traversal using both recursive and iterative approaches?'
      },
      {
        category: 'algorithms',
        difficulty: 'medium',
        question: 'Explain the difference between BFS and DFS algorithms and when you would use each one.'
      },
      {
        category: 'dynamic-programming',
        difficulty: 'hard',
        question: 'How would you approach solving the longest common subsequence problem using dynamic programming?'
      },
      {
        category: 'sorting',
        difficulty: 'medium',
        question: 'Compare merge sort and quick sort algorithms. When would you choose one over the other?'
      },
      {
        category: 'system-design',
        difficulty: 'hard',
        question: 'How would you design a simple URL shortener like bit.ly? What are the key components?'
      }
    ];
  }

  // Helper to safely get Gemini model, ensuring API key is available
  _getGeminiModel(modelName = "gemini-pro") {
    if (!this.genAI || !process.env.GEMINI_KEY) {
      console.warn("Gemini API key not configured. Using fallback or returning null.");
      return null; // Or throw an error depending on desired behavior
    }
    return this.genAI.getGenerativeModel({ model: modelName });
  }

  // Generate interview question using Gemini AI
  async generateQuestion(context = '', difficulty = 'medium') {
    const model = this._getGeminiModel();
    if (!model) {
      // Fallback if model could not be initialized
      const randomQuestion = this.questionPool[Math.floor(Math.random() * this.questionPool.length)];
      return randomQuestion.question;
    }

    try {
      const prompt = `You are a technical interviewer for a software engineering position. 
      ${context ? `Previous context: ${context}` : 'This is the start of the interview.'}
      
      Generate a single technical coding question that:
      1. Is appropriate for a ${difficulty} level software engineer interview
      2. Tests problem-solving skills and coding knowledge
      3. Can be answered in 2-3 minutes verbally
      4. Focuses on data structures, algorithms, or system design
      5. Is different from any previous questions in the context
      6. Is clear and specific
      
      Return only the question without any extra formatting, explanations, or bullet points.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const questionText = response.text().trim();
      
      // Clean up the response
      return questionText.replace(/^\*\*|\*\*$/g, '').replace(/^\d+\.\s*/, '').trim();
    } catch (error) {
      console.error('Error generating question with Gemini:', error);
      // Fallback to question pool
      const randomQuestion = this.questionPool[Math.floor(Math.random() * this.questionPool.length)];
      return randomQuestion.question;
    }
  }

  // Evaluate user answer using Gemini AI
  async evaluateAnswer(question, answer, conversationHistory = []) {
    const model = this._getGeminiModel();
    if (!model) {
      // Fallback if model could not be initialized
      return {
        feedback: "Thank you for your response. Let's continue with the next question.",
        followUp: null,
        rating: 3
      };
    }

    try {
      const historyText = conversationHistory.length > 0 
        ? `Previous conversation context: ${JSON.stringify(conversationHistory.slice(-4))}` 
        : '';

      const prompt = `You are a technical interviewer evaluating a candidate's response.

      Question asked: "${question}"
      Candidate's answer: "${answer}"
      ${historyText}

      Please provide:
      1. Brief constructive feedback (1-2 sentences)
      2. A follow-up question if the answer needs clarification, or null if complete
      3. A rating from 1-5 (where 5 is excellent)

      Be encouraging but honest about technical accuracy.
      Return your response as valid JSON only:
      {
        "feedback": "Your feedback here",
        "followUp": "Follow-up question or null",
        "rating": 3
      }`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text().trim();
      
      try {
        // Try to extract JSON from response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            feedback: parsed.feedback || "Thank you for your response.",
            followUp: parsed.followUp === "null" ? null : parsed.followUp,
            rating: parsed.rating || 3
          };
        }
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
      }
      
      // Fallback response
      return {
        feedback: "Good explanation! Let's move to the next question.",
        followUp: null,
        rating: 3
      };
    } catch (error) {
      console.error('Error evaluating answer with Gemini:', error);
      return {
        feedback: "Thank you for your response. Let's continue with the next question.",
        followUp: null,
        rating: 3
      };
    }
  }

  // Start interview session
  async startInterview(req, res) {
    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      const sessionData = {
        id: sessionId,
        startTime: new Date(),
        questions: [],
        answers: [],
        currentQuestionIndex: 0,
        totalRating: 0,
        questionCount: 0
      };

      this.interviewSessions.set(sessionId, sessionData);

      const firstQuestion = await this.generateQuestion('', 'easy');
      sessionData.questions.push({
        question: firstQuestion,
        timestamp: new Date()
      });
      
      res.json({
        success: true,
        sessionId,
        question: firstQuestion,
        message: 'Interview session started successfully'
      });
    } catch (error) {
      console.error('Error starting interview:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start interview session',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get next question
  async getNextQuestion(req, res) {
    try {
      const { previousMessages = [], sessionId = null, difficulty = 'medium' } = req.body;
      
      // Create context from previous messages
      const context = previousMessages.length > 0 
        ? previousMessages.slice(-6).map(msg => `${msg.type}: ${msg.content}`).join('\n')
        : '';
      
      const question = await this.generateQuestion(context, difficulty);
      
      // Update session if sessionId provided
      if (sessionId && this.interviewSessions.has(sessionId)) {
        const session = this.interviewSessions.get(sessionId);
        session.questions.push({
          question,
          timestamp: new Date()
        });
        session.currentQuestionIndex++;
      }
      
      res.json({
        success: true,
        question,
        questionNumber: previousMessages.filter(msg => msg.type === 'ai').length + 1,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error generating question:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate question',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Evaluate user response
  async evaluateResponse(req, res) {
    try {
      const { 
        question, 
        answer, 
        conversationHistory = [], 
        sessionId = null 
      } = req.body;
      
      if (!question || !answer) {
        return res.status(400).json({
          success: false,
          message: 'Question and answer are required'
        });
      }

      // Evaluate the answer using Gemini
      const evaluation = await this.evaluateAnswer(question, answer, conversationHistory);
      
      // Update session if sessionId provided
      if (sessionId && this.interviewSessions.has(sessionId)) {
        const session = this.interviewSessions.get(sessionId);
        session.answers.push({
          question,
          answer,
          evaluation,
          timestamp: new Date()
        });
        session.totalRating += evaluation.rating;
        session.questionCount++;
      }
      
      // Generate next question if no follow-up needed
      let nextQuestion = null;
      if (!evaluation.followUp) {
        const context = [...conversationHistory, 
          { type: 'ai', content: question },
          { type: 'user', content: answer },
          { type: 'ai', content: evaluation.feedback }
        ].map(msg => `${msg.type}: ${msg.content}`).join('\n');
        
        // Increase difficulty based on performance
        const difficulty = evaluation.rating >= 4 ? 'hard' : evaluation.rating >= 3 ? 'medium' : 'easy';
        nextQuestion = await this.generateQuestion(context, difficulty);
      }

      res.json({
        success: true,
        feedback: evaluation.feedback,
        followUpQuestion: evaluation.followUp,
        nextQuestion: nextQuestion,
        rating: evaluation.rating,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error evaluating response:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to evaluate response',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // End interview session
  async endInterview(req, res) {
    try {
      const { sessionId } = req.body;
      
      let sessionSummary = null;
      
      if (sessionId && this.interviewSessions.has(sessionId)) {
        const session = this.interviewSessions.get(sessionId);
        session.endTime = new Date();
        
        // Calculate session summary
        const averageRating = session.questionCount > 0 
          ? (session.totalRating / session.questionCount).toFixed(1)
          : 0;
        
        const duration = Math.round((session.endTime - session.startTime) / 1000 / 60); // minutes
        
        sessionSummary = {
          duration: `${duration} minutes`,
          questionsAnswered: session.questionCount,
          averageRating: parseFloat(averageRating),
          performance: averageRating >= 4 ? 'Excellent' : 
                      averageRating >= 3 ? 'Good' : 
                      averageRating >= 2 ? 'Fair' : 'Needs Improvement'
        };
        
        console.log(`Interview session ended: ${sessionId}`, sessionSummary);
        
        // Clean up session after 5 minutes
        setTimeout(() => {
          this.interviewSessions.delete(sessionId);
        }, 300000); // 5 minutes in milliseconds
      }

      res.json({
        success: true,
        message: 'Interview session ended successfully',
        summary: sessionSummary
      });
    } catch (error) {
      console.error('Error ending interview:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to end interview session',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get interview statistics
  getInterviewStats(req, res) {
    try {
      const totalSessions = this.interviewSessions.size;
      const activeSessions = Array.from(this.interviewSessions.values())
        .filter(session => !session.endTime).length;

      res.json({
        success: true,
        stats: {
          totalSessions,
          activeSessions,
          questionsInPool: this.questionPool.length,
          uptime: process.uptime()
        }
      });
    } catch (error) {
      console.error('Error getting stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get statistics'
      });
    }
  }

  // Health check
  healthCheck(req, res) {
    res.json({
      success: true,
      message: 'AI Interview Backend is running',
      geminiConnected: !!process.env.GEMINI_API_KEY, // Check if API key is present
      timestamp: new Date()
    });
  }
}

module.exports = new GeminiController();