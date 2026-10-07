import React from 'react';

export function PanelHeader({ icon: Icon, title, rightContent, className = '' }) {
  return (
    <div className={`border-b border-border px-4 py-3 flex justify-between items-center bg-surface-raised shrink-0 ${className}`}>
      <div className="flex items-center">
        {Icon && <Icon className="w-4 h-4 text-text-muted mr-2" />}
        <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider">{title}</span>
      </div>
      {rightContent && (
        <div className="flex items-center space-x-2">
          {rightContent}
        </div>
      )}
    </div>
  );
}
