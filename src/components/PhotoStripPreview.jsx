import React, { useEffect, useRef, useState } from 'react';
import { composeStrip, getLayout } from '../lib/composeStrip.js';
import { ensureFonts } from '../lib/fonts.js';

/**
 * Renders the live strip (photos + filter + frame design) onto a canvas.
 * Empty slots show a "your photo here" placeholder so the design is visible
 * before anything is captured.
 */
export default function PhotoStripPreview({ count, photos, frame, filterId, className = '' }) {
  const ref = useRef(null);
  const [fontTick, setFontTick] = useState(0);
  const layout = getLayout(count);

  useEffect(() => {
    let alive = true;
    ensureFonts().then(() => alive && setFontTick((t) => t + 1));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const out = composeStrip({ count, photos, frame, filterId });
    canvas.width = out.width;
    canvas.height = out.height;
    canvas.getContext('2d').drawImage(out, 0, 0);
  }, [count, photos, frame, filterId, fontTick]);

  return (
    <canvas
      ref={ref}
      width={layout.W}
      height={layout.H}
      role="img"
      aria-label={`Photo strip preview with ${count} frames`}
      className={`block h-auto w-full rounded-sm bg-white shadow-ticket ${className}`}
    />
  );
}
