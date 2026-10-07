import React from 'react';

export function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-surface-raised rounded ${className}`} />
  );
}
