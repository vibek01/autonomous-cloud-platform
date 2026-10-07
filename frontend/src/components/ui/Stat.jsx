import React from 'react';

export function Stat({ label, value, subtext, valueColorClass = "text-text" }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] text-text-muted uppercase tracking-wider font-medium">{label}</span>
      <span className={`text-xl font-mono tabular-nums tracking-tight mt-0.5 ${valueColorClass}`}>
        {value}
      </span>
      {subtext && <span className="text-[10px] text-text-muted mt-0.5">{subtext}</span>}
    </div>
  );
}
