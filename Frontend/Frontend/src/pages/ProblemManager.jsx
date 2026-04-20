import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axiosClient from '../utils/axiosClient';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../authSlice';
import { CheckCircle, Circle } from 'lucide-react';
import Loader from '../components/Loader';

const ProblemManager = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/getAllProblem');
      setProblems(response.data);
    } catch (error) {
      console.error('Failed to fetch problems:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const handleUpdateProblem = async (id) => {
    try {
      await axiosClient.put(`/update/${id}`, { title: editTitle });
      setEditId(null);
      setEditTitle('');
      fetchProblems();
    } catch (error) {
      console.error('Failed to update problem:', error);
    }
  };

  const handleDeleteProblem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this problem?")) return;
    try {
      await axiosClient.delete(`/delete/${id}`);
      fetchProblems();
    } catch (error) {
      console.error('Failed to delete problem:', error);
    }
  };

  const difficultyStyles = {
    Easy: 'bg-green-500/10 text-green-400',
    Medium: 'bg-yellow-500/10 text-yellow-400',
    Hard: 'bg-red-500/10 text-red-400',
  };

  const getStatusIcon = (status) => {
    return status === 'Solved' ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <Circle className="w-5 h-5 text-gray-500" />
    );
  };

  if (loading) return <Loader />;

  return (
    <div className="bg-gray-800 shadow-lg rounded-lg overflow-x-auto border border-gray-700">
      {problems.length === 0 ? (
        <div className="text-center py-12 px-6">
          <h3 className="text-xl font-semibold text-white">No Problems Found</h3>
          <p className="mt-1 text-sm text-gray-400">Try adjusting your filter criteria.</p>
        </div>
      ) : (
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="text-xs uppercase bg-gray-700 text-gray-400">
            <tr>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Difficulty</th>
              <th className="px-6 py-4">Topics</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((problem) => (
              <tr key={problem._id} className="border-b border-gray-700 hover:bg-gray-700/50">
                <td className="px-6 py-4" title={problem.status}>
                  {getStatusIcon(problem.status)}
                </td>
                <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                  {editId === problem._id ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="bg-gray-700 border border-gray-600 text-white px-2 py-1 rounded focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <NavLink to={`/problem/${problem._id}`} className="hover:text-orange-400 transition-colors">
                      {problem.title}
                    </NavLink>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${difficultyStyles[problem.difficulty]}`}>
                    {problem.difficulty}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {problem.tags.map((tag) => (
                      <span key={tag} className="bg-gray-700/50 px-2 py-0.5 text-xs rounded text-gray-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 space-x-2">
                  {editId === problem._id ? (
                    <>
                      <button
                        onClick={() => handleUpdateProblem(problem._id)}
                        className="text-green-500 hover:underline"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditId(null);
                          setEditTitle('');
                        }}
                        className="text-gray-500 hover:underline"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditId(problem._id);
                          setEditTitle(problem.title);
                        }}
                        className="text-blue-500 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProblem(problem._id)}
                        className="text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ProblemManager;
