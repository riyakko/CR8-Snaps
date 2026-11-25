// Single source of truth for photo filters.
// Each filter is a small "spec" that is turned into:
//   - a CSS filter string (live video preview + canvas ctx.filter)
//   - a pixel-math fallback (for browsers whose canvas ignores ctx.filter, e.g. Safari)
//   - optional extra effects (vignette, grain, halftone) drawn on the canvas

export const FILTERS = [
  { id: 'none', label: 'Original', swatch: 'linear-gradient(135deg,#f4d9b8,#c98f6b)', spec: {} },
  {
    id: 'vintage',
    label: 'Vintage Warm',
    swatch: 'linear-gradient(135deg,#e8c18b,#a2623a)',
    spec: { sepia: 0.35, saturate: 1.25, contrast: 1.1, brightness: 1.05 },
    effects: { vignette: 0.35 },
  },
  {
    id: 'noir',
    label: 'Noir',
    swatch: 'linear-gradient(135deg,#e5e5e5,#1b1b1b)',
    spec: { grayscale: 1, contrast: 1.3, brightness: 0.95 },
    effects: { vignette: 0.3 },
  },
  {
    id: 'sepia',
    label: 'Sepia',
    swatch: 'linear-gradient(135deg,#d9b88a,#5e3b1c)',
    spec: { sepia: 1, contrast: 1.05 },
  },
  {
    id: 'film',
    label: 'Retro Film',
    swatch: 'radial-gradient(circle at 30% 30%,#d8c7a3,#6d5a43)',
    spec: { sepia: 0.2, saturate: 0.85, contrast: 1.25, brightness: 1.05 },
    effects: { vignette: 0.45, grain: true, halftone: true },
  },
  {
    id: 'vivid',
    label: 'Vivid',
    swatch: 'linear-gradient(135deg,#ff6a3d,#3dc2ff)',
    spec: { saturate: 1.7, contrast: 1.15, brightness: 1.05 },
  },
];

export const getFilter = (id) => FILTERS.find((f) => f.id === id) || FILTERS[0];

// Fixed order so CSS and the pixel fallback agree.
export function specToCss(spec = {}) {
  const parts = [];
  if (spec.sepia != null) parts.push(`sepia(${spec.sepia})`);
  if (spec.grayscale != null) parts.push(`grayscale(${spec.grayscale})`);
  if (spec.saturate != null) parts.push(`saturate(${spec.saturate})`);
  if (spec.contrast != null) parts.push(`contrast(${spec.contrast})`);
  if (spec.brightness != null) parts.push(`brightness(${spec.brightness})`);
  return parts.length ? parts.join(' ') : 'none';
}

export const filterCss = (id) => specToCss(getFilter(id).spec);

// Style for a div laid over the live <video> so Retro Film / vignettes preview too.
export function liveOverlayStyle(id) {
  const fx = getFilter(id).effects;
  if (!fx) return null;
  const layers = [];
  const sizes = [];
  if (fx.halftone) {
    layers.push('radial-gradient(circle, rgba(0,0,0,.16) 1px, transparent 1.4px)');
    sizes.push('5px 5px');
  }
  if (fx.vignette) {
    layers.push(`radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,${fx.vignette}) 100%)`);
    sizes.push('100% 100%');
  }
  if (!layers.length) return null;
  return { backgroundImage: layers.join(','), backgroundSize: sizes.join(',') };
}

/* ---------- canvas support detection ---------- */

let nativeSupport = null;
export function supportsCtxFilter() {
  if (nativeSupport !== null) return nativeSupport;
  try {
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.filter = 'grayscale(1)';
    nativeSupport = ctx.filter === 'grayscale(1)';
  } catch {
    nativeSupport = false;
  }
  return nativeSupport;
}

/* ---------- pixel-math fallback ---------- */

const mul = (a, b) => [
  a[0] * b[0] + a[1] * b[3] + a[2] * b[6],
  a[0] * b[1] + a[1] * b[4] + a[2] * b[7],
  a[0] * b[2] + a[1] * b[5] + a[2] * b[8],
  a[3] * b[0] + a[4] * b[3] + a[5] * b[6],
  a[3] * b[1] + a[4] * b[4] + a[5] * b[7],
  a[3] * b[2] + a[4] * b[5] + a[5] * b[8],
  a[6] * b[0] + a[7] * b[3] + a[8] * b[6],
  a[6] * b[1] + a[7] * b[4] + a[8] * b[7],
  a[6] * b[2] + a[7] * b[5] + a[8] * b[8],
];

const sepiaM = (a) => {
  const i = 1 - a;
  return [
    0.393 + 0.607 * i, 0.769 - 0.769 * i, 0.189 - 0.189 * i,
    0.349 - 0.349 * i, 0.686 + 0.314 * i, 0.168 - 0.168 * i,
    0.272 - 0.272 * i, 0.534 - 0.534 * i, 0.131 + 0.869 * i,
  ];
};
const grayM = (a) => {
  const i = 1 - a;
  return [
    0.2126 + 0.7874 * i, 0.7152 - 0.7152 * i, 0.0722 - 0.0722 * i,
    0.2126 - 0.2126 * i, 0.7152 + 0.2848 * i, 0.0722 - 0.0722 * i,
    0.2126 - 0.2126 * i, 0.7152 - 0.7152 * i, 0.0722 + 0.9278 * i,
  ];
};
const satM = (s) => [
  0.213 + 0.787 * s, 0.715 - 0.715 * s, 0.072 - 0.072 * s,
  0.213 - 0.213 * s, 0.715 + 0.285 * s, 0.072 - 0.072 * s,
  0.213 - 0.213 * s, 0.715 - 0.715 * s, 0.072 + 0.928 * s,
];

function applySpecPixels(ctx, w, h, spec) {
  let m = [1, 0, 0, 0, 1, 0, 0, 0, 1];
  if (spec.sepia != null) m = mul(sepiaM(spec.sepia), m);
  if (spec.grayscale != null) m = mul(grayM(spec.grayscale), m);
  if (spec.saturate != null) m = mul(satM(spec.saturate), m);
  const c = spec.contrast ?? 1;
  const b = spec.brightness ?? 1;
  const scale = c * b;
  const offset = (127.5 - 127.5 * c) * b;

  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], bl = d[i + 2];
    d[i] = (m[0] * r + m[1] * g + m[2] * bl) * scale + offset;
    d[i + 1] = (m[3] * r + m[4] * g + m[5] * bl) * scale + offset;
    d[i + 2] = (m[6] * r + m[7] * g + m[8] * bl) * scale + offset;
  }
  ctx.putImageData(img, 0, 0); // Uint8ClampedArray clamps for us
}

/* ---------- extra effects ---------- */

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function drawEffects(ctx, x, y, w, h, fx) {
  if (!fx) return;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  if (fx.halftone) {
    ctx.fillStyle = 'rgba(0,0,0,0.10)';
    ctx.beginPath();
    const step = 5;
    for (let py = y + step / 2; py < y + h; py += step) {
      for (let px = x + step / 2; px < x + w; px += step) {
        ctx.moveTo(px + 1.1, py);
        ctx.arc(px, py, 1.1, 0, Math.PI * 2);
      }
    }
    ctx.fill();
  }

  if (fx.grain) {
    const rand = mulberry32(x * 31 + y * 17 + 7);
    const specks = Math.round((w * h) / 120);
    for (let i = 0; i < specks; i++) {
      const light = rand() > 0.5;
      ctx.fillStyle = light
        ? `rgba(255,255,255,${0.1 + rand() * 0.15})`
        : `rgba(0,0,0,${0.1 + rand() * 0.2})`;
      const s = rand() > 0.85 ? 2 : 1;
      ctx.fillRect(x + rand() * w, y + rand() * h, s, s);
    }
  }

  if (fx.vignette) {
    const g = ctx.createRadialGradient(
      x + w / 2, y + h / 2, Math.min(w, h) * 0.3,
      x + w / 2, y + h / 2, Math.hypot(w, h) / 2
    );
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, `rgba(0,0,0,${fx.vignette})`);
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
  }
  ctx.restore();
}

/**
 * Draw `src` (canvas/image/video) into the rect (x,y,w,h) with the chosen filter.
 * w and h should be integers.
 */
export function drawFilteredPhoto(ctx, src, x, y, w, h, filterId) {
  const f = getFilter(filterId);
  const css = specToCss(f.spec);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (css === 'none') {
    ctx.drawImage(src, x, y, w, h);
  } else if (supportsCtxFilter()) {
    ctx.save();
    ctx.filter = css;
    ctx.drawImage(src, x, y, w, h);
    ctx.restore();
  } else {
    const t = document.createElement('canvas');
    t.width = w;
    t.height = h;
    const tc = t.getContext('2d');
    tc.drawImage(src, 0, 0, w, h);
    applySpecPixels(tc, w, h, f.spec);
    ctx.drawImage(t, x, y);
  }
  drawEffects(ctx, x, y, w, h, f.effects);
}
