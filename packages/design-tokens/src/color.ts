// Toán màu thuần (không dependency): sRGB hex → OKLCH (Björn Ottosson, dùng trong CSS Color 4 /
// shadcn CLI) và tương phản WCAG 2.x. Chỉ nhận hex 6 chữ số; chuỗi khác (rgba, var()) giữ nguyên.

export type Rgb = readonly [r: number, g: number, b: number];

export const HEX_RE = /^#[0-9a-f]{6}$/i;

export function isHex(value: string): boolean {
  return HEX_RE.test(value);
}

export function hexToRgb(hex: string): Rgb {
  if (!isHex(hex)) throw new Error(`Không phải hex 6 chữ số: ${hex}`);
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function srgbToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** Độ chói tương đối theo WCAG 2.x. */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map(srgbToLinear) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Tỉ lệ tương phản WCAG (≥ 1). */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

export interface Oklch {
  l: number;
  c: number;
  h: number;
}

/** Ngưỡng dưới đó coi là màu không sắc (trắng / đen / xám): c = 0, h = 0 cho đầu ra ổn định. */
const ACHROMATIC_C = 1e-4;

export function hexToOklch(hex: string): Oklch {
  const [r, g, b] = hexToRgb(hex).map(srgbToLinear) as [number, number, number];
  const l_ = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m_ = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s_ = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  const c = Math.hypot(a, bb);
  if (c < ACHROMATIC_C) return { l: clamp01(L), c: 0, h: 0 };
  let h = (Math.atan2(bb, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { l: clamp01(L), c, h };
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

function round(n: number, digits: number): string {
  // Loại "-0" và số 0 thừa để snapshot ổn định giữa các máy.
  const s = n.toFixed(digits).replace(/\.?0+$/, '');
  return s === '-0' ? '0' : s;
}

/** `oklch(L C H)` theo cú pháp CSS Color 4; L/C 4 chữ số lẻ, H 2 chữ số lẻ. */
export function formatOklch({ l, c, h }: Oklch): string {
  return `oklch(${round(l, 4)} ${round(c, 4)} ${round(h, 2)})`;
}

/** Hex → chuỗi `oklch(...)`; giá trị không phải hex (rgba, var()) trả về nguyên bản. */
export function toCssColor(value: string): string {
  return isHex(value) ? formatOklch(hexToOklch(value)) : value;
}
