import React from 'react';
import { PACKAGES, formatPeso } from '../lib/composeStrip.js';

function MiniStrip({ frames, active }) {
  return (
    <span
      className={`flex w-8 flex-col gap-1 rounded-sm p-1 ${active ? 'bg-gold-300' : 'bg-cream/70'}`}
      aria-hidden="true"
    >
      {Array.from({ length: frames }, (_, i) => (
        <span key={i} className="block h-3 rounded-[2px] bg-velvet-800" />
      ))}
    </span>
  );
}

export default function PackageSelector({ value, onChange, locked, onStartOver }) {
  return (
    <section className="panel" aria-labelledby="pkg-title">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 id="pkg-title" className="panel-title !mb-0">Choose Your Package</h2>
        {locked && (
          <button type="button" className="btn-ghost !px-3 !py-1 text-xs" onClick={onStartOver}>
            Start over
          </button>
        )}
      </div>

      <div role="radiogroup" aria-labelledby="pkg-title" className="grid grid-cols-2 gap-3">
        {PACKAGES.map((p) => {
          const active = p.id === value;
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={locked && !active}
              onClick={() => onChange(p.id)}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-gold-300/50 disabled:cursor-not-allowed disabled:opacity-40 ${
                active
                  ? 'border-gold-300 bg-gold-400/15 shadow-marquee'
                  : 'border-white/10 bg-black/20 hover:-translate-y-0.5 hover:border-gold-400/50'
              }`}
            >
              <MiniStrip frames={p.frames} active={active} />
              <span>
                <span className="block font-display text-lg font-bold leading-tight">{p.label}</span>
                <span className={`block text-xl font-bold ${active ? 'text-gold-300' : 'text-cream/80'}`}>
                  {formatPeso(p.price)}
                  <span className="ml-1 text-xs font-normal text-cream/60">{p.price} pesos</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {locked && (
        <p className="mt-2 text-xs text-cream/60">
          Package is locked once you start snapping. Use “Start over” to switch.
        </p>
      )}
    </section>
  );
}
