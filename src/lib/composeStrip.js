import { drawFilteredPhoto } from './filters.js';

/* ---------- packages ---------- */

export const PACKAGES = [
  { id: 'two', frames: 2, price: 50, label: '2 Frames' },
  { id: 'four', frames: 4, price: 100, label: '4 Frames' },
];
export const MAX_RETAKES = 2;
export const formatPeso = (n) => `₱${n}`;

/* ---------- strip geometry (shared by preview, export and the template) ---------- */

export const STRIP = { W: 640, PAD: 44, GAP: 28, HEADER: 96, FOOTER: 84 };

export function getLayout(count) {
  const cellW = STRIP.W - STRIP.PAD * 2; // 552
  const cellH = Math.round((cellW * 3) / 4); // 414 (4:3)
  const H = STRIP.HEADER + count * cellH + (count - 1) * STRIP.GAP + STRIP.FOOTER;
  const cells = Array.from({ length: count }, (_, i) => ({
    x: STRIP.PAD,
    y: STRIP.HEADER + i * (cellH + STRIP.GAP),
    w: cellW,
    h: cellH,
  }));
  return { W: STRIP.W, H, cellW, cellH, cells };
}

/* ---------- built-in sample frame designs ---------- */

export const FRAME_PRESETS = [
  { id: 'classic', label: 'Classic Cream', bg: '#fbf3e0', ink: '#3b0a0a', accent: '#b08621', style: 'double' },
  { id: 'velvet', label: 'Velvet & Gold', bg: '#6e1212', ink: '#f7de9a', accent: '#f0c75e', style: 'bulbs' },
  { id: 'noir', label: 'Film Reel', bg: '#141414', ink: '#f5f5f5', accent: '#cfcfcf', style: 'sprockets' },
  { id: 'deco', label: 'Art Deco', bg: '#12303b', ink: '#f7de9a', accent: '#d9a93a', style: 'deco' },
];

export const getPreset = (id) => FRAME_PRESETS.find((p) => p.id === id) || FRAME_PRESETS[0];

/* ---------- drawing helpers ---------- */

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (r <= 0) {
    ctx.rect(x, y, w, h);
    return;
  }
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function spacedText(ctx, text, x, y, spacing) {
  if ('letterSpacing' in ctx) {
    ctx.letterSpacing = `${spacing}px`;
    ctx.fillText(text, x, y);
    ctx.letterSpacing = '0px';
  } else {
    ctx.fillText(text, x, y);
  }
}

function drawPresetBase(ctx, { W, H }, p, dateText) {
  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, W, H);

  if (p.id === 'velvet') {
    const g = ctx.createLinearGradient(0, 0, W, 0);
    for (let i = 0; i <= 8; i++) {
      g.addColorStop(i / 8, i % 2 ? 'rgba(255,120,100,0.10)' : 'rgba(0,0,0,0.28)');
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  ctx.strokeStyle = p.accent;
  ctx.fillStyle = p.accent;

  if (p.style === 'double') {
    ctx.lineWidth = 3;
    ctx.strokeRect(14, 14, W - 28, H - 28);
    ctx.lineWidth = 1;
    ctx.strokeRect(21, 21, W - 42, H - 42);
  } else if (p.style === 'bulbs') {
    ctx.shadowColor = p.accent;
    ctx.shadowBlur = 8;
    for (let x = 18; x <= W - 18; x += 28) {
      ctx.beginPath(); ctx.arc(x, 16, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x, H - 16, 4, 0, Math.PI * 2); ctx.fill();
    }
    for (let y = 44; y <= H - 44; y += 28) {
      ctx.beginPath(); ctx.arc(16, y, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(W - 16, y, 4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.shadowBlur = 0;
  } else if (p.style === 'sprockets') {
    ctx.fillStyle = 'rgba(245,245,245,0.85)';
    for (let y = 16; y < H - 20; y += 44) {
      rr(ctx, 12, y, 16, 24, 4); ctx.fill();
      rr(ctx, W - 28, y, 16, 24, 4); ctx.fill();
    }
  } else if (p.style === 'deco') {
    ctx.lineWidth = 3;
    const c = 26;
    const m = 14;
    ctx.beginPath();
    ctx.moveTo(m + c, m); ctx.lineTo(W - m - c, m); ctx.lineTo(W - m, m + c);
    ctx.lineTo(W - m, H - m - c); ctx.lineTo(W - m - c, H - m); ctx.lineTo(m + c, H - m);
    ctx.lineTo(m, H - m - c); ctx.lineTo(m, m + c); ctx.closePath();
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(m + c + 8, m + 8); ctx.lineTo(W - m - c - 8, m + 8);
    ctx.moveTo(m + c + 8, H - m - 8); ctx.lineTo(W - m - c - 8, H - m - 8);
    ctx.stroke();
  }

  // Header
  ctx.textAlign = 'center';
  ctx.fillStyle = p.ink;
  ctx.font = '40px "Abril Fatface", "Playfair Display", Georgia, serif';
  spacedText(ctx, 'CR8 SNAPS', W / 2, 60, 5);
  ctx.fillStyle = p.accent;
  ctx.font = '700 12px "DM Sans", system-ui, sans-serif';
  spacedText(ctx, '★  PHOTO BOOTH  ★', W / 2, 82, 6);

  // Footer
  ctx.fillStyle = p.ink;
  ctx.font = '500 italic 22px "Playfair Display", Georgia, serif';
  ctx.fillText('Thanks for snapping!', W / 2, H - 46);
  ctx.fillStyle = p.accent;
  ctx.font = '700 12px "DM Sans", system-ui, sans-serif';
  spacedText(ctx, dateText.toUpperCase(), W / 2, H - 24, 4);
}

function drawPlaceholder(ctx, cell, index, accent) {
  ctx.save();
  rr(ctx, cell.x, cell.y, cell.w, cell.h, 6);
  ctx.fillStyle = 'rgba(0,0,0,0.38)';
  ctx.fill();
  ctx.setLineDash([10, 8]);
  ctx.lineWidth = 2;
  ctx.strokeStyle = accent;
  ctx.globalAlpha = 0.7;
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = accent;
  ctx.textAlign = 'center';
  ctx.font = '48px "Abril Fatface", Georgia, serif';
  ctx.fillText(String(index + 1), cell.x + cell.w / 2, cell.y + cell.h / 2 + 8);
  ctx.font = '700 13px "DM Sans", system-ui, sans-serif';
  spacedText(ctx, 'YOUR PHOTO HERE', cell.x + cell.w / 2, cell.y + cell.h / 2 + 36, 4);
  ctx.restore();
}

/* ---------- main compositor ---------- */

/**
 * Build the final strip.
 * @param {number} count           2 or 4
 * @param {Array}  photos          raw captured canvases (null for empty slots)
 * @param {object} frame           { type:'preset', id } | { type:'custom', image: HTMLImageElement }
 * @param {string} filterId        id from FILTERS
 * @param {string} dateText        printed in the footer of preset designs
 * @returns {HTMLCanvasElement}
 */
export function composeStrip({ count, photos, frame, filterId = 'none', dateText }) {
  const layout = getLayout(count);
  const canvas = document.createElement('canvas');
  canvas.width = layout.W;
  canvas.height = layout.H;
  const ctx = canvas.getContext('2d');
  const date =
    dateText ||
    new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });

  const custom = frame?.type === 'custom' && frame.image;
  const preset = getPreset(frame?.id);

  if (custom) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, layout.W, layout.H);
  } else {
    drawPresetBase(ctx, layout, preset, date);
  }

  layout.cells.forEach((cell, i) => {
    const photo = photos?.[i];
    if (!photo) {
      drawPlaceholder(ctx, cell, i, custom ? '#888888' : preset.accent);
      return;
    }
    ctx.save();
    rr(ctx, cell.x, cell.y, cell.w, cell.h, custom ? 0 : 6);
    ctx.clip();
    drawFilteredPhoto(ctx, photo, cell.x, cell.y, cell.w, cell.h, filterId);
    ctx.restore();
    if (!custom) {
      rr(ctx, cell.x, cell.y, cell.w, cell.h, 6);
      ctx.lineWidth = 2;
      ctx.strokeStyle = preset.accent;
      ctx.stroke();
    }
  });

  // Custom overlay goes on top of the photos so its cutouts act as windows.
  if (custom) ctx.drawImage(frame.image, 0, 0, layout.W, layout.H);

  return canvas;
}

/* ---------- downloadable guide for designing a custom frame ---------- */

export function makeFrameTemplate(count) {
  const L = getLayout(count);
  const c = document.createElement('canvas');
  c.width = L.W;
  c.height = L.H;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#ece6d6';
  ctx.fillRect(0, 0, L.W, L.H);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#3b0a0a';
  ctx.font = '700 20px "DM Sans", system-ui, sans-serif';
  ctx.fillText(`CR8 SNAPS FRAME GUIDE · ${count} FRAMES`, L.W / 2, 44);
  ctx.font = '500 14px "DM Sans", system-ui, sans-serif';
  ctx.fillText(`Canvas ${L.W} × ${L.H} px`, L.W / 2, 68);

  L.cells.forEach((cell, i) => {
    ctx.fillStyle = 'rgba(255,0,200,0.30)';
    ctx.fillRect(cell.x, cell.y, cell.w, cell.h);
    ctx.setLineDash([10, 8]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#e600b0';
    ctx.strokeRect(cell.x, cell.y, cell.w, cell.h);
    ctx.setLineDash([]);
    ctx.fillStyle = '#7a0060';
    ctx.font = '700 22px "DM Sans", system-ui, sans-serif';
    ctx.fillText(`PHOTO ${i + 1}`, cell.x + cell.w / 2, cell.y + cell.h / 2 - 6);
    ctx.font = '500 14px "DM Sans", system-ui, sans-serif';
    ctx.fillText(
      `${cell.w} × ${cell.h} px at (${cell.x}, ${cell.y})`,
      cell.x + cell.w / 2,
      cell.y + cell.h / 2 + 20
    );
  });

  ctx.fillStyle = '#3b0a0a';
  ctx.font = '500 13px "DM Sans", system-ui, sans-serif';
  ctx.fillText('Design around the magenta windows, then erase them', L.W / 2, L.H - 46);
  ctx.fillText('(make them transparent) and export as PNG.', L.W / 2, L.H - 26);
  return c;
}

/* ---------- export helpers ---------- */

export function downloadCanvas(canvas, filename = 'cr8-snaps-strip.png') {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Could not export image'));
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      resolve();
    }, 'image/png');
  });
}
