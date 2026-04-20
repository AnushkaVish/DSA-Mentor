import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300">
      <div className="bg-white dark:bg-[#1E293B] rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all duration-300 scale-95 animate-scale-in">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-[#334155] pb-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
            <AlertTriangle className="text-red-500 mr-2" size={20} />
            {title}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={24} />
          </button>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-[#334155] dark:text-gray-200 dark:hover:bg-[#475569] font-semibold transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition"
          >
            Confirm Delete
          </button>
        </div>
      </div>
      <style jsx>{`
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ConfirmationModal;