import React from 'react';

export function Slider({ value, min, max, onChange, disabled = false, label, readout }) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex justify-between items-center text-[11px]">
        <span className="text-text-muted">{label}</span>
        {readout && <span className="font-mono text-text tabular-nums">{readout}</span>}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        disabled={disabled}
        className="w-full h-1.5 bg-surface-raised rounded-full appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed accent-accent"
      />
      <div className="flex justify-between px-1 mt-1">
        {Array.from({ length: max - min + 1 }).map((_, i) => (
          <div key={i} className="w-0.5 h-1 bg-border rounded-full" />
        ))}
      </div>
    </div>
  );
}
