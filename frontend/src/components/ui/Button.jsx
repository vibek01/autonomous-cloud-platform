import React from 'react';

export function Button({ 
  children, 
  variant = 'secondary', 
  disabled = false, 
  disabledReason = '',
  onClick,
  className = '' 
}) {
  let baseClass = "px-4 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center ";
  
  if (disabled) {
    baseClass += "opacity-50 cursor-not-allowed ";
  }

  if (variant === 'primary') {
    baseClass += "bg-[var(--color-accent-muted)] border border-[var(--color-accent-border)] text-accent hover:bg-[rgba(110,124,242,0.15)]";
  } else if (variant === 'danger') {
    baseClass += "bg-[var(--color-danger-fill)] border border-[var(--color-danger-border)] text-danger hover:bg-[rgba(248,113,113,0.15)]";
  } else {
    // secondary / ghost
    baseClass += "bg-transparent border border-border text-text hover:bg-surface-raised hover:border-border-strong";
  }

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      title={disabled ? disabledReason : undefined}
      className={`${baseClass} ${className}`}
    >
      {children}
    </button>
  );
}
