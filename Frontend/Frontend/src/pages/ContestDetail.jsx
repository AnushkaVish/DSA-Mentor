import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Trophy, Clock, Calendar, CheckCircle, AlertCircle, ChevronLeft, Award, Code, Signal, Users, Star } from 'lucide-react';
import axiosClient from '../utils/axiosClient';
import Loader from '../components/Loader';
import confetti from 'canvas-confetti';

function ContestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('problems'); // 'problems', 'theory', or 'leaderboard'
  const [timeLeft, setTimeLeft] = useState('');
  const [contestStatus, setContestStatus] = useState('');
  const [submittingMcq, setSubmittingMcq] = useState(null); // index of mcq being submitted


  useEffect(() => {
    fetchContestDetails();
    
    // Refresh data when window is focused (e.g., coming back from Problem Page)
    const onFocus = () => fetchContestDetails();
    window.addEventListener('focus', onFocus);
    
    return () => window.removeEventListener('focus', onFocus);
  }, [id]);

  useEffect(() => {
    if (contest) {
      const interval = setInterval(() => {
        updateTimer();
      }, 1000);
      updateTimer();
      return () => clearInterval(interval);
    }
  }, [contest]);

  const fetchContestDetails = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get(`/api/contests/${id}`);
      setContest(response.data);
    } catch (error) {
      console.error("Error fetching contest details:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateTimer = () => {
    if (!contest) return;

    const now = new Date();
    const start = new Date(contest.startTime);
    const end = new Date(contest.endTime);

    let status = '';
    let targetTime = null;

    if (now < start) {
      status = 'upcoming';
      targetTime = start;
    } else if (now >= start && now <= end) {
      status = 'live';
      targetTime = end;
    } else {
      status = 'ended';
      setTimeLeft('Contest Ended');
      setContestStatus('ended');
      return;
    }

    setContestStatus(status);

    const diff = targetTime - now;
    if (diff <= 0) return;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    let timeString = '';
    if (days > 0) timeString += `${days}d `;
    timeString += `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    setTimeLeft(status === 'upcoming' ? `Starts in: ${timeString}` : `Ends in: ${timeString}`);
  };

  const handleProblemClick = (problemId) => {
    if (contestStatus === 'upcoming' && user.role !== 'admin') {
      alert("Contest hasn't started yet!");
      return;
    }
    navigate(`/problem/${problemId}`, { state: { contestId: id } });
  };

  const handleMcqSubmit = async (mcqIndex, selectedOption) => {
    if (contestStatus !== 'live' && user.role !== 'admin') {
      alert("You can only submit during live contest!");
      return;
    }

    setSubmittingMcq(mcqIndex);
    try {
      const response = await axiosClient.post('/api/contests/submit-mcq', {
        contestId: id,
        mcqIndex,
        selectedOption
      });
      
      if (response.data.isCorrect) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#22c55e', '#10b981', '#ffffff']
        });
      }
      
      alert(response.data.message);
      fetchContestDetails(); // Refresh to show solved status
    } catch (error) {
      alert(error.response?.data?.message || "Error submitting MCQ");
    } finally {
      setSubmittingMcq(null);
    }
  };

  const getSortedLeaderboard = () => {
    if (!contest?.participants) return [];
    
    return [...contest.participants].sort((a, b) => {
      // 1. Primary Sort: Score (Higher is better)
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      
      // 2. Secondary Sort: Submission Time (Earlier is better)
      // Only compare if they have scores
      if (a.score > 0 && a.submissionTime && b.submissionTime) {
        return new Date(a.submissionTime) - new Date(b.submissionTime);
      }
      
      // 3. Fallback: Rank those with submissions above those without
      if (a.submissionTime && !b.submissionTime) return -1;
      if (!a.submissionTime && b.submissionTime) return 1;
      
      return 0;
    });
  };

  if (loading) return <Loader />;
  if (!contest) return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">Contest not found</div>;

  const leaderboard = getSortedLeaderboard();

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-20">
      {/* Hero Header */}
      <div className="bg-gray-900/40 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button 
            onClick={() => navigate('/contest')}
            className="flex items-center text-gray-500 hover:text-white mb-6 transition-all group"
          >
            <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
            Back to Arena
          </button>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text text-transparent">
                  {contest.title}
                </h1>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                  contestStatus === 'live' ? 'bg-green-500/10 text-green-400 border-green-500/20 animate-pulse' :
                  contestStatus === 'upcoming' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                  'bg-gray-500/10 text-gray-400 border-gray-500/20'
                }`}>
                  {contestStatus}
                </div>
              </div>
              <p className="text-gray-400 max-w-2xl leading-relaxed">{contest.description}</p>
              
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                  <Calendar className="w-4 h-4 text-purple-500" />
                  {new Date(contest.startTime).toLocaleString()}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                  <Users className="w-4 h-4 text-purple-500" />
                  {contest.participants?.length || 0} participants
                </div>
              </div>
            </div>
            
            <div className="bg-gray-950/50 p-6 rounded-2xl border border-gray-800 flex flex-col items-center justify-center min-w-[240px] shadow-2xl shadow-purple-500/5">
              <div className={`text-3xl font-mono font-black mb-1 tracking-tighter ${
                contestStatus === 'live' ? 'text-green-400' : 
                contestStatus === 'upcoming' ? 'text-blue-400' : 'text-gray-500'
              }`}>
                {timeLeft}
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-600">
                {contestStatus === 'live' ? 'Time Remaining' : contestStatus === 'upcoming' ? 'Countdown to start' : 'Competition Closed'}
              </div>
            </div>
          </div>
        </div>
        
        {/* Modern Tabs */}
        <div className="max-w-7xl mx-auto px-4 mt-4 flex gap-8">
          <button
            onClick={() => setActiveTab('problems')}
            className={`pb-4 px-2 font-bold text-sm tracking-widest uppercase transition-all relative ${
              activeTab === 'problems' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Problems
            {activeTab === 'problems' && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-purple-500 rounded-t-full shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('theory')}
            className={`pb-4 px-2 font-bold text-sm tracking-widest uppercase transition-all relative ${
              activeTab === 'theory' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Theory
            {activeTab === 'theory' && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 rounded-t-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`pb-4 px-2 font-bold text-sm tracking-widest uppercase transition-all relative ${
              activeTab === 'leaderboard' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Leaderboard
            {activeTab === 'leaderboard' && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500 rounded-t-full shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
            )}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {activeTab === 'problems' ? (
          <div className="grid gap-4 max-w-4xl mx-auto">
            {contest.problems.map((item, index) => {
                const problem = item.problemId;
                if (!problem) return null;

                const participant = contest.participants.find(p => (p.user._id || p.user) === user?._id);
                const isSolved = participant?.solvedProblems?.some(pid => {
                  const pidStr = (typeof pid === 'object' ? pid._id : pid).toString();
                  const probIdStr = problem._id.toString();
                  return pidStr === probIdStr;
                });

                return (
                  <div 
                    key={problem._id} 
                    onClick={() => !isSolved && handleProblemClick(problem._id)}
                    className={`bg-gray-900/40 backdrop-blur-sm p-6 rounded-2xl border ${isSolved ? 'border-green-500/20' : 'border-gray-800'} ${!isSolved ? 'hover:border-purple-500/40 cursor-pointer' : 'cursor-default'} transition-all group flex items-center justify-between shadow-xl`}
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-xl bg-gray-800/80 border border-gray-700 flex items-center justify-center font-black text-gray-500 group-hover:text-purple-400 group-hover:border-purple-500/30 transition-all shadow-inner">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold group-hover:text-white transition-colors mb-1">{problem.title}</h3>
                        <div className="flex items-center gap-3">
                           <span className={`text-[10px] font-black uppercase tracking-widest ${
                            problem.difficulty === 'easy' ? 'text-green-400' :
                            problem.difficulty === 'medium' ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {problem.difficulty}
                          </span>
                          <span className="w-1 h-1 bg-gray-700 rounded-full" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">
                            {item.points} Points
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      {isSolved ? (
                        <div className="flex items-center gap-2 text-green-400 bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/20 shadow-lg shadow-green-500/5">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-wider">Solved</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-400 group-hover:text-white transition-all font-bold text-xs uppercase tracking-widest bg-gray-800/50 px-5 py-2.5 rounded-xl border border-gray-700 group-hover:bg-purple-600 group-hover:border-purple-500 shadow-xl group-active:scale-95">
                          Solve Challenge
                        </div>
                      )}
                    </div>
                  </div>
                );
            })}
            {contest.problems.length === 0 && (
              <div className="text-center py-24 bg-gray-900/20 rounded-3xl border-2 border-dashed border-gray-800">
                <Code className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No problems added to this contest yet.</p>
              </div>
            )}
          </div>
        ) : activeTab === 'theory' ? (
          <div className="max-w-4xl mx-auto space-y-8">
            {contest.mcqs?.map((mcq, idx) => {
              const participant = contest.participants.find(p => (p.user._id || p.user) === user?._id);
              const submission = participant?.solvedMcqs?.find(m => m.mcqIndex === idx);
              const isSolved = !!submission;
              const isCorrect = submission?.isCorrect;

              return (
                <div key={idx} className={`bg-gray-900/40 backdrop-blur-sm p-8 rounded-3xl border ${isSolved ? (isCorrect ? 'border-green-500/30' : 'border-red-500/30') : 'border-gray-800'} shadow-2xl`}>
                  <div className="flex items-start justify-between mb-6">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Question {idx + 1}</span>
                      <h3 className="text-xl font-bold text-gray-100 leading-relaxed">{mcq.question}</h3>
                    </div>
                    <div className="px-3 py-1 bg-gray-800 rounded-full border border-gray-700 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {mcq.points} Points
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mcq.options.map((opt, optIdx) => {
                      const isSelected = submission?.selectedOption === optIdx; // Note: we should track selectedOption in model too if needed
                      return (
                        <button
                          key={optIdx}
                          disabled={isSolved || contestStatus !== 'live'}
                          onClick={() => handleMcqSubmit(idx, optIdx)}
                          className={`group relative p-4 rounded-2xl border text-left transition-all ${
                            isSolved 
                              ? (mcq.correctOption === optIdx ? 'border-green-500 bg-green-500/10' : 'border-gray-800 opacity-50')
                              : 'border-gray-800 hover:border-blue-500/50 hover:bg-blue-500/5 active:scale-[0.98]'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border ${
                              isSolved && mcq.correctOption === optIdx ? 'bg-green-500 border-green-400 text-white' : 'bg-gray-800 border-gray-700 text-gray-500'
                            }`}>
                              {String.fromCharCode(65 + optIdx)}
                            </div>
                            <span className="text-sm font-medium text-gray-300">{opt}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {isSolved && (
                    <div className={`mt-6 flex items-center gap-2 ${isCorrect ? 'text-green-400' : 'text-red-400'} font-bold text-xs uppercase tracking-widest`}>
                      {isCorrect ? (
                        <><CheckCircle size={14} /> Correct Answer!</>
                      ) : (
                        <><AlertCircle size={14} /> Wrong Answer. The correct option was {String.fromCharCode(65 + mcq.correctOption)}</>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {(!contest.mcqs || contest.mcqs.length === 0) && (
              <div className="text-center py-24 bg-gray-900/20 rounded-3xl border-2 border-dashed border-gray-800">
                <Signal className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No theory questions in this contest.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-900/40 backdrop-blur-sm rounded-3xl border border-gray-800 overflow-hidden shadow-2xl max-w-5xl mx-auto">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-900/60 border-b border-gray-800">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Rank</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Coder</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-right">Score</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-right">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {leaderboard.map((participant, index) => (
                    <tr key={participant.user?._id || participant.user} className={`hover:bg-gray-800/30 transition-all ${
                      (participant.user?._id || participant.user) === user?._id ? 'bg-purple-500/5' : ''
                    }`}>
                      <td className="px-8 py-6">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-xl ${
                          index === 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 ring-4 ring-yellow-500/5' :
                          index === 1 ? 'bg-gray-400/20 text-gray-300 border border-gray-400/30 ring-4 ring-gray-400/5' :
                          index === 2 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 ring-4 ring-orange-500/5' :
                          'text-gray-600 border border-gray-800'
                        }`}>
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
                            {(participant.user?.firstName || 'U').substring(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-gray-200">
                              {participant.user?.firstName} {participant.user?.lastName}
                            </div>
                            {index === 0 && <div className="text-[8px] text-yellow-500 font-black uppercase tracking-widest mt-0.5">Grandmaster</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className="font-mono font-black text-xl text-purple-400 shadow-purple-500/20 drop-shadow-lg">
                          {participant.score}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex flex-col items-end gap-1.5">
                          <div className="flex gap-1">
                            {contest.problems.map((_, pIdx) => (
                              <div 
                                key={pIdx} 
                                className={`w-3 h-1.5 rounded-full ${
                                  pIdx < participant.solvedProblems.length ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-gray-800'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                            {participant.solvedProblems.length} / {contest.problems.length} Solved
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {leaderboard.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-8 py-24 text-center">
                        <Award className="w-12 h-12 text-gray-800 mx-auto mb-4" />
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No entries yet. Be the first to conquer the board!</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ContestDetail;
