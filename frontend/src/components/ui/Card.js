import React from 'react';

export const Card = ({ children, className = '', padding = 'normal', hover = false }) => {
  const paddingClasses = {
    none: '',
    small: 'p-3',
    normal: 'p-5',
    large: 'p-6',
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200/80 shadow-sm 
      ${hover ? 'hover:shadow-md hover:-translate-y-0.5 hover:border-gray-300' : ''}
      transition-all duration-300 ease-out
      ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`flex items-center justify-between mb-5 pb-1 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-base font-semibold text-gray-900 tracking-tight ${className}`}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className = '' }) => (
  <p className={`text-sm text-gray-500 mt-1 ${className}`}>
    {children}
  </p>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`flex items-center justify-between mt-4 pt-4 border-t border-gray-100 ${className}`}>
    {children}
  </div>
);
