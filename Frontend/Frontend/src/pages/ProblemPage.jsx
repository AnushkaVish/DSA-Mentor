import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Trophy, Code2, BookOpen, MessageSquare, History, 
  Play, Send, ChevronLeft, Layout, Video, FileText 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import axiosClient from "../utils/axiosClient";
import SubmissionHistory from "../components/SubmissionHistory";
import ChatAi from '../components/ChatAi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Editorial from '../components/Editorial';
import Loader from '../components/Loader';
import confetti from 'canvas-confetti';

const langMap = {
  cpp: 'C++',
  java: 'Java',
  js: 'JavaScript'
};

const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('js');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobilePanelTab, setMobilePanelTab] = useState('problem'); // 'problem' or 'editor'

  const editorRef = useRef(null);
  const { problemId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const contestId = location.state?.contestId;

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(`/problem/problemById/${problemId}`);
        setProblem(response.data);
        
        // Language normalization for initial code
        const lang = normalizeLang(selectedLanguage);
        const initialCodeObj = response.data.startCode.find(
          sc => sc.language.toLowerCase() === lang
        );
        setCode(initialCodeObj?.initialCode || '// Start coding...');
        setLoading(false);
      } catch (error) {
        toast.error('Failed to load problem.');
        setLoading(false);
      }
    };
    fetchProblem();
  }, [problemId]);

  const normalizeLang = (lang) => {
    if (lang === "js") return "javascript";
    if (lang === "cpp") return "cpp";
    return lang.toLowerCase();
  };

  useEffect(() => {
    if (problem?.startCode) {
      const lang = normalizeLang(selectedLanguage);
      const codeObj = problem.startCode.find(sc => sc.language.toLowerCase() === lang);
      setCode(codeObj?.initialCode || "// No start code");
    }
  }, [selectedLanguage, problem]);

  const handleRun = async () => {
    setIsRunning(true);
    setRunResult(null);
    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, { code, language: selectedLanguage });
      setRunResult(response.data);
      setActiveRightTab('testcase');
      if (response.data.success) toast.success('Execution Successful');
    } catch (error) {
      toast.error('Execution Failed');
    } finally { setIsRunning(false); }
  };

  const handleSubmitCode = async () => {
    setIsSubmitting(true);
    try {
      const response = await axiosClient.post(`/submission/submit/${problemId}`, { 
        code, language: selectedLanguage, contestId 
      });
      setSubmitResult(response.data);
      setActiveRightTab('result');
      if (response.data.accepted) {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        toast.success('Accepted! 🎉');
      }
    } catch (error) {
      toast.error('Submission Error');
    } finally { setIsSubmitting(false); }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'hard': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  // --- SUB-COMPONENTS FOR CLEANER CODE ---

  const TabButton = ({ id, label, icon: Icon, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold transition-all duration-300 relative ${
        active ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
      }`}
    >
      <Icon size={14} />
      {label}
      {active && (
        <motion.div 
          layoutId="activeTab" 
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
        />
      )}
    </button>
  );

  return (
    <div className="h-screen flex flex-col bg-[#0f172a] text-slate-200 overflow-hidden font-sans">
      <ToastContainer position="top-center" theme="dark" />

      {/* Contest Banner */}
      {contestId && (
        <div className="bg-gradient-to-r from-violet-600/20 to-blue-600/20 border-b border-white/5 px-4 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy size={14} className="text-yellow-500 animate-pulse" />
            <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase opacity-80">Contest Mode Active</span>
          </div>
          <button onClick={() => navigate(`/contest/${contestId}`)} className="text-[10px] bg-white/10 hover:bg-white/20 px-3 py-1 rounded-md transition-all">
            Exit
          </button>
        </div>
      )}

      {/* Mobile Panel Toggle */}
      <div className="md:hidden flex border-b border-white/5 bg-[#1e293b]">
        <button 
          onClick={() => setMobilePanelTab('problem')}
          className={`flex-1 py-3 flex justify-center items-center gap-2 text-xs font-bold ${mobilePanelTab === 'problem' ? 'text-blue-400 bg-blue-500/5' : 'text-slate-500'}`}
        >
          <FileText size={16} /> PROBLEM
        </button>
        <button 
          onClick={() => setMobilePanelTab('editor')}
          className={`flex-1 py-3 flex justify-center items-center gap-2 text-xs font-bold ${mobilePanelTab === 'editor' ? 'text-blue-400 bg-blue-500/5' : 'text-slate-500'}`}
        >
          <Code2 size={16} /> EDITOR
        </button>
      </div>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel: Description, Editorial, etc. */}
        <div className={`flex-col ${mobilePanelTab === 'problem' ? 'flex w-full' : 'hidden'} md:flex md:w-1/2 border-r border-white/5 bg-[#0f172a]`}>
          <div className="flex overflow-x-auto no-scrollbar border-b border-white/5 bg-[#1e293b]/50">
            <TabButton id="description" label="Description" icon={BookOpen} active={activeLeftTab === 'description'} onClick={setActiveLeftTab} />
            <TabButton id="editorial" label="Editorial" icon={Video} active={activeLeftTab === 'editorial'} onClick={setActiveLeftTab} />
            <TabButton id="solutions" label="Solutions" icon={Code2} active={activeLeftTab === 'solutions'} onClick={setActiveLeftTab} />
            <TabButton id="submissions" label="History" icon={History} active={activeLeftTab === 'submissions'} onClick={setActiveLeftTab} />
            <TabButton id="chatAI" label="AI" icon={MessageSquare} active={activeLeftTab === 'chatAI'} onClick={setActiveLeftTab} />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
            <AnimatePresence mode="wait">
              {loading ? (
                <div className="h-full flex items-center justify-center"><Loader /></div>
              ) : (
                <motion.div
                  key={activeLeftTab}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeLeftTab === 'description' && (
                    <div className="space-y-6">
                      <h1 className="text-2xl font-bold text-white tracking-tight">{problem?.title}</h1>
                      <div className="flex gap-2">
                        <span className={`px-3 py-1 rounded-md text-[10px] font-bold border ${getDifficultyColor(problem?.difficulty)}`}>
                          {problem?.difficulty?.toUpperCase()}
                        </span>
                        <span className="px-3 py-1 rounded-md text-[10px] font-bold bg-slate-800 text-slate-400 border border-white/5">
                          {problem?.tags || 'General'}
                        </span>
                      </div>
                      <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                        {problem?.description}
                      </div>
                      
                      {/* Examples Section */}
                      <div className="space-y-4 pt-4">
                        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                          <Layout size={16} className="text-blue-400" /> Examples
                        </h3>
                        {problem?.visibleTestCases?.map((ex, i) => (
                          <div key={i} className="bg-[#1e293b] rounded-xl p-4 border border-white/5 shadow-inner">
                            <div className="font-mono text-xs space-y-2">
                              <p><span className="text-blue-400 font-bold">Input:</span> <span className="text-slate-300">{ex.input}</span></p>
                              <p><span className="text-emerald-400 font-bold">Output:</span> <span className="text-slate-300">{ex.output}</span></p>
                              {ex.explanation && <p className="text-slate-500 italic mt-2">// {ex.explanation}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeLeftTab === 'editorial' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-bold text-white">Editorial & Video Solution</h2>
                      
                      {/* Priority 1: Cloudinary Video (Uploaded via Backend) */}
                      {problem?.secureUrl ? (
                        <div className="bg-[#1e293b]/50 rounded-xl p-4 border border-white/5">
                          <Editorial 
                            secureUrl={problem.secureUrl} 
                            thumbnailUrl={problem.thumbnailUrl} 
                            duration={problem.duration} 
                          />
                        </div>
                      ) : problem?.videoUrl ? (
                        /* Priority 2: YouTube Video Link */
                        <div className="aspect-video w-full rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-black">
                          <iframe
                            className="w-full h-full"
                            src={problem.videoUrl.replace("watch?v=", "embed/")}
                            title="Editorial Video"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                      ) : (
                        /* No Video Available */
                        <div className="p-8 border border-dashed border-white/10 rounded-xl text-center text-slate-500">
                          <Video size={40} className="mx-auto mb-2 opacity-20" />
                          <p className="text-sm">No video editorial available for this problem yet.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeLeftTab === 'solutions' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Code2 className="text-blue-400" size={24} /> Official Solutions
                      </h2>
                      
                      {problem?.referenceSolution?.length > 0 ? (
                        <div className="space-y-6">
                          {problem.referenceSolution.map((sol, i) => (
                            <div key={i} className="bg-[#1e293b]/50 rounded-xl overflow-hidden border border-white/5 shadow-xl">
                              <div className="bg-slate-800/50 px-4 py-2.5 border-b border-white/5 flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
                                  {sol.language}
                                </span>
                                <button 
                                  onClick={() => {
                                    navigator.clipboard.writeText(sol.completeCode);
                                    toast.success(`${sol.language} solution copied!`);
                                  }}
                                  className="text-[10px] bg-white/5 hover:bg-white/10 px-2 py-1 rounded transition-all text-slate-400"
                                >
                                  Copy Code
                                </button>
                              </div>
                              <div className="p-4 bg-[#0f172a]/50">
                                <pre className="font-mono text-xs text-slate-300 overflow-x-auto custom-scrollbar leading-relaxed">
                                  <code>{sol.completeCode}</code>
                                </pre>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-12 border border-dashed border-white/10 rounded-2xl text-center">
                          <div className="bg-slate-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                            <Code2 size={32} className="text-slate-600" />
                          </div>
                          <p className="text-slate-400 font-medium">No official solutions available yet.</p>
                          <p className="text-slate-600 text-xs mt-1">Check back later or try solving it yourself!</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeLeftTab === 'submissions' && <SubmissionHistory problemId={problemId} />}
                  {activeLeftTab === 'chatAI' && <ChatAi problem={problem} />}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Panel: Code Editor */}
        <div className={`${mobilePanelTab === 'editor' ? 'flex w-full' : 'hidden'} md:flex md:w-1/2 flex-col bg-[#0b0f1a]`}>
          {/* Editor Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#1e293b]/80 backdrop-blur-md border-b border-white/5">
            <select 
              value={selectedLanguage} 
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:ring-2 ring-blue-500/50 transition-all cursor-pointer"
            >
              <option value="js">JavaScript</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>

            <div className="flex gap-2">
              <button 
                onClick={handleRun} 
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-xs font-bold rounded-lg transition-all"
              >
                {isRunning ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play size={14} />}
                Run
              </button>
              <button 
                onClick={handleSubmitCode} 
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-xs font-bold rounded-lg shadow-lg shadow-blue-900/20 transition-all"
              >
                {isSubmitting ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={14} />}
                Submit
              </button>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 relative group">
            <Editor
              height="100%"
              theme="vs-dark"
              language={selectedLanguage === 'js' ? 'javascript' : selectedLanguage}
              value={code}
              onChange={(v) => setCode(v)}
              options={{
                fontSize: 14,
                fontFamily: 'Fira Code, monospace',
                minimap: { enabled: false },
                padding: { top: 20 },
                smoothScrolling: true,
                cursorSmoothCaretAnimation: true,
                lineNumbersMinChars: 3,
              }}
            />
          </div>

          {/* Bottom Results Panel */}
          <div className="h-1/3 border-t border-white/10 bg-[#0f172a] flex flex-col">
            <div className="flex border-b border-white/5">
              <button 
                onClick={() => setActiveRightTab('testcase')}
                className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeRightTab === 'testcase' ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-400/5' : 'text-slate-500'}`}
              >
                Test Results
              </button>
              <button 
                onClick={() => setActiveRightTab('result')}
                className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeRightTab === 'result' ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-400/5' : 'text-slate-500'}`}
              >
                Submission
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs">
              <AnimatePresence mode="wait">
                {activeRightTab === 'testcase' ? (
                  <motion.div key="tc" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {runResult ? (
                      <div className="space-y-3">
                        <div className={`p-3 rounded-lg border ${runResult.success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                          {runResult.success ? '✓ All Test Cases Passed' : '✗ Execution Error'}
                        </div>
                        {runResult.testCases?.map((tc, i) => (
                          <div key={i} className="bg-slate-900 border border-white/5 rounded-lg p-3">
                            <p className="opacity-50 mb-1">Input: {tc.stdin}</p>
                            <p className="text-blue-300">Expected: {tc.expected_output}</p>
                            <p className={tc.status_id === 3 ? 'text-emerald-400' : 'text-rose-400'}>Actual: {tc.stdout}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-600 italic">Run code to see results...</div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div key="sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {submitResult ? (
                      <div className="space-y-3">
                        <div className={`text-lg font-bold ${submitResult.accepted ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {submitResult.accepted ? 'Accepted' : 'Wrong Answer'}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-slate-900 p-2 rounded border border-white/5">
                            <p className="opacity-40 text-[10px]">Runtime</p>
                            <p>{submitResult.runtime}ms</p>
                          </div>
                          <div className="bg-slate-900 p-2 rounded border border-white/5">
                            <p className="opacity-40 text-[10px]">Memory</p>
                            <p>{submitResult.memory}KB</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-600 italic">No submissions yet...</div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      {/* Global CSS for scrollbars */}
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
      `}} />
    </div>
  );
};

export default ProblemPage;