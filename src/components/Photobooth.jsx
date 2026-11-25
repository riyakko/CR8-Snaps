import React, { useEffect, useMemo, useRef, useState } from 'react';
import TheatreCurtains from './TheatreCurtains.jsx';
import CameraView from './CameraView.jsx';
import FrameSlots from './FrameSlots.jsx';
import FilterSelector from './FilterSelector.jsx';
import FrameCustomizer from './FrameCustomizer.jsx';
import PhotoStripPreview from './PhotoStripPreview.jsx';
import { getFilter } from '../lib/filters.js';
import { ensureFonts } from '../lib/fonts.js';
import {
  MAX_RETAKES,
  composeStrip,
  downloadCanvas,
  getPreset,
} from '../lib/composeStrip.js';

const FRAME_COUNT = 4;
const emptySlots = () => Array.from({ length: FRAME_COUNT }, () => ({ photo: null, retakes: 0 }));

function stamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}

function StripDetails({ filterId, frame }) {
  const frameName = frame.type === 'custom' ? `Custom · ${frame.name}` : getPreset(frame.id).label;
  const rows = [
    ['Frames', String(FRAME_COUNT)],
    ['Filter', getFilter(filterId).label],
    ['Frame design', frameName],
  ];
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
      {rows.map(([k, v]) => (
        <React.Fragment key={k}>
          <dt className="text-cream/60">{k}</dt>
          <dd className="truncate text-right font-medium text-cream">{v}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}

export default function Photobooth({ transition, onExit }) {
  const [stage, setStage] = useState('booth'); // 'booth' | 'result'
  const count = FRAME_COUNT;

  const [slots, setSlots] = useState(emptySlots);
  const [filterId, setFilterId] = useState('none');
  const [frame, setFrame] = useState({ type: 'preset', id: 'velvet' });

  const [cameraReady, setCameraReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [activeSlot, setActiveSlot] = useState(null);
  const cameraRef = useRef(null);
  const busyRef = useRef(false);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const photos = useMemo(() => slots.map((s) => s.photo), [slots]);
  const shotCount = photos.filter(Boolean).length;
  const nextIndex = slots.findIndex((s) => !s.photo);
  const allDone = nextIndex === -1;

  // Free the uploaded frame's blob URL when leaving the booth.
  const frameRef = useRef(frame);
  frameRef.current = frame;
  useEffect(
    () => () => {
      if (frameRef.current.type === 'custom') URL.revokeObjectURL(frameRef.current.url);
    },
    []
  );

  /* ---------- actions ---------- */

  // Handles both first captures and retakes. A retake is only allowed
  // while that frame has fewer than MAX_RETAKES retakes used.
  const shoot = async (index) => {
    if (busyRef.current || !cameraReady || index < 0) return;
    const slot = slots[index];
    if (slot.photo && slot.retakes >= MAX_RETAKES) return;

    busyRef.current = true;
    setBusy(true);
    setActiveSlot(index);
    try {
      const canvas = await cameraRef.current?.snap(3);
      if (canvas) {
        setSlots((prev) =>
          prev.map((s, i) =>
            i === index
              ? { photo: canvas, retakes: s.photo ? Math.min(MAX_RETAKES, s.retakes + 1) : s.retakes }
              : s
          )
        );
      }
    } finally {
      busyRef.current = false;
      setBusy(false);
      setActiveSlot(null);
    }
  };

  const develop = () => transition(() => setStage('result'), 'Developing your strip');
  const backToBooth = () => transition(() => setStage('booth'), 'Back to the booth');
  const newSession = () =>
    transition(() => {
      setSlots(emptySlots());
      setSaveError('');
      setStage('booth');
    }, 'Next customer, please');

  const download = async () => {
    setSaving(true);
    setSaveError('');
    try {
      await ensureFonts();
      const canvas = composeStrip({ count, photos, frame, filterId });
      await downloadCanvas(canvas, `cr8-snaps-${stamp()}.png`);
    } catch {
      setSaveError('Couldn’t save the image. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  /* ---------- layout ---------- */

  const header = (
    <header className="sticky top-0 z-20 border-b border-gold-500/30 bg-velvet-950/85 backdrop-blur">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 px-4 py-3">
        <button type="button" className="btn-ghost !px-2 justify-self-start sm:!px-4" onClick={onExit} disabled={busy}>
          <span aria-hidden="true">←</span> Lobby
        </button>
        <div className="justify-self-center font-marquee text-2xl text-gold-300 drop-shadow-[0_0_12px_rgba(240,199,94,.6)]">
          CR8 Snaps
        </div>
        <span aria-hidden="true" />
      </div>
    </header>
  );

  if (stage === 'result') {
    return (
      <div className="relative min-h-screen">
        <TheatreCurtains spotlight={false} />
        {header}
        <main className="mx-auto grid max-w-5xl items-start gap-8 px-4 py-8 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
          <div className="mx-auto w-full max-w-xs animate-rise">
            <div className="-rotate-1 transition duration-300 hover:rotate-0">
              <PhotoStripPreview count={count} photos={photos} frame={frame} filterId={filterId} />
            </div>
          </div>

          <div className="space-y-5">
            <section className="panel">
              <h1 className="font-marquee text-4xl text-gold-300 sm:text-5xl">Your strip is ready!</h1>
              <p className="mt-1 mb-4 font-display italic text-cream/80">
                Try another filter or frame below, then save it.
              </p>
              <StripDetails filterId={filterId} frame={frame} />
              <div className="mt-5 flex flex-wrap gap-3">
                <button type="button" className="btn-gold" onClick={download} disabled={saving}>
                  {saving ? 'Saving…' : 'Download strip'}
                </button>
                <button type="button" className="btn-ghost" onClick={backToBooth}>
                  Edit / retake
                </button>
                <button type="button" className="btn-ghost" onClick={newSession}>
                  New session
                </button>
              </div>
              {saveError && (
                <p className="mt-3 rounded-lg bg-red-900/50 px-3 py-2 text-xs text-red-200" role="alert">
                  {saveError}
                </p>
              )}
            </section>
            <FilterSelector value={filterId} onChange={setFilterId} />
            <FrameCustomizer frame={frame} onChange={setFrame} count={count} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-16">
      <TheatreCurtains spotlight={false} />
      {header}

      <main className="mx-auto grid max-w-6xl gap-5 px-4 py-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <CameraView ref={cameraRef} filterId={filterId} onReadyChange={setCameraReady} />

          <div className="flex flex-wrap items-center justify-center gap-3">
            {allDone ? (
              <button type="button" className="btn-gold px-8 py-3.5" onClick={develop} disabled={busy}>
                Develop my strip <span aria-hidden="true">→</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn-gold px-8 py-3.5"
                disabled={!cameraReady || busy}
                onClick={() => shoot(nextIndex)}
              >
                {busy ? 'Get ready…' : `Snap frame ${nextIndex + 1} of ${count}`}
              </button>
            )}
            {busy && (
              <button type="button" className="btn-ghost" onClick={() => cameraRef.current?.cancel()}>
                Cancel
              </button>
            )}
            <span className="text-sm text-cream/70">
              {shotCount}/{count} captured
            </span>
          </div>

          <FrameSlots
            slots={slots}
            filterId={filterId}
            busy={busy}
            activeIndex={activeSlot}
            onRetake={shoot}
          />
        </div>

        <div className="space-y-5">
          <FilterSelector value={filterId} onChange={setFilterId} />
          <FrameCustomizer frame={frame} onChange={setFrame} count={count} />

          <section className="panel" aria-labelledby="strip-title">
            <h2 id="strip-title" className="panel-title">Your Strip</h2>
            <div className="mx-auto w-full max-w-[220px]">
              <PhotoStripPreview count={count} photos={photos} frame={frame} filterId={filterId} />
            </div>
            <div className="mt-4 border-t border-gold-400/20 pt-3">
              <StripDetails filterId={filterId} frame={frame} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
