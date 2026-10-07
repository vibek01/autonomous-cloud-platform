import React from 'react';
import { AlertTriangle } from 'lucide-react';

export function Banner({ message, type = 'warning' }) {
  let colors = "bg-warning-fill text-warning border-warning-border";
  if (type === 'danger') colors = "bg-danger-fill text-danger border-danger-border";
  
  return (
    <div className={`flex items-center p-3 border rounded-lg text-sm mb-4 ${colors}`}>
      <AlertTriangle className="w-4 h-4 mr-2 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
