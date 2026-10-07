import React from 'react';

export function StatusChip({ status, className = '' }) {
  let colorClass = "bg-surface-raised text-text-muted border-border";
  
  switch (status?.toLowerCase()) {
    case 'running':
    case 'healthy':
      colorClass = "bg-[var(--color-success-fill)] text-success border-[var(--color-success-border)]";
      break;
    case 'starting':
    case 'pending':
      colorClass = "bg-[var(--color-accent-muted)] text-accent border-[var(--color-accent-border)]";
      break;
    case 'terminating':
    case 'restarting':
      colorClass = "bg-[var(--color-warning-fill)] text-warning border-[var(--color-warning-border)]";
      break;
    case 'oomkilled':
    case 'error':
    case 'crashloopbackoff':
      colorClass = "bg-[var(--color-danger-fill)] text-danger border-[var(--color-danger-border)]";
      break;
  }

  return (
    <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border ${colorClass} ${className}`}>
      {status || 'Unknown'}
    </span>
  );
}
