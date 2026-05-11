import React, { forwardRef } from 'react';

export const Input = forwardRef(({ 
  className = '', 
  error,
  label,
  helper,
  ...props 
}, ref) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
    )}
    <input
      ref={ref}
      className={`flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm
                  placeholder:text-gray-400 
                  focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                  disabled:cursor-not-allowed disabled:opacity-50
                  transition-all
                  ${error 
                    ? 'border-red-300 focus:ring-red-500 text-red-900 placeholder:text-red-300' 
                    : 'border-gray-300 text-gray-900'
                  } ${className}`}
      {...props}
    />
    {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    {helper && !error && <p className="mt-1.5 text-sm text-gray-500">{helper}</p>}
  </div>
));

export const Select = forwardRef(({
  className = '',
  error,
  label,
  options = [],
  placeholder,
  ...props
}, ref) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
    )}
    <select
      ref={ref}
      className={`flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                  disabled:cursor-not-allowed disabled:opacity-50
                  transition-all appearance-none bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")] bg-[length:1.5em_1.5em] bg-[right_0.5rem_center] bg-no-repeat pr-10
                  ${error 
                    ? 'border-red-300 focus:ring-red-500 text-red-900' 
                    : 'border-gray-300 text-gray-900'
                  } ${className}`}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
  </div>
));

export const Textarea = forwardRef(({
  className = '',
  error,
  label,
  rows = 4,
  ...props
}, ref) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
    )}
    <textarea
      ref={ref}
      rows={rows}
      className={`flex w-full rounded-md border bg-white px-3 py-2 text-sm
                  placeholder:text-gray-400 
                  focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                  disabled:cursor-not-allowed disabled:opacity-50
                  transition-all resize-y
                  ${error 
                    ? 'border-red-300 focus:ring-red-500 text-red-900' 
                    : 'border-gray-300 text-gray-900'
                  } ${className}`}
      {...props}
    />
    {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
  </div>
));
