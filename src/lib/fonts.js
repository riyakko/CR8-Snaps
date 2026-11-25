// Canvas text only uses a web font once it has actually been loaded,
// so request the faces the strip draws with before composing.
export function ensureFonts() {
  if (typeof document === 'undefined' || !document.fonts?.load) return Promise.resolve();
  return Promise.all([
    document.fonts.load('40px "Abril Fatface"'),
    document.fonts.load('700 12px "DM Sans"'),
    document.fonts.load('500 14px "DM Sans"'),
    document.fonts.load('italic 500 22px "Playfair Display"'),
  ]).catch(() => {});
}
