import { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient';
import { NavLink } from 'react-router-dom';
import { PlusCircle, Upload, Trash2, Edit } from 'lucide-react'; // Importing new icons

const AdminVideo = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get('/problem/getAllProblem');
      setProblems(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch problems');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this problem? This action cannot be undone.')) return;

    try {
      await axiosClient.delete(`/video/delete/${id}`);
      setProblems(problems.filter((problem) => problem._id !== id));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete problem');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <span className="loading loading-spinner loading-lg text-green-500"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error shadow-lg my-8 mx-auto max-w-2xl bg-red-900/30 text-red-300 border-red-500 rounded-lg">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Error: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-gray-100 p-6 sm:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10 bg-gradient-to-r from-gray-800 to-gray-900 p-6 rounded-2xl shadow-lg border-b border-gray-700">
          <h1 className="text-4xl font-extrabold text-green-400 mb-4 sm:mb-0">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-400">
              Manage Video Resources
            </span>
          </h1>
          <NavLink
            to="/admin/add-video" // Assuming you have an add video page
            className="btn bg-gradient-to-r from-green-500 to-blue-500 text-white border-none hover:from-green-600 hover:to-blue-600 shadow-lg group"
          >
            <PlusCircle className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add New Video
          </NavLink>
        </div>

        {problems.length === 0 ? (
          <div className="text-center p-12 bg-gray-800 rounded-2xl shadow-xl text-gray-400 border border-gray-700">
            <p className="text-2xl font-semibold mb-4">No video problems found.</p>
            <p className="text-lg">Click "Add New Video" to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {problems.map((problem) => (
              <div
                key={problem._id}
                className="relative group bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-700 hover:border-green-500 transform hover:-translate-y-1"
              >
                {/* Optional: Glowing border on hover */}
                <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-green-500 group-hover:opacity-75 transition-all duration-300 pointer-events-none" />

                <div className="card-body p-6 flex flex-col h-full">
                  <h2 className="card-title text-2xl font-bold text-blue-300 mb-3 leading-tight group-hover:text-green-300 transition-colors duration-300">
                    {problem.title}
                  </h2>

                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm font-medium text-gray-400">Difficulty:</span>
                    <div className={`badge text-sm py-2 px-3 font-semibold ${
                      problem.difficulty === 'Easy'
                        ? 'bg-green-600 text-white border-green-700'
                        : problem.difficulty === 'Medium'
                          ? 'bg-yellow-600 text-white border-yellow-700'
                          : 'bg-red-600 text-white border-red-700'
                    } rounded-full`}>
                      {problem.difficulty}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-5">
                    <span className="text-sm font-medium text-gray-400">Tags:</span>
                    {problem.tags && problem.tags.split(',').map((tag, i) => (
                      <span key={i} className="badge badge-outline border-blue-500 text-blue-300 text-xs p-2 rounded-full hover:bg-blue-900 transition-colors duration-200">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto card-actions justify-end space-x-3">
                     {/* Edit Button - Assuming an edit page */}
                    <NavLink
                      to={`/admin/edit-video/${problem._id}`}
                      className="btn btn-ghost btn-circle text-gray-400 hover:text-yellow-400 hover:bg-gray-700 transition-colors duration-200"
                      title="Edit Problem"
                    >
                      <Edit className="h-5 w-5" />
                    </NavLink>

                    <NavLink
                      to={`/admin/upload/${problem._id}`}
                      className="btn btn-ghost btn-circle text-gray-400 hover:text-green-400 hover:bg-gray-700 transition-colors duration-200"
                      title="Upload Video"
                    >
                      <Upload className="h-5 w-5" />
                    </NavLink>
                    <button
                      onClick={() => handleDelete(problem._id)}
                      className="btn btn-ghost btn-circle text-gray-400 hover:text-red-500 hover:bg-gray-700 transition-colors duration-200"
                      title="Delete Problem"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVideo;