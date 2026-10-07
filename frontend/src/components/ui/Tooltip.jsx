import React, { useState } from 'react';

export function Tooltip({ content, children, position = 'top' }) {
  const [isVisible, setIsVisible] = useState(false);

  let positionClass = "bottom-full left-1/2 -translate-x-1/2 mb-2"; // top
  if (position === 'bottom') positionClass = "top-full left-1/2 -translate-x-1/2 mt-2";
  else if (position === 'left') positionClass = "right-full top-1/2 -translate-y-1/2 mr-2";
  else if (position === 'right') positionClass = "left-full top-1/2 -translate-y-1/2 ml-2";

  return (
    <div 
      className="relative flex items-center justify-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && content && (
        <div className={`absolute z-50 whitespace-nowrap px-2 py-1 bg-surface-raised border border-border text-[10px] text-text rounded shadow-sm pointer-events-none animate-in fade-in zoom-in-95 duration-150 ${positionClass}`}>
          {content}
        </div>
      )}
    </div>
  );
}
