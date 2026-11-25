import React, { useEffect, useRef } from 'react';
import { filterCss } from '../lib/filters.js';
import { MAX_RETAKES } from '../lib/composeStrip.js';

function SlotThumb({ photo, filterId }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c || !photo) return;
    c.width = 320;
    c.height = 240;
    c.getContext('2d').drawImage(photo, 0, 0, 320, 240);
  }, [photo]);
  return (
    <canvas
      ref={ref}
      className="h-full w-full object-cover transition duration-300"
      style={{ filter: filterCss(filterId) }}
    />
  );
}

export default function FrameSlots({ slots, filterId, busy, activeIndex, onRetake }) {
  return (
    <section aria-label="Captured frames">
      <ul className={`grid gap-3 ${slots.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {slots.map((slot, i) => {
          const left = MAX_RETAKES - slot.retakes;
          const shooting = activeIndex === i;
          const hasPhoto = !!slot.photo;
          return (
            <li
              key={i}
              className={`rounded-xl border bg-velvet-950/70 p-2 shadow-ticket backdrop-blur-sm transition duration-300 ${
                shooting ? 'border-gold-300 shadow-marquee' : 'border-gold-400/25'
              }`}
            >
              <div className="mb-1.5 flex items-center justify-between text-[11px] font-bold uppercase tracking-widest">
                <span className="text-gold-400">Frame {i + 1}</span>
                <span className={shooting ? 'text-gold-300' : hasPhoto ? 'text-emerald-300' : 'text-cream/40'}>
                  {shooting ? 'Posing…' : hasPhoto ? 'Ready' : 'Empty'}
                </span>
              </div>

              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-black/50 ring-1 ring-black/60">
                {hasPhoto ? (
                  <div key={slot.retakes} className="h-full w-full animate-pop">
                    <SlotThumb photo={slot.photo} filterId={filterId} />
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center font-marquee text-3xl text-gold-400/40">
                    {i + 1}
                  </div>
                )}
              </div>

              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="text-[11px] text-cream/80" aria-live="polite">
                  Retakes left:{' '}
                  <span className={`font-bold ${left === 0 ? 'text-red-300' : 'text-gold-300'}`}>
                    {left}/{MAX_RETAKES}
                  </span>
                </p>
                <span className="flex gap-1" aria-hidden="true">
                  {Array.from({ length: MAX_RETAKES }, (_, d) => (
                    <span
                      key={d}
                      className={`h-2 w-2 rounded-full ${d < left ? 'bg-gold-300 shadow-[0_0_6px_rgba(247,222,154,.9)]' : 'bg-white/15'}`}
                    />
                  ))}
                </span>
              </div>

              {hasPhoto && (
                <button
                  type="button"
                  className="btn-ghost mt-2 w-full !py-1.5 text-xs"
                  disabled={busy || left <= 0}
                  onClick={() => onRetake(i)}
                  aria-label={`Retake frame ${i + 1}, ${left} of ${MAX_RETAKES} retakes left`}
                >
                  {left <= 0 ? 'No retakes left' : 'Retake'}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
