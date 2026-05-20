import React from 'react';

export const Switch = ({ checked, onCheckedChange, label, className = '' }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onCheckedChange(!checked)}
    className={`inline-flex items-center rounded-full p-1 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 ${checked ? 'bg-brand-600' : 'bg-gray-200'} ${className}`}
  >
    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    {label && <span className="ml-3 text-sm font-medium text-gray-700">{label}</span>}
  </button>
);

export default Switch;
