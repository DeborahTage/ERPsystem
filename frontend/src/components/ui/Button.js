import React from 'react';

const variants = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 hover:shadow-md hover:shadow-brand-500/20 hover:-translate-y-px focus:ring-brand-500',
  secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm hover:-translate-y-px focus:ring-brand-500',
  ghost: 'text-gray-700 hover:bg-gray-100 hover:-translate-y-px focus:ring-brand-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 hover:shadow-md hover:shadow-red-500/20 hover:-translate-y-px focus:ring-red-500',
};

const sizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-6 text-base',
  icon: 'h-9 w-9 p-0',
};

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  onClick,
  ...props 
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center rounded-xl font-medium 
                focus:outline-none focus:ring-2 focus:ring-offset-2
                disabled:opacity-50 disabled:pointer-events-none disabled:transform-none
                transition-all duration-200 ease-out active:scale-[0.98]
                ${variants[variant]} ${sizes[size]} ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default Button;
