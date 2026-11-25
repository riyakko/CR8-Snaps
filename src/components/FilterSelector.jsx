import React from 'react';
import { FILTERS } from '../lib/filters.js';

export default function FilterSelector({ value, onChange }) {
  return (
    <section className="panel" aria-labelledby="filter-title">
      <h2 id="filter-title" className="panel-title">Photo Filter</h2>
      <div role="radiogroup" aria-labelledby="filter-title" className="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-3">
        {FILTERS.map((f) => {
          const active = f.id === value;
          return (
            <button
              key={f.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(f.id)}
              className={`group flex flex-col items-center gap-1.5 rounded-xl border p-2 text-center transition duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-gold-300/50 ${
                active
                  ? 'scale-[1.04] border-gold-300 bg-gold-400/15 shadow-marquee'
                  : 'border-white/10 bg-black/20 hover:-translate-y-0.5 hover:border-gold-400/50'
              }`}
            >
              <span
                className="block h-10 w-full rounded-lg ring-1 ring-black/40 transition-transform duration-200 group-hover:scale-105"
                style={{ background: f.swatch }}
              />
              <span className={`text-[11px] font-medium leading-tight ${active ? 'text-gold-300' : 'text-cream/80'}`}>
                {f.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
