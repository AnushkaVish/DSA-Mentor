import React, { useState, useEffect, useRef } from 'react';
import { Video, Mic, MicOff, VideoOff, User, Bot, Send, RotateCcw, X, Volume2, VolumeX } from 'lucide-react';

// Mock authentication context
const useAuth = () => {
  const [user] = useState({ 
    _id: 'demo123', 
    email: 'demo@example.com',
    name: 'Demo User'
  });
  const [token] = useState('demo_token_123');
  return { user, token };
};

// Speech recognition support check
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const InterviewPrepStudio = () => {
  const { token, user } = useAuth();
  
  // Interview session state
  const [session, setSession] = useState(null);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [scores, setScores] = useState([]);
  const [role, setRole] = useState("Frontend Developer");
  const [experience, setExperience] = useState("2");
  const [loading, setLoading] = useState(false);
  const [finalReport, setFinalReport] = useState(null);
  
  // Timing states
  const [startTime, setStartTime] = useState(null);
  const [videoOnTime, setVideoOnTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  
  // Speech recognition states
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [recognitionError, setRecognitionError] = useState(null);
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState("en-US");
  
  // Text-to-speech states
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  
  // Refs
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const resultDivRef = useRef(null);

  // Mock API calls for demo
  const mockStartInterview = () => {
    return {
      sessionId: 'mock123',
      question: "Let's say you're building a simple to-do list application. The user can add items, mark them as complete, and delete them. Describe how you would structure your frontend code to manage the list of to-do items, considering both the data structure you'd use and how you'd update the UI when items are added, completed, or deleted. We can focus on just the JavaScript/Frontend aspects for now, ignoring backend implementation.",
      questionNumber: 1,
      expectedTopics: ["State Management", "DOM Manipulation", "Event Handling", "Data Structures"],
      difficulty: "medium"
    };
  };

  const mockSubmitAnswer = (questionNumber) => {
    if (questionNumber >= 10) {
      return {
        isComplete: true,
        evaluation: {
          score: 8,
          feedback: "Great explanation of state management and UI updates. You demonstrated good understanding of frontend architecture.",
          technicalAccuracy: 8,
          communication: 9,
          depth: 7,
          strengths: ["Clear structure", "Good examples"],
          improvements: ["Could mention performance optimizations"]
        }
      };
    }
    return {
      isComplete: false,
      nextQuestion: "How would you handle asynchronous operations in your frontend application?",
      questionNumber: questionNumber + 1,
      expectedTopics: ["Promises", "Async/Await", "Error Handling"],
      difficulty: "medium",
      evaluation: {
        score: 8,
        feedback: "Good explanation! You covered the key concepts well.",
        technicalAccuracy: 8,
        communication: 8,
        depth: 7,
        strengths: ["Clear structure", "Good examples"],
        improvements: ["Could add more detail on edge cases"]
      }
    };
  };

  // Initialize speech recognition
  useEffect(() => {
    if (SpeechRecognition) {
      setSpeechRecognitionSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = voiceLanguage;
      
      recognition.onresult = (event) => {
        let finalText = "";
        let interimText = "";
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += transcript;
          } else {
            interimText += transcript;
          }
        }
        
        if (finalText.trim()) {
          setCurrentAnswer(prev => {
            const cleanPrev = prev.replace(interimTranscript.trim(), "").trim();
            const newAnswer = cleanPrev + (cleanPrev ? " " : "") + finalText.trim();
            return newAnswer;
          });
          setInterimTranscript("");
        } else {
          setInterimTranscript(interimText);
        }
      };
      
      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          setRecognitionError("Speech recognition error: " + event.error);
        }
      };
      
      recognition.onend = () => {
        setIsListening(false);
        if (micEnabled) {
          setTimeout(() => {
            if (micEnabled && recognitionRef.current) {
              try {
                recognitionRef.current.start();
                setIsListening(true);
              } catch (error) {
                console.error("Failed to restart recognition:", error);
              }
            }
          }, 100);
        }
      };
      
      recognition.onstart = () => {
        setIsListening(true);
        setRecognitionError(null);
      };
      
      recognitionRef.current = recognition;
    } else {
      setRecognitionError("Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.");
    }
  }, [voiceLanguage, micEnabled]);

  // Text-to-speech function
  const speakText = (text) => {
    if (!("speechSynthesis" in window) || !speechEnabled) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  // Toggle microphone
  const toggleMic = () => {
    if (!micEnabled) {
      setMicEnabled(true);
      if (speechRecognitionSupported && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (error) {
          console.error("Failed to start speech recognition:", error);
          setRecognitionError("Failed to start speech recognition");
        }
      }
    } else {
      setMicEnabled(false);
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      setInterimTranscript("");
    }
  };

  // Enable/disable video
 const enableVideo = async () => {
  try {
    // Stop old stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true, // 🔥 simplified (fixes many devices)
      audio: false
    });

    streamRef.current = stream;

    if (videoRef.current) {
      videoRef.current.srcObject = stream;

      // 🔥 MOST IMPORTANT FIX
      await videoRef.current.play().catch(() => {});
    }

    setVideoEnabled(true);
  } catch (error) {
    console.error("Error accessing video device:", error);
    setRecognitionError("Camera access denied or not working");
  }
};

  const disableVideo = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setVideoEnabled(false);
  };

  // Start interview
  const startInterview = async () => {
    setLoading(true);
    setRecognitionError(null);
    
    try {
      // Mock API call
      const response = mockStartInterview();
      
      setSession(response);
      setStartTime(new Date());
      setVideoOnTime(0);
      setTotalTime(0);
      setScores([]);
      setFinalReport(null);
      
      // Enable video by default
      await enableVideo();
      
      // Speak the question
      if (speechEnabled) {
        setTimeout(() => {
          speakText(`Question ${response.questionNumber} of 10. ${response.question}`);
        }, 1000);
      }
      
    } catch (error) {
      console.error("Error starting interview:", error);
      setRecognitionError("Failed to start interview: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Submit answer
  const submitAnswer = async (answer) => {
    if (!session || !answer.trim()) {
      setRecognitionError("Please provide an answer before submitting");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = mockSubmitAnswer(session.questionNumber);
      
      const newScores = [...scores, response.evaluation.score];
      setScores(newScores);
      
      if (response.isComplete) {
        const mockReport = {
          overallScore: 82,
          recommendation: "hire",
          summary: "Candidate showed strong technical knowledge and communication skills throughout the interview.",
          technicalSkills: { score: 8, feedback: "Strong understanding of frontend concepts" },
          communication: { score: 9, feedback: "Clear and articulate responses" },
          problemSolving: { score: 7, feedback: "Good problem-solving approach" },
          videoPresence: { score: 8, feedback: "Professional presentation" },
          strengths: ["Clear communication", "Technical depth", "Structured thinking"],
          areasForImprovement: ["Could elaborate more on edge cases", "Performance considerations"],
          detailedFeedback: "Overall excellent performance with room for minor improvements in technical depth."
        };
        
        setFinalReport(mockReport);
        setSession(prev => ({ ...prev, isComplete: true, evaluation: response.evaluation }));
      } else {
        setSession(prev => ({
          ...prev,
          question: response.nextQuestion,
          questionNumber: response.questionNumber,
          expectedTopics: response.expectedTopics,
          difficulty: response.difficulty,
          evaluation: response.evaluation,
          isComplete: false
        }));
        
        if (speechEnabled) {
          setTimeout(() => {
            speakText(`Question ${response.questionNumber} of 10. ${response.nextQuestion}`);
          }, 2000);
        }
      }
      
      setCurrentAnswer("");
      setInterimTranscript("");
      
    } catch (error) {
      console.error("Error submitting answer:", error);
      setRecognitionError("Failed to submit answer: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Continue to next question
  const proceedToNextQuestion = async () => {
    setSession(prev => ({
      ...prev,
      evaluation: undefined
    }));
  };

  // Stop interview
  const stopInterview = () => {
    if (window.confirm("Are you sure you want to stop the interview?")) {
      setSession(null);
      setScores([]);
      setVideoOnTime(0);
      setTotalTime(0);
      setStartTime(null);
      setFinalReport(null);
      setCurrentAnswer("");
      setInterimTranscript("");
      setRecognitionError(null);
      disableVideo();
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      setMicEnabled(false);
    }
  };

  // Sync video stream to video element
  useEffect(() => {
    if (videoEnabled && videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
      videoRef.current.play().catch(err => {
        console.warn("Video play failed:", err);
      });
    }
  }, [videoEnabled, session]);

  // Timer effects
  useEffect(() => {
    if (videoEnabled && startTime) {
      const interval = setInterval(() => {
        setVideoOnTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [videoEnabled, startTime]);

  useEffect(() => {
    if (startTime) {
      const interval = setInterval(() => {
        setTotalTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Helper functions
  const getScoreBand = (score) => {
    if (score >= 80) return { band: "Excellent", color: "text-green-400" };
    if (score >= 70) return { band: "Very Good", color: "text-blue-400" };
    if (score >= 60) return { band: "Good", color: "text-yellow-400" };
    if (score >= 50) return { band: "Average", color: "text-orange-400" };
    return { band: "Poor", color: "text-red-400" };
  };

  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case "hire": return "text-green-400 bg-green-500/20";
      case "consider": return "text-yellow-400 bg-yellow-500/20";
      case "reject": return "text-red-400 bg-red-500/20";
      default: return "text-gray-400 bg-gray-500/20";
    }
  };

  // Auto-scroll to results
  useEffect(() => {
    if ((session?.evaluation || finalReport) && resultDivRef.current) {
      resultDivRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [session?.evaluation, finalReport]);

  // If no session, show setup page
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Bot className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">AI Interview Assistant</h1>
            <p className="text-xl text-gray-300">
              Practice technical interviews with AI-powered questions, voice interaction, and real-time feedback
            </p>
          </div>

          {/* Job Role Selection */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Choose Your Target Role</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { role: "Frontend Developer", icon: "🎨", color: "from-blue-500 to-cyan-500" },
                { role: "Backend Developer", icon: "⚙️", color: "from-green-500 to-emerald-500" },
                { role: "Full Stack Developer", icon: "🚀", color: "from-purple-500 to-pink-500" },
                { role: "Data Scientist", icon: "📊", color: "from-yellow-500 to-orange-500" },
                { role: "DevOps Engineer", icon: "🔧", color: "from-red-500 to-rose-500" },
                { role: "Mobile Developer", icon: "📱", color: "from-indigo-500 to-blue-500" },
                { role: "Machine Learning Engineer", icon: "🤖", color: "from-teal-500 to-green-500" },
                { role: "Product Manager", icon: "📈", color: "from-pink-500 to-purple-500" }
              ].map((item) => (
                <div
                  key={item.role}
                  onClick={() => setRole(item.role)}
                  className={`cursor-pointer rounded-xl p-6 transition-all duration-300 transform hover:scale-105 border border-gray-700 ${
                    role === item.role
                      ? 'border-blue-500 shadow-lg shadow-blue-500/25 bg-gray-800/50'
                      : 'hover:border-gray-600 bg-gray-800/30 hover:bg-gray-800/50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${item.color} flex items-center justify-center mb-4 shadow-md`}>
                    <span className="text-2xl">{item.icon}</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2">{item.role}</h3>
                  {role === item.role && (
                    <div className="mt-3 flex items-center text-blue-400">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      <span className="text-xs font-medium">Selected</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Experience Level Selection */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Select Your Experience Level</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                { level: "0", label: "Entry Level", years: "0-1 years", icon: "🌱" },
                { level: "2", label: "Junior", years: "2-3 years", icon: "🌿" },
                { level: "4", label: "Mid-Level", years: "4-6 years", icon: "🌳" },
                { level: "7", label: "Senior", years: "7+ years", icon: "🏆" },
                { level: "10", label: "Staff/Principal", years: "10+ years", icon: "👑" }
              ].map((item) => (
                <div
                  key={item.level}
                  onClick={() => setExperience(item.level)}
                  className={`cursor-pointer rounded-xl p-6 transition-all duration-300 transform hover:scale-105 border border-gray-700 text-center ${
                    experience === item.level
                      ? 'border-blue-500 shadow-lg shadow-blue-500/25 bg-gray-800/50'
                      : 'hover:border-gray-600 bg-gray-800/30 hover:bg-gray-800/50'
                  }`}
                >
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <h3 className="font-semibold text-white mb-1">{item.label}</h3>
                  <p className="text-sm text-gray-400">{item.years}</p>
                </div>
              ))}
            </div>
          </div>

          {recognitionError && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
              <p className="text-red-300">{recognitionError}</p>
            </div>
          )}

          {/* Start Interview Button */}
          <div className="text-center">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl shadow-lg p-8 max-w-md mx-auto">
              <h3 className="text-xl font-bold text-white mb-4">Ready to Start?</h3>
              <p className="text-gray-400 mb-2">Role: <span className="font-semibold text-blue-400">{role}</span></p>
              <p className="text-gray-400 mb-6">Experience: <span className="font-semibold text-blue-400">
                {experience === "0" ? "Entry Level" : 
                 experience === "2" ? "Junior" : 
                 experience === "4" ? "Mid-Level" : 
                 experience === "7" ? "Senior" : "Staff/Principal"}
              </span></p>
              <button
                onClick={startInterview}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 font-semibold text-lg shadow-lg shadow-blue-500/25"
              >
                {loading ? "Starting Interview..." : "Start AI Interview"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show final report if completed
  if (session.isComplete && finalReport) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg shadow-sm p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-4">Interview Complete!</h1>
              <div className="text-6xl font-bold mb-4">
                <span className={getScoreBand(finalReport.overallScore).color}>{finalReport.overallScore}</span>
              </div>
              <div className="text-xl font-semibold mb-4">
                <span className={getScoreBand(finalReport.overallScore).color}>{getScoreBand(finalReport.overallScore).band}</span>
              </div>
              <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getRecommendationColor(finalReport.recommendation)}`}>
                Recommendation: {finalReport.recommendation.toUpperCase()}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-white">Summary</h3>
              <p className="text-gray-300">{finalReport.summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="p-4 bg-gray-700/50 border border-gray-600 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-white">Technical Skills</span>
                    <span className="text-blue-400 font-bold">{finalReport.technicalSkills.score}/10</span>
                  </div>
                  <p className="text-sm text-gray-400">{finalReport.technicalSkills.feedback}</p>
                </div>
                <div className="p-4 bg-gray-700/50 border border-gray-600 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-white">Communication</span>
                    <span className="text-green-400 font-bold">{finalReport.communication.score}/10</span>
                  </div>
                  <p className="text-sm text-gray-400">{finalReport.communication.feedback}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-gray-700/50 border border-gray-600 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-white">Problem Solving</span>
                    <span className="text-purple-400 font-bold">{finalReport.problemSolving.score}/10</span>
                  </div>
                  <p className="text-sm text-gray-400">{finalReport.problemSolving.feedback}</p>
                </div>
                <div className="p-4 bg-gray-700/50 border border-gray-600 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-white">Video Presence</span>
                    <span className="text-orange-400 font-bold">{finalReport.videoPresence.score}/10</span>
                  </div>
                  <p className="text-sm text-gray-400">{finalReport.videoPresence.feedback}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
                <h4 className="font-semibold text-green-300 mb-3">Strengths</h4>
                <ul className="space-y-1">
                  {finalReport.strengths.map((strength, index) => (
                    <li key={index} className="text-sm text-green-200">• {strength}</li>
                  ))}
                </ul>
              </div>
              <div className="p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                <h4 className="font-semibold text-yellow-300 mb-3">Areas for Improvement</h4>
                <ul className="space-y-1">
                  {finalReport.areasForImprovement.map((area, index) => (
                    <li key={index} className="text-sm text-yellow-200">• {area}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg mb-8">
              <h4 className="font-semibold text-blue-300 mb-3">Detailed Feedback</h4>
              <p className="text-blue-200 text-sm">{finalReport.detailedFeedback}</p>
            </div>

            <div className="text-center">
              <button
                onClick={() => {
                  setSession(null);
                  setFinalReport(null);
                  setScores([]);
                  setCurrentAnswer("");
                  setStartTime(null);
                  setVideoOnTime(0);
                  setTotalTime(0);
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/25"
              >
                Start New Interview
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main interview interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">AI Interview - {role}</h1>
          <button
            onClick={stopInterview}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors shadow-lg shadow-red-500/25"
          >
            <X className="h-4 w-4 mr-2" />
            Stop Interview
          </button>
        </div>

        {recognitionError && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-300">{recognitionError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* AI Avatar Section */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg shadow-lg p-6">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-4">
                <Bot className="h-8 w-8 text-blue-400 mr-2" />
                <h2 className="text-xl font-bold text-white">AI Interviewer</h2>
              </div>

              {/* AI Avatar */}
              <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden mb-4 relative h-64">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <Bot className="h-16 w-16 text-white" />
                  </div>
                </div>
                
                {isSpeaking && (
                  <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                    AI Speaking...
                  </div>
                )}

                <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  AI: Ready
                </div>
              </div>
              
              <p className="text-gray-400">Question {session.questionNumber} of 10</p>
              {session.difficulty && (
                <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                  session.difficulty === "easy" ? "bg-green-500/20 text-green-400 border border-green-500/50" :
                  session.difficulty === "medium" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/50" :
                  "bg-red-500/20 text-red-400 border border-red-500/50"
                }`}>
                  {session.difficulty.toUpperCase()}
                </span>
              )}
            </div>

            <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white">Current Question:</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSpeechEnabled(!speechEnabled)}
                    className={`p-2 rounded-full transition-colors ${
                      speechEnabled ? "text-blue-400 hover:bg-blue-500/20" : "text-gray-500 hover:bg-gray-700"
                    }`}
                  >
                    {speechEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => speakText(session.question)}
                    disabled={isSpeaking || !speechEnabled}
                    className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-full disabled:opacity-50"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">{session.question}</p>
              
              {session.expectedTopics?.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-200 mb-2">Expected Topics:</h4>
                  <div className="flex flex-wrap gap-2">
                    {session.expectedTopics.map((topic, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/50">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Previous Answer Feedback */}
            {session.evaluation && (
              <div ref={resultDivRef} className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-blue-300 mb-2">
                  Previous Answer Score: {session.evaluation.score}/10
                </h3>
                <p className="text-sm text-blue-200 mb-3">{session.evaluation.feedback}</p>
                <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                  <div className="text-center">
                    <div className="font-medium text-gray-300">Technical</div>
                    <div className="text-blue-400">{session.evaluation.technicalAccuracy}/10</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-300">Communication</div>
                    <div className="text-green-400">{session.evaluation.communication}/10</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-300">Depth</div>
                    <div className="text-purple-400">{session.evaluation.depth}/10</div>
                  </div>
                </div>

                {session.evaluation.strengths?.length > 0 && (
                  <div className="mb-2">
                    <div className="font-medium text-green-300 text-xs mb-1">Strengths:</div>
                    <div className="text-xs text-green-200">{session.evaluation.strengths.join(", ")}</div>
                  </div>
                )}

                {session.evaluation.improvements?.length > 0 && (
                  <div className="mb-3">
                    <div className="font-medium text-yellow-300 text-xs mb-1">Improvements:</div>
                    <div className="text-xs text-yellow-200">{session.evaluation.improvements.join(", ")}</div>
                  </div>
                )}

                <button
                  onClick={proceedToNextQuestion}
                  className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors shadow-lg shadow-green-500/25"
                >
                  Continue to Next Question
                </button>
              </div>
            )}
          </div>

          {/* User Video Section */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg shadow-lg p-6">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-blue-400 mr-2" />
                <h2 className="text-xl font-bold text-white">You</h2>
              </div>

              {/* User Video */}
              <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden mb-4 relative h-64">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  muted 
                  playsInline 
                  className={`w-full h-full object-cover bg-black ${!videoEnabled ? 'hidden' : ''}`}
                />
                {!videoEnabled && (
                  <div className="w-full h-full flex items-center justify-center">
                    <VideoOff className="h-12 w-12 text-gray-500" />
                  </div>
                )}

                {isListening && (
                  <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                    Listening...
                  </div>
                )}

                {videoEnabled && (
                  <div className="absolute top-4 right-4 bg-green-600 text-white px-2 py-1 rounded text-xs">
                    Video: ON
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex justify-center space-x-4 mb-6">
                <button
                  onClick={() => videoEnabled ? disableVideo() : enableVideo()}
                  className={`p-3 rounded-full transition-all duration-200 ${
                    videoEnabled
                      ? "bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-500/25"
                      : "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/25"
                  }`}
                >
                  {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </button>

                <button
                  onClick={toggleMic}
                  className={`p-3 rounded-full transition-all duration-200 ${
                    micEnabled && isListening
                      ? "bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-500/25 ring-2 ring-green-400/50" 
                      : micEnabled 
                        ? "bg-yellow-600 text-white hover:bg-yellow-700 shadow-lg shadow-yellow-500/25"
                        : "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/25"
                  }`}
                >
                  {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </button>
              </div>

              {/* Timer Info */}
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-400 mb-6">
                <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3">
                  <p className="font-medium text-gray-300">Video On Time</p>
                  <p className="text-blue-400 font-mono">{Math.floor(videoOnTime / 60)}:{(videoOnTime % 60).toString().padStart(2, "0")}</p>
                </div>
                <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3">
                  <p className="font-medium text-gray-300">Total Time</p>
                  <p className="text-purple-400 font-mono">{Math.floor(totalTime / 60)}:{(totalTime % 60).toString().padStart(2, "0")}</p>
                </div>
              </div>
            </div>

            {/* Answer Input */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">Your Answer</label>
                  <div className="flex items-center space-x-2">
                    <select
                      value={voiceLanguage}
                      onChange={(e) => setVoiceLanguage(e.target.value)}
                      className="text-xs px-2 py-1 bg-gray-700 border border-gray-600 text-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="en-US">English (US)</option>
                      <option value="en-IN">English (Indian)</option>
                      <option value="hi-IN">Hindi</option>
                      <option value="es-ES">Spanish</option>
                      <option value="fr-FR">French</option>
                    </select>
                    
                    <div className={`flex items-center px-3 py-1 text-sm rounded border ${
                      isListening
                        ? "bg-green-500/20 text-green-300 border-green-500/50"
                        : micEnabled
                          ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/50"
                          : "bg-gray-700 text-gray-400 border-gray-600"
                    }`}>
                      <Mic className="h-4 w-4 mr-1" />
                      {isListening ? "Listening..." : micEnabled ? "Ready" : "Off"}
                    </div>
                  </div>
                </div>

                {isListening && (
                  <div className="mb-2 p-3 bg-green-500/20 border border-green-500/50 rounded-md">
                    <div className="flex items-center">
                      <span className="h-3 w-3 rounded-full bg-green-500 animate-pulse mr-2"></span>
                      <span className="text-sm font-medium text-green-300">
                        Listening in {voiceLanguage.split("-")[0]} - Speak naturally
                      </span>
                    </div>
                    {interimTranscript && (
                      <div className="text-sm text-gray-400 mt-1 italic">"{interimTranscript}"</div>
                    )}
                  </div>
                )}

                <textarea
                  value={currentAnswer + (interimTranscript ? " " + interimTranscript : "")}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                  placeholder="Start speaking or type your answer here..."
                />
              </div>

              {speechRecognitionSupported && (
                <div className="text-sm text-gray-400 p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg">
                  <p className="mb-2 text-blue-300">Speech Recognition Tips:</p>
                  <ul className="space-y-1 text-xs text-blue-200">
                    <li>• Speech recognition is supported in your browser</li>
                    <li>• Auto-restart feature: Speech will automatically restart if it stops</li>
                    <li>• You can edit the text manually at any time</li>
                  </ul>
                </div>
              )}

              <button
                onClick={() => submitAnswer(currentAnswer)}
                disabled={loading || !currentAnswer.trim()}
                className={`w-full py-3 rounded-md transition-colors flex items-center justify-center font-medium ${
                  loading || !currentAnswer.trim()
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed border border-gray-600' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25'
                }`}
              >
                <Send className="h-4 w-4 mr-2" />
                {loading ? "Processing Answer..." : "Submit Answer & Continue"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPrepStudio;