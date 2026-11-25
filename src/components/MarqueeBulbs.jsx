import React from 'react';

// A row of softly pulsing marquee bulbs.
export default function MarqueeBulbs({ count = 14, className = '' }) {
  return (
    <div
      className={`bulb-row flex items-center justify-between gap-1 ${className}`}
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="block h-2 w-2 rounded-full bg-gold-300 shadow-[0_0_10px_rgba(247,222,154,0.9)] sm:h-2.5 sm:w-2.5"
        />
      ))}
    </div>
  );
}
