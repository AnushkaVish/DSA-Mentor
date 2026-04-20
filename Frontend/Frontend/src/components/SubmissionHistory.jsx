import { useState, useEffect } from 'react';
import axiosClient from '../utils/axiosClient';

const SubmissionHistory = ({ problemId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get(`/problem/submittedProblem/${problemId}`);
        // Sort submissions by createdAt in descending order (newest first)
        const sortedSubmissions = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setSubmissions(sortedSubmissions);
        setError(null);
      } catch (err) {
        setError('Failed to fetch submission history');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [problemId]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'bg-green-600 text-white'; // Darker green for better contrast
      case 'wrong': return 'bg-red-500 text-white'; // Darker red
      case 'error': return 'bg-yellow-500 text-white'; // Darker yellow
      case 'pending': return 'bg-purple-600 text-white'; // Purple for pending
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted': 
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>;
      case 'wrong': 
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>;
      case 'error': 
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>;
      case 'pending': 
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 animate-spin" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>;
      default: 
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>;
    }
  };

  const formatMemory = (memory) => {
    if (memory < 1024) return `${memory.toFixed(2)} KB`;
    return `${(memory / 1024).toFixed(2)} MB`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-800 rounded-lg shadow-lg">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-400"></div>
        <p className="ml-4 text-white text-lg font-semibold">Loading Submissions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900 border-l-4 border-red-700 p-4 rounded-md shadow-lg my-4 text-white">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-900 min-h-screen">
      <h2 className="text-4xl font-extrabold mb-10 text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-purple-600 drop-shadow-lg">
        Previous Submissions
      </h2>
      
      {submissions.length === 0 ? (
        <div className="bg-gradient-to-r from-green-800 to-purple-800 border border-green-600 rounded-xl p-8 text-center shadow-2xl">
          <svg className="h-16 w-16 text-green-300 mx-auto mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-2xl font-bold text-white mb-3">No submissions yet</h3>
          <p className="text-green-200 text-lg">Submit your solution to see it appear here and track your progress!</p>
        </div>
      ) : (
        <>
          <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-green-300 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-green-300 uppercase tracking-wider">Test Cases</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-green-300 uppercase tracking-wider">Runtime</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-green-300 uppercase tracking-wider">Memory</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-green-300 uppercase tracking-wider">Submitted</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-green-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {submissions.map((sub) => (
                    <tr key={sub._id} className="hover:bg-gray-700 transition-colors duration-200 ease-in-out cursor-pointer" onClick={() => setSelectedSubmission(sub)}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(sub.status)} shadow-md`}>
                          {getStatusIcon(sub.status)}
                          <span className="font-semibold">{sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-purple-300">
                        <span className="font-bold text-green-400">{sub.testCasesPassed}</span>
                        <span className="text-gray-500"> / </span>
                        <span>{sub.testCasesTotal}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-green-400">{sub.runtime}s</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-purple-300">{formatMemory(sub.memory)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{formatDate(sub.createdAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button 
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-500 to-purple-600 hover:from-green-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-md transition-all duration-200"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click from firing
                            setSelectedSubmission(sub);
                          }}
                        >
                          View Code
                          <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 -mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0l-7 7M20 4L13 11" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="mt-8 text-md text-gray-400 text-center font-light">
            Displaying <span className="font-semibold text-green-300">{submissions.length}</span> submission{submissions.length !== 1 ? 's' : ''}.
          </p>
        </>
      )}

      {/* Code View Modal */}
      {selectedSubmission && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-900 opacity-75" onClick={() => setSelectedSubmission(null)}></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full border border-gray-700">
              <div className="bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-2xl leading-6 font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-purple-500 mb-4">
                      Submission Details: <span className="text-green-300">{selectedSubmission.language}</span>
                    </h3>
                    
                    <div className="mt-4 mb-6">
                      <div className="flex flex-wrap gap-3 mb-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedSubmission.status)} shadow-md`}>
                          {getStatusIcon(selectedSubmission.status)}
                          <span className="font-semibold">{selectedSubmission.status.charAt(0).toUpperCase() + selectedSubmission.status.slice(1)}</span>
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-700 text-gray-200">
                          <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Runtime: <span className="ml-1 text-green-300">{selectedSubmission.runtime}s</span>
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-700 text-gray-200">
                          <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                          </svg>
                          Memory: <span className="ml-1 text-purple-300">{formatMemory(selectedSubmission.memory)}</span>
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-700 text-gray-200">
                          <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Passed: <span className="ml-1 text-green-300">{selectedSubmission.testCasesPassed}</span>/<span className="text-gray-400">{selectedSubmission.testCasesTotal}</span>
                        </span>
                      </div>
                      
                      {selectedSubmission.errorMessage && (
                        <div className="bg-red-800 border-l-4 border-red-600 p-4 rounded-md shadow-inner">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-red-200">{selectedSubmission.errorMessage}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-gray-900 rounded-lg p-5 mb-4 shadow-inner">
                      <pre className="overflow-x-auto text-green-300 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                        <code>{selectedSubmission.code}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
                <button 
                  type="button" 
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-gray-600 text-base font-medium text-white hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
                  onClick={() => setSelectedSubmission(null)}
                >
                  Close
                  <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionHistory;