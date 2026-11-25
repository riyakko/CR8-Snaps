import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { captureFromVideo } from '../lib/capture.js';
import { filterCss, liveOverlayStyle } from '../lib/filters.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const ERRORS = {
  denied: {
    title: 'Camera access was blocked',
    body: 'Allow camera access for this site from your browser’s address bar, then try again.',
  },
  nocamera: {
    title: 'No camera found',
    body: 'Plug in or enable a webcam, then try again.',
  },
  inuse: {
    title: 'Camera is busy',
    body: 'Another app or tab is using the camera. Close it and try again.',
  },
  unsupported: {
    title: 'Camera not supported here',
    body: 'Open CR8 Snaps over HTTPS (or localhost) in an up-to-date browser.',
  },
  error: {
    title: 'Couldn’t start the camera',
    body: 'Something went wrong while opening the camera. Please try again.',
  },
};

function classify(err) {
  switch (err?.name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
    case 'SecurityError':
      return 'denied';
    case 'NotFoundError':
    case 'DevicesNotFoundError':
    case 'OverconstrainedError':
      return 'nocamera';
    case 'NotReadableError':
    case 'TrackStartError':
    case 'AbortError':
      return 'inuse';
    default:
      return 'error';
  }
}

/**
 * Live webcam preview with countdown + flash.
 * Parent controls it through a ref: ref.current.snap(seconds) → Promise<canvas|null>,
 * ref.current.cancel().
 */
const CameraView = forwardRef(function CameraView({ filterId, onReadyChange }, ref) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const token = useRef(0);
  const cancelled = useRef(false);
  const snapping = useRef(false);

  const [status, setStatus] = useState('loading'); // loading | ready | <error key>
  const [count, setCount] = useState(null);
  const [flash, setFlash] = useState(0);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const start = useCallback(async () => {
    const myToken = ++token.current;
    stopStream();
    setStatus('loading');

    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('unsupported');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      // A newer start() or an unmount happened while the permission prompt was open.
      if (myToken !== token.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play().catch(() => {});
      }
      setStatus('ready');
    } catch (err) {
      if (myToken === token.current) setStatus(classify(err));
    }
  }, [stopStream]);

  useEffect(() => {
    start();
    return () => {
      token.current++;
      cancelled.current = true;
      stopStream();
    };
  }, [start, stopStream]);

  useEffect(() => {
    onReadyChange?.(status === 'ready');
  }, [status, onReadyChange]);

  useImperativeHandle(
    ref,
    () => ({
      async snap(seconds = 3) {
        const video = videoRef.current;
        if (status !== 'ready' || snapping.current || !video) return null;
        snapping.current = true;
        cancelled.current = false;
        try {
          for (let n = seconds; n > 0; n--) {
            if (cancelled.current) return null;
            setCount(n);
            await sleep(1000);
          }
          if (cancelled.current) return null;
          setCount(null);
          setFlash((f) => f + 1);
          return captureFromVideo(video);
        } finally {
          setCount(null);
          snapping.current = false;
        }
      },
      cancel() {
        cancelled.current = true;
      },
    }),
    [status]
  );

  const overlay = liveOverlayStyle(filterId);
  const err = ERRORS[status];

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border-4 border-gold-500/70 bg-black shadow-ticket">
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className={`h-full w-full -scale-x-100 object-cover transition-opacity duration-500 ${
          status === 'ready' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ filter: filterCss(filterId), transition: 'filter .3s ease, opacity .5s ease' }}
      />

      {status === 'ready' && overlay && (
        <div className="pointer-events-none absolute inset-0" style={overlay} aria-hidden="true" />
      )}

      {/* viewfinder corners + live light */}
      {status === 'ready' && (
        <>
          <div className="pointer-events-none absolute inset-3 rounded-lg" aria-hidden="true">
            <span className="absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-gold-300/80" />
            <span className="absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-gold-300/80" />
            <span className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-gold-300/80" />
            <span className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-gold-300/80" />
          </div>
          <div className="absolute left-5 top-5 flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-cream">
            <span className="h-2 w-2 animate-bulb rounded-full bg-red-500" /> Live
          </div>
        </>
      )}

      {/* countdown */}
      {count !== null && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/25">
          <span
            key={count}
            className="animate-pop font-marquee text-[7rem] leading-none text-gold-300 drop-shadow-[0_0_28px_rgba(240,199,94,.9)] sm:text-[10rem]"
            aria-live="assertive"
          >
            {count}
          </span>
        </div>
      )}

      {/* shutter flash */}
      {flash > 0 && (
        <div
          key={flash}
          className="pointer-events-none absolute inset-0 animate-flash bg-white"
          aria-hidden="true"
        />
      )}

      {/* loading */}
      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
          <span className="h-10 w-10 animate-spin rounded-full border-4 border-gold-400/30 border-t-gold-300" />
          <p className="text-sm text-cream/80">Warming up the camera…</p>
          <p className="px-6 text-xs text-cream/50">Choose “Allow” when your browser asks.</p>
        </div>
      )}

      {/* errors */}
      {err && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-velvet-950/90 px-6 text-center">
          <span className="text-4xl" aria-hidden="true">📷</span>
          <h3 className="font-display text-xl font-bold text-gold-300">{err.title}</h3>
          <p className="max-w-xs text-sm text-cream/80">{err.body}</p>
          <button type="button" className="btn-gold !px-6 !py-2 text-sm" onClick={start}>
            Try again
          </button>
        </div>
      )}
    </div>
  );
});

export default CameraView;
