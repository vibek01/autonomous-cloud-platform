import React from 'react';

export function IconButton({ 
  icon: Icon, 
  onClick, 
  disabled = false, 
  title = '',
  className = '' 
}) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-md text-text-muted hover:text-text hover:bg-surface-raised transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}
