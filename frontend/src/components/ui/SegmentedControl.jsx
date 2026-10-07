import React from 'react';

export function SegmentedControl({ options, value, onChange }) {
  return (
    <div className="flex bg-surface-raised p-1 rounded-lg border border-border">
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`
              px-3 py-1 text-[11px] font-medium rounded-md transition-all
              ${isActive 
                ? 'bg-[var(--color-accent-muted)] text-accent shadow-sm border border-[var(--color-accent-border)]' 
                : 'text-text-muted hover:text-text border border-transparent'}
            `}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
