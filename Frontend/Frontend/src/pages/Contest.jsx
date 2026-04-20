import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Clock, Trophy, Code, Calendar, Users, ChevronRight, Plus, X, Edit2, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import Loader from '../components/Loader';
import axiosClient from '../utils/axiosClient';

function Contest() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [contests, setContests] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedContest, setSelectedContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableProblems, setAvailableProblems] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    duration: 60,
    problems: [],
    mcqs: []
  });

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchContests();
    if (isAdmin) {
      fetchProblems();
    }
  }, [isAdmin]);

  const fetchContests = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/api/contests/getAllContests');
      setContests(response.data);
    } catch (error) {
      console.error("Error fetching contests:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProblems = async () => {
    try {
      const response = await axiosClient.get('/problem/getAllProblem');
      setAvailableProblems(response.data);
    } catch (error) {
      console.error("Error fetching problems:", error);
    }
  };

  const getContestStatus = (contest) => {
    const now = new Date();
    const start = new Date(contest.startTime);
    const end = new Date(contest.endTime);

    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'live';
    return 'ended';
  };

  const getTimeUntilStart = (startTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const diff = start - now;

    if (diff <= 0) return 'Started';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${String(days).padStart(2, '0')}:${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const [timers, setTimers] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      const newTimers = {};
      contests.forEach(contest => {
        newTimers[contest._id] = getTimeUntilStart(contest.startTime);
      });
      setTimers(newTimers);
    }, 1000);

    return () => clearInterval(interval);
  }, [contests]);

  const handleCreateContest = async () => {
    if (!formData.title || !formData.startTime || !formData.endTime) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await axiosClient.post('/api/contests/create', formData);
      if (response.data) {
        setShowCreateModal(false);
        resetForm();
        fetchContests();
        alert('Contest created successfully! ✅');
      }
    } catch (error) {
      console.error("Creation error details:", error);
      const errorMsg = error.response?.data?.message || error.response?.data || error.message || "Unknown error";
      alert('Error creating contest: ' + errorMsg);
    }
  };

  const handleUpdateContest = async () => {
    try {
      const response = await axiosClient.put(`/api/contests/update/${selectedContest._id}`, formData);
      if (response.data) {
        setShowCreateModal(false);
        setSelectedContest(null);
        resetForm();
        fetchContests();
        alert('Contest updated successfully! ✅');
      }
    } catch (error) {
      console.error("Update error details:", error);
      const errorMsg = error.response?.data?.message || error.message || "Unknown error";
      alert('Error updating contest: ' + errorMsg);
    }
  };

  const handleDeleteContest = async (id) => {
    if (window.confirm('Are you sure you want to delete this contest?')) {
      try {
        await axiosClient.delete(`/api/contests/delete/${id}`);
        fetchContests();
      } catch (error) {
        alert('Error deleting contest');
      }
    }
  };

  const handleRegister = async (contestId) => {
    try {
      await axiosClient.post(`/api/contests/register/${contestId}`);
      fetchContests();
      alert('Successfully registered for the contest! 🎉');
    } catch (error) {
      console.error("Registration error details:", error);
      const errorMsg = error.response?.data?.message || error.message || "Unknown error";
      alert(errorMsg);
    }
  };

  const isUserRegistered = (contest) => {
    return contest.participants?.some(p => p.user === user?._id || p.user?._id === user?._id);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      duration: 60,
      problems: [],
      mcqs: []
    });
  };

  const openEditModal = (contest) => {
    setSelectedContest(contest);
    setFormData({
      title: contest.title,
      description: contest.description,
      startTime: new Date(contest.startTime).toISOString().slice(0, 16),
      endTime: new Date(contest.endTime).toISOString().slice(0, 16),
      duration: contest.duration,
      problems: contest.problems?.map(p => ({
        problemId: p.problemId._id || p.problemId,
        points: p.points
      })) || [],
      mcqs: contest.mcqs || []
    });
    setShowCreateModal(true);
  };

  const addMcq = () => {
    setFormData({
      ...formData,
      mcqs: [
        ...formData.mcqs,
        { question: '', options: ['', '', '', ''], correctOption: 0, points: 50 }
      ]
    });
  };

  const updateMcq = (index, field, value) => {
    const updatedMcqs = [...formData.mcqs];
    if (field === 'options') {
      const { optIdx, optValue } = value;
      updatedMcqs[index].options[optIdx] = optValue;
    } else {
      updatedMcqs[index][field] = value;
    }
    setFormData({ ...formData, mcqs: updatedMcqs });
  };

  const removeMcq = (index) => {
    setFormData({
      ...formData,
      mcqs: formData.mcqs.filter((_, i) => i !== index)
    });
  };

  const addProblem = () => {
    setFormData({
      ...formData,
      problems: [
        ...formData.problems,
        { problemId: '', points: 100 }
      ]
    });
  };

  const updateProblem = (index, field, value) => {
    const updatedProblems = [...formData.problems];
    updatedProblems[index][field] = value;
    setFormData({ ...formData, problems: updatedProblems });
  };

  const removeProblem = (index) => {
    setFormData({
      ...formData,
      problems: formData.problems.filter((_, i) => i !== index)
    });
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'upcoming':
        return <span className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/50 text-xs font-medium rounded-full">Upcoming</span>;
      case 'live':
        return <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/50 text-xs font-medium rounded-full animate-pulse">Live Now</span>;
      case 'ended':
        return <span className="px-3 py-1 bg-gray-500/20 text-gray-400 border border-gray-500/50 text-xs font-medium rounded-full">Ended</span>;
      default:
        return null;
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-12">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-md border-b border-gray-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <Trophy className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Contest Arena</h1>
                <p className="text-gray-400 text-sm mt-1">Compete with the best and rise up the leaderboard</p>
              </div>
            </div>
            {isAdmin && (
              <button
                onClick={() => {
                  resetForm();
                  setShowCreateModal(true);
                }}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2 active:scale-95"
              >
                <Plus className="w-5 h-5" />
                Create Contest
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contests.map(contest => {
            const status = getContestStatus(contest);
            const userRegistered = isUserRegistered(contest);
            
            return (
              <div key={contest._id} className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-800 overflow-hidden hover:border-purple-500/30 transition-all group flex flex-col h-full">
                <div className="p-6 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-gray-800/50 rounded-lg border border-gray-700">
                      <Code className="w-5 h-5 text-purple-400" />
                    </div>
                    {getStatusBadge(status)}
                  </div>

                  <h2 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors line-clamp-1">{contest.title}</h2>
                  <p className="text-gray-400 text-sm mb-6 line-clamp-2 flex-grow">{contest.description}</p>
                  
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-sm text-gray-400 bg-gray-800/30 p-2 rounded-lg">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <span>{new Date(contest.startTime).toLocaleDateString()} at {new Date(contest.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-400 bg-gray-800/30 p-2 rounded-lg">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <span>{contest.duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-400 bg-gray-800/30 p-2 rounded-lg">
                      <Users className="w-4 h-4 text-purple-400" />
                      <span>{contest.participants?.length || 0} participants registered</span>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-800 flex items-center justify-between gap-4">
                    {isAdmin ? (
                      <div className="flex items-center gap-2 w-full">
                        <button
                          onClick={() => openEditModal(contest)}
                          className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition flex items-center justify-center gap-2 text-sm"
                        >
                          <Edit2 className="w-4 h-4" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteContest(contest._id)}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/contest/${contest._id}`)}
                          className="p-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg transition"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        {status === 'upcoming' && (
                          <div className="w-full space-y-3">
                            <div className="flex items-center justify-between px-2">
                              <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Starts in</span>
                              <span className="text-sm font-mono font-bold text-blue-400">{timers[contest._id] || '--:--:--'}</span>
                            </div>
                            {userRegistered ? (
                              <div className="w-full py-2.5 bg-green-500/10 text-green-400 rounded-xl border border-green-500/20 flex items-center justify-center gap-2 font-semibold">
                                <CheckCircle className="w-4 h-4" /> Registered
                              </div>
                            ) : (
                              <button
                                onClick={() => handleRegister(contest._id)}
                                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/20 transition-all active:scale-95"
                              >
                                Register Now
                              </button>
                            )}
                          </div>
                        )}
                        
                        {status === 'live' && (
                          <button 
                            onClick={() => navigate(`/contest/${contest._id}`)}
                            className={`w-full py-3 ${userRegistered ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'} text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 animate-pulse`}
                          >
                            {userRegistered ? 'Solve / Continue Contest' : 'Solve / Enter Contest'} <ChevronRight className="w-5 h-5" />
                          </button>
                        )}

                        {status === 'ended' && (
                          <button 
                            onClick={() => navigate(`/contest/${contest._id}`)}
                            className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                          >
                            {userRegistered ? 'View Your Results' : 'View Contest Results'}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {contests.length === 0 && (
          <div className="text-center py-24 bg-gray-900/20 rounded-3xl border-2 border-dashed border-gray-800">
            <div className="bg-gray-800/50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 border border-gray-700">
              <Code className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-400">No contests found</h3>
            <p className="text-gray-500 mt-2 max-w-sm mx-auto">New challenges are being prepared. Check back later for upcoming competitions!</p>
          </div>
        )}
      </div>

      {/* Create/Edit Contest Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-gray-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-800 shadow-2xl flex flex-col">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {selectedContest ? 'Edit Contest' : 'Create New Contest'}
                </h2>
                <p className="text-gray-400 text-sm">Fill in the details for the competition</p>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedContest(null);
                  resetForm();
                }}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-8 overflow-y-auto flex-grow custom-scrollbar">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Contest Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all placeholder-gray-700"
                    placeholder="e.g. Weekly Algorithm Challenge #1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all h-28 resize-none placeholder-gray-700"
                    placeholder="Describe what this contest is about..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Start Time</label>
                    <input
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-purple-500 transition-all [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">End Time</label>
                    <input
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-purple-500 transition-all [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Duration (mins)</label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-purple-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-6">
                  <label className="block text-sm font-semibold text-gray-400 uppercase tracking-wider">Contest Problems</label>
                  <button
                    onClick={addProblem}
                    className="text-sm px-4 py-2 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 rounded-lg font-bold flex items-center gap-2 transition-all"
                  >
                    <Plus className="w-4 h-4" /> Add Problem
                  </button>
                </div>
                
                <div className="space-y-4">
                  {formData.problems.map((problem, idx) => (
                    <div key={idx} className="bg-gray-950/50 p-5 rounded-2xl border border-gray-800 relative group/item">
                      <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="flex-grow w-full">
                          <label className="block text-[10px] font-bold text-gray-600 mb-1 uppercase">Problem #{idx + 1}</label>
                          <select
                            value={problem.problemId}
                            onChange={(e) => updateProblem(idx, 'problemId', e.target.value)}
                            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-sm focus:border-purple-500 outline-none text-white appearance-none cursor-pointer"
                          >
                            <option value="">Select Problem</option>
                            {availableProblems.map(p => (
                              <option key={p._id} value={p._id}>
                                {p.title} ({p.difficulty})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="w-full md:w-32">
                          <label className="block text-[10px] font-bold text-gray-600 mb-1 uppercase">Points</label>
                          <input
                            type="number"
                            value={problem.points}
                            onChange={(e) => updateProblem(idx, 'points', parseInt(e.target.value))}
                            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-sm outline-none text-white focus:border-purple-500"
                            placeholder="Points"
                          />
                        </div>
                        <button
                          onClick={() => removeProblem(idx)}
                          className="p-2.5 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all md:mt-4"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {formData.problems.length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed border-gray-800 rounded-2xl bg-gray-950/20">
                      <p className="text-gray-600 text-sm">No problems added to this contest</p>
                    </div>
                  )}
                </div>
              </div>

              {/* MCQ Section */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <label className="block text-sm font-semibold text-gray-400 uppercase tracking-wider">Theory Questions (MCQs)</label>
                  <button
                    onClick={addMcq}
                    className="text-sm px-4 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg font-bold flex items-center gap-2 transition-all"
                  >
                    <Plus className="w-4 h-4" /> Add MCQ
                  </button>
                </div>
                
                <div className="space-y-6">
                  {formData.mcqs.map((mcq, idx) => (
                    <div key={idx} className="bg-gray-950/50 p-6 rounded-2xl border border-gray-800 relative space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Question #{idx + 1}</span>
                        <button
                          onClick={() => removeMcq(idx)}
                          className="p-1.5 text-red-500/50 hover:text-red-500 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div>
                        <input
                          type="text"
                          value={mcq.question}
                          onChange={(e) => updateMcq(idx, 'question', e.target.value)}
                          className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-sm focus:border-blue-500 outline-none text-white"
                          placeholder="Type your theoretical question here..."
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {mcq.options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-700 w-4">{String.fromCharCode(65 + optIdx)}</span>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => updateMcq(idx, 'options', { optIdx, optValue: e.target.value })}
                              className={`flex-grow bg-gray-900 border ${mcq.correctOption === optIdx ? 'border-green-500/50' : 'border-gray-800'} rounded-lg px-3 py-1.5 text-xs outline-none text-white`}
                              placeholder={`Option ${optIdx + 1}`}
                            />
                            <input
                              type="radio"
                              name={`correct-${idx}`}
                              checked={mcq.correctOption === optIdx}
                              onChange={() => updateMcq(idx, 'correctOption', optIdx)}
                              className="accent-green-500"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 pt-2">
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] font-bold text-gray-600 uppercase">Points:</label>
                          <input
                            type="number"
                            value={mcq.points}
                            onChange={(e) => updateMcq(idx, 'points', parseInt(e.target.value))}
                            className="w-20 bg-gray-900 border border-gray-800 rounded-lg px-3 py-1 text-xs outline-none text-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {formData.mcqs.length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed border-gray-800 rounded-2xl bg-gray-950/20">
                      <p className="text-gray-600 text-sm">No theoretical questions added yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-gray-800 flex justify-end gap-4 bg-gray-900/50 backdrop-blur-md">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedContest(null);
                  resetForm();
                }}
                className="px-6 py-2.5 text-gray-400 hover:text-white font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={selectedContest ? handleUpdateContest : handleCreateContest}
                className="px-8 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold shadow-lg shadow-purple-500/20 transition-all active:scale-95"
              >
                {selectedContest ? 'Save Changes' : 'Create Contest'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Contest;
