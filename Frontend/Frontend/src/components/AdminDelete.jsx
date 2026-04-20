// import { useEffect, useState } from 'react';
// import axiosClient from '../utils/axiosClient'

// const AdminDelete = () => {
//   const [problems, setProblems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);


//   useEffect(() => {
//     fetchProblems();
//   }, []);

//   const fetchProblems = async () => {
//     try {
//       setLoading(true);
//       const { data } = await axiosClient.get('/problem/getAllProblem');
//       setProblems(data);
//     } catch (err) {
//       setError('Failed to fetch problems');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this problem?')) return;
    
//     try {
//       await axiosClient.delete(`/problem/delete/${id}`);
//       setProblems(problems.filter(problem => problem._id !== id));
//     } catch (err) {
//       setError('Failed to delete problem');
//       console.error(err);
//     }
//   };


//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <span className="loading loading-spinner loading-lg"></span>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="alert alert-error shadow-lg my-4">
//         <div>
//           <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
//           </svg>
//           <span>{error}</span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto p-4">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">Delete Problems</h1>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="table table-zebra w-full">
//           <thead>
//             <tr>
//               <th className="w-1/12">#</th>
//               <th className="w-4/12">Title</th>
//               <th className="w-2/12">Difficulty</th>
//               <th className="w-3/12">Tags</th>
//               <th className="w-2/12">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {problems.map((problem, index) => (
//               <tr key={problem._id}>
//                 <th>{index + 1}</th>
//                 <td>{problem.title}</td>
//                 <td>
//                   <span className={`badge ${
//                     problem.difficulty === 'Easy' 
//                       ? 'badge-success' 
//                       : problem.difficulty === 'Medium' 
//                         ? 'badge-warning' 
//                         : 'badge-error'
//                   }`}>
//                     {problem.difficulty}
//                   </span>
//                 </td>
//                 <td>
//                   <span className="badge badge-outline">
//                     {problem.tags}
//                   </span>
//                 </td>
//                 <td>
//                   <div className="flex space-x-2">
//                     <button 
//                       onClick={() => handleDelete(problem._id)}
//                       className="btn btn-sm btn-error"
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default AdminDelete;




import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../utils/axiosClient';
import { Edit, Trash2, PlusCircle } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal'; // Import the modal

// Helper component for styled difficulty badges
const DifficultyBadge = ({ difficulty }) => {
  // Normalize difficulty string for consistent matching
  const lowerDifficulty = difficulty.toLowerCase();
  
  const colorClasses = {
    easy: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    hard: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  };

  // Select class based on normalized difficulty, default to a gray badge
  const badgeClass = colorClasses[lowerDifficulty] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${badgeClass}`}>
      {difficulty}
    </span>
  );
};

const AdminDelete = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [problemToDelete, setProblemToDelete] = useState(null);

  // --- Data Fetching and Handlers ---
  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get('/problem/getAllProblem');
      setProblems(data);
    } catch (err) {
      setError('Failed to fetch problems. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // --- Modal and Delete Logic ---
  const openDeleteModal = (id) => {
    setProblemToDelete(id);
    setIsModalOpen(true);
  };

  const closeDeleteModal = () => {
    setProblemToDelete(null);
    setIsModalOpen(false);
  };

  const handleDeleteProblem = async () => {
    if (!problemToDelete) return;
    
    try {
      await axiosClient.delete(`/problem/delete/${problemToDelete}`);
      // Update state optimistically for a faster UI response
      setProblems(problems.filter(p => p._id !== problemToDelete));
    } catch (err) {
      setError('Failed to delete the problem.');
      console.error(err);
    } finally {
      closeDeleteModal();
    }
  };

  // --- Render Logic ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg text-orange-500"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error shadow-lg my-4">
        <span>{error}</span>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-[#1E293B] p-6 rounded-xl border border-[#E2E8F0] dark:border-[#334155] shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">Problem Library</h2>
          <button
            onClick={() => navigate('/admin/create')} // Adjust the route as needed
            className="flex items-center space-x-2 bg-[#F97316] hover:bg-[#FB923C] text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <PlusCircle size={20} />
            <span>Add New Problem</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-[#F1F5F9] dark:bg-[#0F172A] text-[#64748B] dark:text-[#94A3B8] tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">#</th>
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold">Difficulty</th>
                <th className="px-6 py-4 font-semibold">Tag</th>
                <th className="px-6 py-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {problems.map((problem, index) => (
                <tr
                  key={problem._id}
                  className="border-b border-[#E2E8F0] dark:border-[#334155] hover:bg-[#F1F5F9] dark:hover:bg-[#0F172A]/50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 font-medium text-slate-500 dark:text-gray-400">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 font-medium whitespace-nowrap text-[#0F172A] dark:text-[#F8FAFC]">
                    {problem.title}
                  </td>
                  <td className="px-6 py-4">
                    <DifficultyBadge difficulty={problem.difficulty} />
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded dark:bg-blue-900 dark:text-blue-300">
                      {problem.tags}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => navigate(`/admin/update/${problem._id}`)} // Route to your update form
                      className="p-2 rounded-md text-[#64748B] dark:text-[#94A3B8] hover:text-blue-500 hover:bg-blue-500/10 transition-colors"
                      title="Edit Problem"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => openDeleteModal(problem._id)}
                      className="p-2 rounded-md text-[#64748B] dark:text-[#94A3B8] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      title="Delete Problem"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteProblem}
        title="Delete Problem"
        message="Are you sure you want to delete this problem? This action is permanent and cannot be undone."
      />
    </>
  );
};

export default AdminDelete;