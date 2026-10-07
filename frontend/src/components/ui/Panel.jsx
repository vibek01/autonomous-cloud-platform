import React from 'react';

export function Panel({ children, className = '' }) {
  return (
    <div className={`bg-surface border border-border rounded-lg overflow-hidden flex flex-col ${className}`}>
      {children}
    </div>
  );
}
