import React, { useRef, useState } from 'react';
import {
  FRAME_PRESETS,
  downloadCanvas,
  getLayout,
  makeFrameTemplate,
} from '../lib/composeStrip.js';

const MAX_BYTES = 10 * 1024 * 1024;

function PresetSwatch({ preset }) {
  return (
    <span
      className="relative block h-16 w-full overflow-hidden rounded-md ring-1 ring-black/40"
      style={{ background: preset.bg }}
      aria-hidden="true"
    >
      <span
        className="absolute inset-1.5 rounded-sm"
        style={{
          border:
            preset.style === 'bulbs'
              ? `2px dotted ${preset.accent}`
              : preset.style === 'sprockets'
              ? `2px dashed ${preset.accent}`
              : `2px double ${preset.accent}`,
        }}
      />
      <span className="absolute inset-x-4 top-3 bottom-3 flex flex-col justify-center gap-1">
        <span className="h-3 rounded-[2px] bg-black/45" />
        <span className="h-3 rounded-[2px] bg-black/45" />
      </span>
    </span>
  );
}

/**
 * Pick a sample frame design or upload your own PNG overlay.
 * `frame` is { type:'preset', id } or { type:'custom', image, url, name, width, height }.
 */
export default function FrameCustomizer({ frame, onChange, count }) {
  const inputRef = useRef(null);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const layout = getLayout(count);
  const isCustom = frame.type === 'custom';

  const revokeCurrent = () => {
    if (frame.type === 'custom' && frame.url) URL.revokeObjectURL(frame.url);
  };

  const loadFile = (file) => {
    setError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file (PNG works best).');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('That image is larger than 10 MB. Try a smaller export.');
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      revokeCurrent();
      onChange({
        type: 'custom',
        image: img,
        url,
        name: file.name,
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setError('That file couldn’t be read as an image.');
    };
    img.src = url;
  };

  const remove = () => {
    revokeCurrent();
    setError('');
    onChange({ type: 'preset', id: FRAME_PRESETS[0].id });
    if (inputRef.current) inputRef.current.value = '';
  };

  const downloadTemplate = () =>
    downloadCanvas(makeFrameTemplate(count), `cr8-frame-guide-${count}-frames.png`);

  const aspectOff =
    isCustom && Math.abs(frame.width / frame.height - layout.W / layout.H) / (layout.W / layout.H) > 0.03;

  return (
    <section className="panel" aria-labelledby="frame-title">
      <h2 id="frame-title" className="panel-title">Frame Design</h2>

      <div role="radiogroup" aria-labelledby="frame-title" className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
        {FRAME_PRESETS.map((p) => {
          const active = frame.type === 'preset' && frame.id === p.id;
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => {
                if (!active) {
                  revokeCurrent();
                  onChange({ type: 'preset', id: p.id });
                }
              }}
              className={`flex flex-col gap-1.5 rounded-xl border p-2 text-center transition duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-gold-300/50 ${
                active
                  ? 'scale-[1.03] border-gold-300 bg-gold-400/15 shadow-marquee'
                  : 'border-white/10 bg-black/20 hover:-translate-y-0.5 hover:border-gold-400/50'
              }`}
            >
              <PresetSwatch preset={p} />
              <span className={`text-[11px] font-medium ${active ? 'text-gold-300' : 'text-cream/80'}`}>
                {p.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* upload slot */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          loadFile(e.dataTransfer.files?.[0]);
        }}
        className={`mt-3 rounded-xl border-2 border-dashed p-3 transition duration-200 ${
          dragging ? 'border-gold-300 bg-gold-400/15' : isCustom ? 'border-gold-300/70 bg-gold-400/10' : 'border-gold-400/40 bg-black/20'
        }`}
      >
        {isCustom ? (
          <div className="flex items-center gap-3">
            <img src={frame.url} alt="" className="h-16 w-12 rounded bg-white/90 object-contain ring-1 ring-black/40" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gold-300">{frame.name}</p>
              <p className="text-xs text-cream/60">
                {frame.width}×{frame.height}px · drawn over your photos
              </p>
            </div>
            <button type="button" className="btn-ghost !px-3 !py-1 text-xs" onClick={remove}>
              Remove
            </button>
          </div>
        ) : (
          <p className="text-center text-xs text-cream/70">
            Drop your own frame PNG here, or use the button below.
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/*"
            className="sr-only"
            id="frame-upload"
            onChange={(e) => loadFile(e.target.files?.[0])}
          />
          <label htmlFor="frame-upload" className="btn-ghost cursor-pointer text-xs">
            {isCustom ? 'Replace frame' : 'Upload frame'}
          </label>
          <button type="button" className="btn-ghost text-xs" onClick={downloadTemplate}>
            Download guide
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-2 rounded-lg bg-red-900/50 px-3 py-2 text-xs text-red-200" role="alert">
          {error}
        </p>
      )}
      {aspectOff && (
        <p className="mt-2 rounded-lg bg-gold-500/15 px-3 py-2 text-xs text-gold-300">
          This image isn’t the strip’s proportions, so it will be stretched and the photo windows may not line up.
        </p>
      )}
      <p className="mt-2 text-[11px] leading-relaxed text-cream/55">
        For a custom frame, use a transparent PNG at {layout.W}×{layout.H}px with {count} cutout windows of{' '}
        {layout.cellW}×{layout.cellH}px. The guide download shows exactly where they go.
      </p>
    </section>
  );
}
