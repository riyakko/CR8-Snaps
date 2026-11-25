import React from 'react';
import TheatreCurtains from './TheatreCurtains.jsx';
import MarqueeBulbs from './MarqueeBulbs.jsx';

export default function LandingPage({ onEnter }) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-5 py-24 text-center">
      <TheatreCurtains />

      <section className="animate-rise w-full max-w-xl">
        {/* marquee sign */}
        <div className="rounded-3xl border-2 border-gold-500/80 bg-velvet-950/70 px-5 py-6 shadow-marquee backdrop-blur-sm sm:px-10 sm:py-9">
          <MarqueeBulbs count={14} />
          <p className="mt-5 font-body text-xs font-bold uppercase tracking-[0.5em] text-gold-400 sm:text-sm">
            ★ Now Showing ★
          </p>
          <h1 className="mt-2 font-marquee text-6xl leading-none text-gold-300 drop-shadow-[0_0_22px_rgba(240,199,94,.75)] sm:text-8xl">
            CR8
            <span className="block text-cream sm:inline sm:pl-4">Snaps</span>
          </h1>
          <p className="mx-auto mt-5 max-w-sm font-display text-lg italic text-cream/90 sm:text-xl">
            Step behind the curtain, strike a pose, and walk out with a retro photo strip.
          </p>
          <MarqueeBulbs count={14} className="mt-6" />
        </div>

        <div className="mt-9 flex flex-col items-center gap-4">
          <button type="button" className="btn-gold px-10 py-4 text-base sm:text-lg" onClick={onEnter}>
            Enter the Booth
            <span aria-hidden="true">→</span>
          </button>

          <p className="text-sm text-cream/85">Four frames, custom filters, and a keepsake strip to save.</p>
          <p className="text-xs text-cream/60">Your browser will ask to use the camera. Photos stay on your device.</p>
        </div>
      </section>
    </main>
  );
}
