import React from 'react';

export function Tabs({ tabs, activeTabId, onTabChange, className = '' }) {
  return (
    <div className={`flex space-x-1 border-b border-border px-2 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTabId === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              px-3 py-2 text-[11px] font-medium uppercase tracking-wider transition-colors border-b-2
              ${isActive 
                ? 'border-accent text-accent' 
                : 'border-transparent text-text-muted hover:text-text hover:border-border-strong'}
            `}
          >
            <div className="flex items-center">
              {tab.icon && <tab.icon className="w-3.5 h-3.5 mr-1.5" />}
              {tab.label}
            </div>
          </button>
        );
      })}
    </div>
  );
}
