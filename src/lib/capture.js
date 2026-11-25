// Grab a centered 4:3 still from a <video>, mirrored to match the selfie preview.
// The raw (unfiltered) canvas is kept so the filter can be changed after capture.
export function captureFromVideo(video, { mirror = true, maxWidth = 1280 } = {}) {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) return null;

  const target = 4 / 3;
  let sw = vw;
  let sh = vh;
  if (vw / vh > target) sw = vh * target;
  else sh = vw / target;
  const sx = (vw - sw) / 2;
  const sy = (vh - sh) / 2;

  const outW = Math.min(maxWidth, Math.round(sw));
  const outH = Math.round((outW * 3) / 4);
  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d');
  if (mirror) {
    ctx.translate(outW, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, outW, outH);
  return canvas;
}
