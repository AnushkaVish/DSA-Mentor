import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../utils/axiosClient';
import { useNavigate, useParams } from 'react-router-dom'; // Ensure it's 'react-router-dom'
import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import {
  PlusCircle, Trash2,
  FileJson, Code, List,
  AlertCircle,
  CheckCircle, FileText, Cpu, Zap, Edit
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
  ).min(1, 'At least one visible test case is required'),
  hiddenTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required')
    })
  ).min(1, 'At least one hidden test case is required'),
  startCode: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      initialCode: z.string().min(1, 'Initial code is required')
    })
  ).length(3, 'All three languages are required'),
  referenceSolution: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      completeCode: z.string().min(1, 'Complete code is required')
    })
  ).length(3, 'All three languages are required')
});

function UpdateProblem() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();
  const [successMessage, setSuccessMessage] = useState('');

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      title: '',
      description: '',
      difficulty: 'easy',
      tags: 'array',
      visibleTestCases: [],
      hiddenTestCases: [],
      startCode: [
        { language: 'C++', initialCode: '' },
        { language: 'Java', initialCode: '' },
        { language: 'JavaScript', initialCode: '' }
      ],
      referenceSolution: [
        { language: 'C++', completeCode: '' },
        { language: 'Java', completeCode: '' },
        { language: 'JavaScript', completeCode: '' }
      ]
    }
  });

  useEffect(() => {
    const fetchProblemData = async () => {
      try {
        const response = await axiosClient.get(`/problem/get/${id}`);
        reset(response.data);
      } catch (error) {
        alert(`Error fetching problem data: ${error.response?.data?.message || error.message}`);
        // CORRECT: Navigate back to the list page on error
        navigate('/admin/update');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProblemData();
  }, [id, reset, navigate]);

  const {
    fields: visibleFields,
    append: appendVisible,
    remove: removeVisible
  } = useFieldArray({ control, name: 'visibleTestCases' });

  const {
    fields: hiddenFields,
    append: appendHidden,
    remove: removeHidden
  } = useFieldArray({ control, name: 'hiddenTestCases' });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await axiosClient.put(`/problem/update/${id}`, data);
      setSuccessMessage('Problem updated successfully!');
      setShowConfetti(true);

      setTimeout(() => {
        setShowConfetti(false);
        // CORRECT: Navigate back to the list page on success
        navigate('/admin/update');
      }, 5000);
    } catch (error) {
      alert(`Error updating problem: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBaseClasses = "w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500/50 outline-none transition duration-200 placeholder:text-gray-500/60 dark:placeholder:text-gray-400/60";
  const labelClasses = "block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300";
  const sectionClasses = "bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300";
  const sectionTitleClasses = "flex items-center space-x-3 text-xl font-bold border-b border-gray-200 dark:border-gray-800 pb-4 mb-6 text-gray-900 dark:text-white";
  const subCardClasses = "p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:border-orange-500/30";
  const errorClasses = "text-red-500 text-sm mt-2 flex items-center";

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-orange-500"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      {showConfetti && (
        <div className="fixed inset-0 z-50">
          <Confetti width={width} height={height} numberOfPieces={200} recycle={false} gravity={0.3} />
          <div className="flex items-center justify-center h-full">
            <div className="text-center bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-green-600 mb-2">Success!</h2>
              <p className="text-lg text-gray-700 dark:text-gray-300">{successMessage}</p>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Redirecting in a few seconds...</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-orange-500 mb-2">
            Update Problem
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Edit the details of the coding challenge</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* The entire form structure is identical to AdminPanel and is intentionally omitted here for brevity, but it should be the same as the previous correct version */}
           {/* Basic Information */}
           <div className={sectionClasses}>
                <h2 className={sectionTitleClasses}>
                    <List size={24} className="text-orange-500" />
                    <span>Basic Information</span>
                </h2>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelClasses}>Title</label>
                            <input {...register('title')} className={`${inputBaseClasses} ${errors.title ? 'border-red-500' : ''}`} placeholder="Problem Title" />
                            {errors.title && <p className={errorClasses}><AlertCircle size={16} className="mr-1" />{errors.title.message}</p>}
                        </div>
                        <div>
                            <label className={labelClasses}>Difficulty</label>
                            <select {...register('difficulty')} className={`${inputBaseClasses} ${errors.difficulty ? 'border-red-500' : ''}`}>
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                            {errors.difficulty && <p className={errorClasses}><AlertCircle size={16} className="mr-1" />{errors.difficulty.message}</p>}
                        </div>
                    </div>
                    <div>
                        <label className={labelClasses}>Description</label>
                        <textarea {...register('description')} className={`${inputBaseClasses} min-h-[120px] ${errors.description ? 'border-red-500' : ''}`} placeholder="Detailed problem description..." />
                        {errors.description && <p className={errorClasses}><AlertCircle size={16} className="mr-1" />{errors.description.message}</p>}
                    </div>
                    <div>
                        <label className={labelClasses}>Tag</label>
                        <select {...register('tags')} className={`${inputBaseClasses} ${errors.tags ? 'border-red-500' : ''}`}>
                            <option value="array">Array</option>
                            <option value="linkedList">Linked List</option>
                            <option value="graph">Graph</option>
                            <option value="dp">Dynamic Programming</option>
                        </select>
                        {errors.tags && <p className={errorClasses}><AlertCircle size={16} className="mr-1" />{errors.tags.message}</p>}
                    </div>
                </div>
            </div>

            {/* Test Cases Section */}
            <div className={sectionClasses}>
                <h2 className={sectionTitleClasses}><FileJson size={24} className="text-orange-500" /><span>Test Cases</span></h2>
                {/* Visible Test Cases */}
                <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center">
                        <h3 className="font-medium text-lg flex items-center"><Zap size={20} className="mr-2 text-blue-500" />Visible Test Cases</h3>
                        <button type="button" onClick={() => appendVisible({ input: '', output: '', explanation: '' })} className="btn btn-primary btn-sm rounded-full flex items-center bg-orange-500 hover:bg-orange-600 border-0"><PlusCircle size={16} className="mr-1" />Add Case</button>
                    </div>
                    {visibleFields.map((field, index) => (
                        <div key={field.id} className={subCardClasses}>
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-medium flex items-center"><FileText size={16} className="mr-2" />Case {index + 1}</span>
                                <button type="button" onClick={() => removeVisible(index)} className="btn btn-error btn-xs rounded-full p-2"><Trash2 size={14} /></button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClasses}>Input</label>
                                    <input {...register(`visibleTestCases.${index}.input`)} className={`${inputBaseClasses} ${errors.visibleTestCases?.[index]?.input ? 'border-red-500' : ''}`} />
                                    {errors.visibleTestCases?.[index]?.input && <p className={errorClasses}><AlertCircle size={14} className="mr-1" />{errors.visibleTestCases[index].input.message}</p>}
                                </div>
                                <div>
                                    <label className={labelClasses}>Output</label>
                                    <input {...register(`visibleTestCases.${index}.output`)} className={`${inputBaseClasses} ${errors.visibleTestCases?.[index]?.output ? 'border-red-500' : ''}`} />
                                    {errors.visibleTestCases?.[index]?.output && <p className={errorClasses}><AlertCircle size={14} className="mr-1" />{errors.visibleTestCases[index].output.message}</p>}
                                </div>
                            </div>
                            <div className="mt-4">
                                <label className={labelClasses}>Explanation</label>
                                <textarea {...register(`visibleTestCases.${index}.explanation`)} className={`${inputBaseClasses} ${errors.visibleTestCases?.[index]?.explanation ? 'border-red-500' : ''}`} rows={2} />
                                {errors.visibleTestCases?.[index]?.explanation && <p className={errorClasses}><AlertCircle size={14} className="mr-1" />{errors.visibleTestCases[index].explanation.message}</p>}
                            </div>
                        </div>
                    ))}
                </div>
                {/* Hidden Test Cases */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-medium text-lg flex items-center"><Cpu size={20} className="mr-2 text-purple-500" />Hidden Test Cases</h3>
                        <button type="button" onClick={() => appendHidden({ input: '', output: '' })} className="btn btn-primary btn-sm rounded-full flex items-center bg-orange-500 hover:bg-orange-600 border-0"><PlusCircle size={16} className="mr-1" />Add Case</button>
                    </div>
                    {hiddenFields.map((field, index) => (
                        <div key={field.id} className={subCardClasses}>
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-medium flex items-center"><FileText size={16} className="mr-2" />Hidden Case {index + 1}</span>
                                <button type="button" onClick={() => removeHidden(index)} className="btn btn-error btn-xs rounded-full p-2"><Trash2 size={14} /></button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClasses}>Input</label>
                                    <input {...register(`hiddenTestCases.${index}.input`)} className={`${inputBaseClasses} ${errors.hiddenTestCases?.[index]?.input ? 'border-red-500' : ''}`} />
                                    {errors.hiddenTestCases?.[index]?.input && <p className={errorClasses}><AlertCircle size={14} className="mr-1" />{errors.hiddenTestCases[index].input.message}</p>}
                                </div>
                                <div>
                                    <label className={labelClasses}>Output</label>
                                    <input {...register(`hiddenTestCases.${index}.output`)} className={`${inputBaseClasses} ${errors.hiddenTestCases?.[index]?.output ? 'border-red-500' : ''}`} />
                                    {errors.hiddenTestCases?.[index]?.output && <p className={errorClasses}><AlertCircle size={14} className="mr-1" />{errors.hiddenTestCases[index].output.message}</p>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Code Templates Section */}
            <div className={sectionClasses}>
                <h2 className={sectionTitleClasses}><Code size={24} className="text-orange-500" /><span>Code Templates</span></h2>
                <div className="space-y-8">
                    {[0, 1, 2].map((index) => (
                        <div key={index} className="space-y-4 p-4 bg-orange-50 dark:bg-gray-800 rounded-xl">
                            <h3 className="font-medium text-lg text-orange-700 dark:text-orange-300 flex items-center"><Code size={18} className="mr-2" />{['C++', 'Java', 'JavaScript'][index]}</h3>
                            <div className="form-control">
                                <label className={labelClasses}>Initial Code</label>
                                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                                    <textarea {...register(`startCode.${index}.initialCode`)} className="w-full bg-transparent font-mono text-white text-sm" rows={6} />
                                </div>
                                {errors.startCode?.[index]?.initialCode && <p className={errorClasses}><AlertCircle size={14} className="mr-1" />{errors.startCode[index].initialCode.message}</p>}
                            </div>
                            <div className="form-control">
                                <label className={labelClasses}>Reference Solution</label>
                                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                                    <textarea {...register(`referenceSolution.${index}.completeCode`)} className="w-full bg-transparent font-mono text-white text-sm" rows={6} />
                                </div>
                                {errors.referenceSolution?.[index]?.completeCode && <p className={errorClasses}><AlertCircle size={14} className="mr-1" />{errors.referenceSolution[index].completeCode.message}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          <button type="submit" className={`btn w-full rounded-full text-lg font-medium py-3 transition-all duration-300 ${isSubmitting ? 'btn-disabled' : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-0 hover:scale-105'}`} disabled={isSubmitting}>
            {isSubmitting ? (<><span className="loading loading-spinner"></span>Updating Problem...</>) : (<><Edit size={20} className="mr-2" />Update Problem</>)}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UpdateProblem;