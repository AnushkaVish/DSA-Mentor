import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

const InputField = ({ id, label, type, placeholder, iconPath, register, error, isPasswordField = false, isPasswordVisible, onToggleVisibility }) => {
  return (
    <div className="relative">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        {label}
      </label>
      <div className="relative rounded-md shadow-sm">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
          </svg>
        </div>
        <input
          id={id}
          type={isPasswordField ? (isPasswordVisible ? 'text' : 'password') : type}
          placeholder={placeholder}
          {...register}
          className={`block w-full rounded-lg border-0 py-3 pl-10 pr-4 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700/50 ring-1 ring-inset ${
            error ? 'ring-red-500' : 'ring-slate-300 dark:ring-slate-600'
          } placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-sm sm:leading-6 transition-all duration-200`}
        />
        {isPasswordField && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            onClick={onToggleVisibility}
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
          >
            {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error.message}</p>}
    </div>
  );
};

export default InputField;