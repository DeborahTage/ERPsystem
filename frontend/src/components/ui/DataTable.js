import React from 'react';

export const DataTable = ({ children, className = '' }) => (
  <div className={`overflow-x-auto rounded-lg border border-gray-200 ${className}`}>
    <table className="min-w-full divide-y divide-gray-200">
      {children}
    </table>
  </div>
);

export const TableHead = ({ children }) => (
  <thead className="bg-gray-50">
    <tr>
      {children}
    </tr>
  </thead>
);

export const TableHeader = ({ children, className = '' }) => (
  <th className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${className}`}>
    {children}
  </th>
);

export const TableBody = ({ children }) => (
  <tbody className="bg-white divide-y divide-gray-200">
    {children}
  </tbody>
);

export const TableRow = ({ children, className = '', onClick }) => (
  <tr 
    onClick={onClick}
    className={`group transition-all duration-200 ease-out hover:bg-gray-50/80 hover:shadow-sm ${onClick ? 'cursor-pointer' : ''} ${className}`}
  >
    {children}
  </tr>
);

export const TableCell = ({ children, className = '' }) => (
  <td className={`px-4 py-3 whitespace-nowrap text-sm text-gray-900 ${className}`}>
    {children}
  </td>
);

export const EmptyState = ({ title = 'No data found', description = 'There are no items to display at the moment.', icon }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
    {icon && <div className="mb-4 text-gray-300 transition-transform duration-300 hover:scale-110">{icon}</div>}
    <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
    <p className="mt-1.5 text-sm text-gray-500 text-center max-w-sm leading-relaxed">{description}</p>
  </div>
);

export const LoadingState = ({ cols = 4 }) => (
  <tbody className="bg-white divide-y divide-gray-200">
    {[...Array(5)].map((_, i) => (
      <tr key={i}>
        {[...Array(cols)].map((_, j) => (
          <td key={j} className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
          </td>
        ))}
      </tr>
    ))}
  </tbody>
);

export default DataTable;
