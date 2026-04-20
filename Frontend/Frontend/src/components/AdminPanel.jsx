
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../utils/axiosClient';
import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import {
  PlusCircle, Trash2, X, ArrowRight,
  FileJson, Code, List, Tag, Building,
  Lightbulb, AlertCircle, MessageSquare,
  CheckCircle, FileText, Cpu, Zap, Mail, Lock, User, Eye, EyeOff
} from 'lucide-react';

// Zod schema matching the problem schema
const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.enum(['array', 'linkedList', 'graph', 'dp']),
  visibleTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required'),
      explanation: z.string().min(1, 'Explanation is required')
    })
  ).min(1, 'At least one visible test case required'),
  hiddenTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required')
    })
  ).min(1, 'At least one hidden test case required'),
  startCode: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      initialCode: z.string().min(1, 'Initial code is required')
    })
  ).length(3, 'All three languages required'),
  referenceSolution: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      completeCode: z.string().min(1, 'Complete code is required')
    })
  ).length(3, 'All three languages required')
});

function AdminPanel() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();
  const [successMessage, setSuccessMessage] = useState('');

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      startCode: [
        { language: 'C++', initialCode: '' },
        { language: 'Java', initialCode: '' },
        { language: 'JavaScript', initialCode: '' }
      ],
      referenceSolution: [
        { language: 'C++', completeCode: '' },
        { language: 'Java', completeCode: '' },
        { language: 'JavaScript', completeCode: '' }
      ],
      tags: 'array'
    }
  });

  const {
    fields: visibleFields,
    append: appendVisible,
    remove: removeVisible
  } = useFieldArray({
    control,
    name: 'visibleTestCases'
  });

  const {
    fields: hiddenFields,
    append: appendHidden,
    remove: removeHidden
  } = useFieldArray({
    control,
    name: 'hiddenTestCases'
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await axiosClient.post('/problem/create', data);
      setIsSubmitting(false);
      setSuccessMessage('Problem created successfully!');
      setShowConfetti(true);

      // Show confetti for 5 seconds then navigate
      setTimeout(() => {
        setShowConfetti(false);
        navigate('/admin');
      }, 5000);
    } catch (error) {
      setIsSubmitting(false);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  // Classname definitions - Adapted from the Signup component
  const inputBaseClasses = "w-full pl-10 pr-3 py-2 bg-transparent border-b border-gray-600 focus:border-green-400 text-gray-100 placeholder-gray-500 outline-none";
  const labelClasses = "block text-sm font-medium mb-2 text-gray-300 flex items-center"; // Adjusted for icon
  const sectionClasses = "relative group rounded-2xl transition-all duration-300"; // For the outer card effect
  const innerSectionClasses = "relative bg-gradient-to-br from-gray-900/80 to-black/60 rounded-2xl shadow-xl p-10 flex flex-col justify-center transition";
  const sectionTitleClasses = "text-3xl font-extrabold text-center text-gray-100 mb-8"; // Adapted for center
  const subCardClasses = "p-6 bg-gray-800/70 rounded-xl border border-gray-700 transition-all duration-300 hover:border-purple-600/50"; // Slightly different background
  const errorClasses = "text-red-400 text-xs mt-1 flex items-center";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black px-4 py-8">
      {showConfetti && (
        <div className="fixed inset-0 z-50">
          <Confetti
            width={width}
            height={height}
            numberOfPieces={200}
            recycle={false}
            gravity={0.3}
          />
          <div className="flex items-center justify-center h-full">
            <div className="text-center bg-gray-900 p-8 rounded-2xl shadow-2xl transform scale-110 transition-all duration-500 border border-purple-600/30">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-green-500 mb-2">Success!</h2>
              <p className="text-lg text-gray-300">{successMessage}</p>
              <p className="text-gray-400 mt-2">Redirecting in a few seconds...</p>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl">
        {/* Admin Panel Card */}
        <div className={sectionClasses}>
          <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-purple-600 group-hover:animate-pulseBorder pointer-events-none" />

          <div className={innerSectionClasses}>
            <h1 className={sectionTitleClasses}>
              Create New Problem
            </h1>
            <p className="text-gray-400 text-center mb-8">Design a coding challenge for the platform</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className={subCardClasses}>
                <h2 className="text-xl font-bold text-gray-200 mb-6 flex items-center border-b border-gray-700 pb-4">
                  <List size={24} className="text-orange-400 mr-3" />
                  Basic Information
                </h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Title */}
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 text-orange-400" size={20} />
                      <input
                        {...register('title')}
                        className={`${inputBaseClasses} ${errors.title ? 'border-red-500' : ''}`}
                        placeholder="Problem Title"
                      />
                      {errors.title && (
                        <p className={errorClasses}>
                          <AlertCircle size={14} className="mr-1" />
                          {errors.title.message}
                        </p>
                      )}
                    </div>

                    {/* Difficulty */}
                    <div className="relative">
                      <Tag className="absolute left-3 top-3 text-orange-400" size={20} />
                      <select
                        {...register('difficulty')}
                        className={`${inputBaseClasses} appearance-none ${errors.difficulty ? 'border-red-500' : ''}`}
                      >
                        <option value="easy" className="bg-gray-800 text-green-500">Easy</option>
                        <option value="medium" className="bg-gray-800 text-yellow-500">Medium</option>
                        <option value="hard" className="bg-gray-800 text-red-500">Hard</option>
                      </select>
                      {errors.difficulty && (
                        <p className={errorClasses}>
                          <AlertCircle size={14} className="mr-1" />
                          {errors.difficulty.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 text-orange-400" size={20} />
                    <textarea
                      {...register('description')}
                      className={`${inputBaseClasses} min-h-[120px] pt-3 pl-10 ${errors.description ? 'border-red-500' : ''}`}
                      placeholder="Detailed problem description..."
                    />
                    {errors.description && (
                      <p className={errorClasses}>
                        <AlertCircle size={14} className="mr-1" />
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  {/* Tag */}
                  <div className="relative">
                    <Building className="absolute left-3 top-3 text-orange-400" size={20} />
                    <select
                      {...register('tags')}
                      className={`${inputBaseClasses} appearance-none ${errors.tags ? 'border-red-500' : ''}`}
                    >
                      <option value="array" className="bg-gray-800 text-gray-300">Array</option>
                      <option value="linkedList" className="bg-gray-800 text-gray-300">Linked List</option>
                      <option value="graph" className="bg-gray-800 text-gray-300">Graph</option>
                      <option value="dp" className="bg-gray-800 text-gray-300">Dynamic Programming</option>
                    </select>
                    {errors.tags && (
                      <p className={errorClasses}>
                        <AlertCircle size={14} className="mr-1" />
                        {errors.tags.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Test Cases */}
              <div className={subCardClasses}>
                <h2 className="text-xl font-bold text-gray-200 mb-6 flex items-center border-b border-gray-700 pb-4">
                  <FileJson size={24} className="text-orange-400 mr-3" />
                  Test Cases
                </h2>

                {/* Visible Test Cases */}
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-lg text-gray-300 flex items-center">
                      <Zap size={20} className="mr-2 text-blue-400" />
                      Visible Test Cases
                      <span className="text-xs font-normal bg-blue-700/30 text-blue-300 px-2 py-1 rounded-full ml-3">
                        For basic checks
                      </span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => appendVisible({ input: '', output: '', explanation: '' })}
                      className="py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition disabled:opacity-50 flex items-center"
                    >
                      <PlusCircle size={16} className="mr-1" />
                      Add Case
                    </button>
                  </div>

                  {visibleFields.map((field, index) => (
                    <div key={field.id} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 shadow-inner">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-medium text-gray-300 flex items-center">
                          <FileText size={16} className="mr-2 text-green-400" />
                          Case {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeVisible(index)}
                          className="p-2 text-red-400 hover:bg-red-400/20 rounded-full transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                          <Lightbulb className="absolute left-3 top-3 text-gray-500" size={20} />
                          <input
                            {...register(`visibleTestCases.${index}.input`)}
                            placeholder="Test case input"
                            className={`${inputBaseClasses} ${errors.visibleTestCases?.[index]?.input ? 'border-red-500' : ''}`}
                          />
                          {errors.visibleTestCases?.[index]?.input && (
                            <p className={errorClasses}>
                              <AlertCircle size={14} className="mr-1" />
                              {errors.visibleTestCases[index].input.message}
                            </p>
                          )}
                        </div>

                        <div className="relative">
                          <CheckCircle className="absolute left-3 top-3 text-gray-500" size={20} />
                          <input
                            {...register(`visibleTestCases.${index}.output`)}
                            placeholder="Expected output"
                            className={`${inputBaseClasses} ${errors.visibleTestCases?.[index]?.output ? 'border-red-500' : ''}`}
                          />
                          {errors.visibleTestCases?.[index]?.output && (
                            <p className={errorClasses}>
                              <AlertCircle size={14} className="mr-1" />
                              {errors.visibleTestCases[index].output.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 relative">
                        <MessageSquare className="absolute left-3 top-3 text-gray-500" size={20} />
                        <textarea
                          {...register(`visibleTestCases.${index}.explanation`)}
                          placeholder="Explanation of test case"
                          className={`${inputBaseClasses} pt-3 pl-10 ${errors.visibleTestCases?.[index]?.explanation ? 'border-red-500' : ''}`}
                          rows={2}
                        />
                        {errors.visibleTestCases?.[index]?.explanation && (
                          <p className={errorClasses}>
                            <AlertCircle size={14} className="mr-1" />
                            {errors.visibleTestCases[index].explanation.message}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Hidden Test Cases */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-lg text-gray-300 flex items-center">
                      <Cpu size={20} className="mr-2 text-purple-400" />
                      Hidden Test Cases
                      <span className="text-xs font-normal bg-purple-700/30 text-purple-300 px-2 py-1 rounded-full ml-3">
                        Used for judging
                      </span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => appendHidden({ input: '', output: '' })}
                      className="py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition disabled:opacity-50 flex items-center"
                    >
                      <PlusCircle size={16} className="mr-1" />
                      Add Case
                    </button>
                  </div>

                  {hiddenFields.map((field, index) => (
                    <div key={field.id} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 shadow-inner">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-medium text-gray-300 flex items-center">
                          <FileText size={16} className="mr-2 text-green-400" />
                          Hidden Case {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeHidden(index)}
                          className="p-2 text-red-400 hover:bg-red-400/20 rounded-full transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                          <Lightbulb className="absolute left-3 top-3 text-gray-500" size={20} />
                          <input
                            {...register(`hiddenTestCases.${index}.input`)}
                            placeholder="Test case input"
                            className={`${inputBaseClasses} ${errors.hiddenTestCases?.[index]?.input ? 'border-red-500' : ''}`}
                          />
                          {errors.hiddenTestCases?.[index]?.input && (
                            <p className={errorClasses}>
                              <AlertCircle size={14} className="mr-1" />
                              {errors.hiddenTestCases[index].input.message}
                            </p>
                          )}
                        </div>

                        <div className="relative">
                          <CheckCircle className="absolute left-3 top-3 text-gray-500" size={20} />
                          <input
                            {...register(`hiddenTestCases.${index}.output`)}
                            placeholder="Expected output"
                            className={`${inputBaseClasses} ${errors.hiddenTestCases?.[index]?.output ? 'border-red-500' : ''}`}
                          />
                          {errors.hiddenTestCases?.[index]?.output && (
                            <p className={errorClasses}>
                              <AlertCircle size={14} className="mr-1" />
                              {errors.hiddenTestCases[index].output.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Code Templates */}
              <div className={subCardClasses}>
                <h2 className="text-xl font-bold text-gray-200 mb-6 flex items-center border-b border-gray-700 pb-4">
                  <Code size={24} className="text-orange-400 mr-3" />
                  Code Templates
                </h2>

                <div className="space-y-8">
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="p-6 bg-gray-900/50 rounded-xl border border-gray-700 shadow-inner">
                      <h3 className="font-medium text-lg text-orange-400 flex items-center mb-4">
                        <Code size={18} className="mr-2" />
                        {index === 0 ? 'C++' : index === 1 ? 'Java' : 'JavaScript'}
                      </h3>

                      <div className="form-control mb-6">
                        <label className={labelClasses}>
                          <Lightbulb size={16} className="mr-2 text-gray-500" />
                          Initial Code
                        </label>
                        <div className="bg-black/60 p-4 rounded-lg border border-gray-700">
                          <textarea
                            {...register(`startCode.${index}.initialCode`)}
                            className="w-full bg-transparent font-mono text-white text-sm outline-none resize-y"
                            rows={6}
                            placeholder={`Enter initial code for ${index === 0 ? 'C++' : index === 1 ? 'Java' : 'JavaScript'}...`}
                          />
                        </div>
                        {errors.startCode?.[index]?.initialCode && (
                          <p className={errorClasses}>
                            <AlertCircle size={14} className="mr-1" />
                            {errors.startCode[index].initialCode.message}
                          </p>
                        )}
                      </div>

                      <div className="form-control">
                        <label className={labelClasses}>
                          <CheckCircle size={16} className="mr-2 text-gray-500" />
                          Reference Solution
                        </label>
                        <div className="bg-black/60 p-4 rounded-lg border border-gray-700">
                          <textarea
                            {...register(`referenceSolution.${index}.completeCode`)}
                            className="w-full bg-transparent font-mono text-white text-sm outline-none resize-y"
                            rows={6}
                            placeholder={`Enter solution code for ${index === 0 ? 'C++' : index === 1 ? 'Java' : 'JavaScript'}...`}
                          />
                        </div>
                        {errors.referenceSolution?.[index]?.completeCode && (
                          <p className={errorClasses}>
                            <AlertCircle size={14} className="mr-1" />
                            {errors.referenceSolution[index].completeCode.message}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={`w-full py-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center ${isSubmitting ? 'cursor-not-allowed' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner mr-2"></span>
                    Creating Problem...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} className="mr-2" />
                    Create Problem
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulseBorder {
          0% { border-width: 3px; border-color: rgba(147, 51, 234, 0.4); }
          50% { border-width: 3px; border-color: rgba(147, 51, 234, 1); }
          100% { border-width: 3px; border-color: rgba(147, 51, 234, 0.4); }
        }
        .animate-pulseBorder {
          animation: pulseBorder 2s infinite;
        }
        /* Custom styling for select dropdown arrow */
        select.appearance-none {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='white'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          background-size: 1.5em 1.5em;
          padding-right: 2.5rem;
        }
      `}</style>
    </div>
  );
}

export default AdminPanel;