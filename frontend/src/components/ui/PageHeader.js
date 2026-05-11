import React from 'react';
import { ChevronRight } from 'lucide-react';

export const PageHeader = ({ title, description, breadcrumbs = [], actions }) => (
  <div className="mb-6">
    {breadcrumbs.length > 0 && (
      <nav className="flex items-center text-sm text-gray-500 mb-2">
        {breadcrumbs.map((crumb, i) => (
          <React.Fragment key={i}>
            {i > 0 && <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />}
            {crumb.href ? (
              <a href={crumb.href} className="hover:text-gray-900 transition-colors">
                {crumb.label}
              </a>
            ) : (
              <span className={i === breadcrumbs.length - 1 ? 'text-gray-900 font-medium' : ''}>
                {crumb.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </nav>
    )}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  </div>
);

export default PageHeader;
