import React from 'react';

const DRAPE_CLIP = 'polygon(0 0, 100% 0, 74% 52%, 96% 100%, 0 100%)';

function Drape({ flip = false }) {
  return (
    <div
      className={`pointer-events-none absolute top-0 bottom-0 ${flip ? 'right-0' : 'left-0'}`}
      style={{ width: 'clamp(84px, 26vw, 380px)', transform: flip ? 'scaleX(-1)' : undefined }}
    >
      <div
        className="velvet h-full w-full origin-top animate-sway"
        style={{ clipPath: DRAPE_CLIP }}
      />
      {/* gold tie-back cord + tassel at the pinch */}
      <div
        className="absolute h-1.5 w-[24%] rounded-full bg-gradient-to-r from-gold-600 to-gold-300 shadow-marquee"
        style={{ left: '2%', top: '51%' }}
      />
      <div
        className="absolute h-5 w-5 rounded-full bg-gold-400 shadow-marquee"
        style={{ left: '22%', top: 'calc(51% - 7px)' }}
      />
      <div
        className="absolute w-2 rounded-b-full bg-gradient-to-b from-gold-400 to-gold-600"
        style={{ left: 'calc(22% + 6px)', top: 'calc(51% + 12px)', height: 44 }}
      />
    </div>
  );
}

/**
 * Decorative theatre backdrop: valance, tied-back drapes, spotlight and stage floor.
 * Sits behind page content (fixed, -z-10 inside a relative wrapper).
 */
export default function TheatreCurtains({ spotlight = true }) {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-velvet-950" aria-hidden="true">
      {/* warm back wall */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 35%, rgba(150,40,30,.55) 0%, rgba(60,8,8,.9) 55%, #140202 100%)',
        }}
      />

      {spotlight && (
        <div
          className="absolute left-1/2 top-0 h-full w-[80vw] max-w-4xl animate-spot"
          style={{
            clipPath: 'polygon(42% 0, 58% 0, 100% 100%, 0 100%)',
            background:
              'linear-gradient(180deg, rgba(255,224,150,.38) 0%, rgba(255,200,120,.12) 60%, rgba(255,200,120,0) 100%)',
            filter: 'blur(6px)',
          }}
        />
      )}

      <Drape />
      <Drape flip />

      {/* valance */}
      <div className="absolute inset-x-0 top-0">
        <div className="velvet h-12 border-b-[3px] border-gold-500 shadow-[0_6px_18px_rgba(0,0,0,.6)] sm:h-14" />
        <div
          className="h-8"
          style={{
            backgroundImage: 'radial-gradient(circle at 50% 0%, #7a1010 0 30px, transparent 31px)',
            backgroundSize: '64px 32px',
            backgroundRepeat: 'repeat-x',
            filter: 'drop-shadow(0 4px 4px rgba(0,0,0,.55))',
          }}
        />
      </div>

      {/* stage floor + footlights */}
      <div
        className="absolute inset-x-0 bottom-0 h-20"
        style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0), #0d0101 70%)' }}
      />
      <div className="absolute inset-x-0 bottom-3 flex justify-center gap-6 sm:gap-10">
        {Array.from({ length: 9 }, (_, i) => (
          <span
            key={i}
            className="h-2 w-6 rounded-t-full bg-gold-300/80 shadow-marquee sm:w-8"
            style={{ animation: 'bulb 2.4s ease-in-out infinite', animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
}
