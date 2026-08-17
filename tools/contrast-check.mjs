/**
 * WCAG contrast math + accessible-ink derivation for AI-generated pages.
 *
 *   node tools/contrast-check.mjs "#4CAF7D" "#ffffff"          → ratio + verdict
 *   node tools/contrast-check.mjs --ink "#4CAF7D" "#faf3e3"    → darkest-preserving ink that passes AA
 *
 * WHY THIS EXISTS: a production landing page passed 43 automated content
 * checks while its PRICE was rendered at 2.71:1 against white — below even
 * the large-text minimum. Every check read the DOM; none *looked*. A color
 * only becomes readable or unreadable when composited against its background,
 * and that happens on screen, not in the HTML.
 *
 * The ink derivation scales RGB toward black preserving hue — the brand color
 * stays itself, only darker. Compute it against your DARKEST light background
 * (not white): whatever passes there passes everywhere lighter.
 *
 * Pair rule for the generator: brand accent for FILLS (buttons, chips,
 * borders), derived ink for TEXT — and re-override inside dark sections,
 * where the bright accent is the readable one. Darkening everywhere just
 * recreates the bug on the other side.
 *
 * MIT — Mauro Spigolon <mauro.spigo@gmail.com>
 */
const toRgb = (hex) => {
  const h = hex.trim().replace('#', '');
  const f = h.length === 3 ? [...h].map((c) => c + c).join('') : h;
  if (!/^[0-9a-fA-F]{6}$/.test(f)) throw new Error(`invalid color: ${hex}`);
  return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16));
};
const toHex = (rgb) => '#' + rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

export const luminance = (hex) =>
  toRgb(hex)
    .map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    })
    .reduce((acc, v, i) => acc + [0.2126, 0.7152, 0.0722][i] * v, 0);

export const contrast = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

/** Darkest-hue-preserving ink over a light background that meets `min`. */
export const inkOver = (accent, lightBg, min = 4.5) => {
  for (let k = 100; k >= 0; k--) {
    const c = toHex(toRgb(accent).map((v) => (v * k) / 100));
    if (contrast(c, lightBg) >= min) return c;
  }
  return '#000000';
};

// ── CLI ─────────────────────────────────────────────────────────────────────
import process from 'node:process';
if (import.meta.url === `file:///${process.argv[1]?.replace(/\\/g, '/')}` || process.argv[1]?.endsWith('contrast-check.mjs')) {
  const args = process.argv.slice(2).filter((a) => a !== '--ink');
  const ink = process.argv.includes('--ink');
  const [a, b] = args;
  if (!a || !b) {
    console.log('usage: node tools/contrast-check.mjs [--ink] <colorA> <colorB>');
    process.exit(1);
  }
  if (ink) {
    const derived = inkOver(a, b);
    console.log(`accent ${a} over ${b}: ${contrast(a, b).toFixed(2)}:1`);
    console.log(`derived ink        : ${derived}  → ${contrast(derived, b).toFixed(2)}:1 (AA ≥ 4.5)`);
  } else {
    const r = contrast(a, b);
    const verdict = r >= 4.5 ? 'AA normal text ✅' : r >= 3 ? 'AA large text only ⚠️' : 'fails everything ❌';
    console.log(`${a} vs ${b}: ${r.toFixed(2)}:1 — ${verdict}`);
  }
}
