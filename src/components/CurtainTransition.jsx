import React from 'react';

export const CLOSE_MS = 900;
export const HOLD_MS = 700;
export const OPEN_MS = 1000;

const EASE = 'cubic-bezier(.77,0,.18,1)';

function Panel({ side, closed, duration }) {
  const isLeft = side === 'left';
  return (
    <div
      className={`velvet absolute top-0 bottom-0 w-[51%] will-change-transform ${
        isLeft ? 'left-0' : 'right-0'
      }`}
      style={{
        transform: `translateX(${closed ? '0%' : isLeft ? '-102%' : '102%'})`,
        transition: `transform ${duration}ms ${EASE}`,
      }}
    >
      {/* gold fringe on the inner edge */}
      <div
        className={`absolute top-0 bottom-0 w-3 ${isLeft ? 'right-0' : 'left-0'}`}
        style={{
          background:
            'repeating-linear-gradient(180deg,#f0c75e 0 10px,#b08621 10px 14px)',
          boxShadow: isLeft
            ? '-6px 0 18px rgba(0,0,0,.55)'
            : '6px 0 18px rgba(0,0,0,.55)',
        }}
      />
      {/* top valance trim */}
      <div className="absolute inset-x-0 top-0 h-3 border-b-2 border-gold-500 bg-black/25" />
    </div>
  );
}

/**
 * Full-screen curtain used for every view change.
 * phase: 'closing' | 'closed' | 'opening' | 'open'
 */
export default function CurtainTransition({ phase, label = 'Lights, camera…' }) {
  const closed = phase === 'closing' || phase === 'closed';
  const duration = phase === 'opening' ? OPEN_MS : CLOSE_MS;
  const hidden = phase === 'open';

  return (
    <div
      className={`fixed inset-0 z-[100] overflow-hidden ${
        hidden ? 'pointer-events-none invisible' : 'pointer-events-auto'
      }`}
      role="status"
      aria-live="polite"
      aria-label={closed ? label : undefined}
    >
      <Panel side="left" closed={closed} duration={duration} />
      <Panel side="right" closed={closed} duration={duration} />

      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center"
        style={{
          opacity: phase === 'closed' ? 1 : 0,
          transition: `opacity 350ms ease ${phase === 'closed' ? '200ms' : '0ms'}`,
        }}
      >
        <div className="font-marquee text-4xl text-gold-300 drop-shadow-[0_0_18px_rgba(240,199,94,.8)] sm:text-6xl">
          CR8 Snaps
        </div>
        <div className="flex items-center gap-3 font-body text-xs font-bold uppercase tracking-[0.35em] text-cream/90 sm:text-sm">
          <span>{label}</span>
          <span className="flex gap-1" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-gold-300"
                style={{ animation: 'bulb 1s ease-in-out infinite', animationDelay: `${i * 0.18}s` }}
              />
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}
