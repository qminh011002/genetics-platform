// Format số / ngày theo tiếng Việt (design-system.md §7):
// dấu phẩy thập phân, dấu chấm hàng nghìn, `dd/mm/yyyy`, `HH:mm` 24 giờ, giờ Việt Nam.
// Chỉ dùng Intl (Node 22 ICU full, trình duyệt hiện đại) — không kéo thư viện ngày.

export const LOCALE = 'vi-VN';
export const TIME_ZONE = 'Asia/Ho_Chi_Minh';

export interface FormatNumberOptions {
  /** Số chữ số thập phân tối thiểu (mặc định 0). */
  minimumFractionDigits?: number;
  /** Số chữ số thập phân tối đa (mặc định 6, đủ cho `0,0291 mg`). */
  maximumFractionDigits?: number;
}

const numberFormatters = new Map<string, Intl.NumberFormat>();

function numberFormatter(min: number, max: number): Intl.NumberFormat {
  const key = `${min}:${max}`;
  let formatter = numberFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(LOCALE, {
      minimumFractionDigits: min,
      maximumFractionDigits: max,
    });
    numberFormatters.set(key, formatter);
  }
  return formatter;
}

/** `1234567.891` → `"1.234.567,891"`; `0.0291` → `"0,0291"`. Không hữu hạn → `""`. */
export function formatNumber(value: number, options: FormatNumberOptions = {}): string {
  if (!Number.isFinite(value)) return '';
  const min = options.minimumFractionDigits ?? 0;
  const max = Math.max(min, options.maximumFractionDigits ?? 6);
  return numberFormatter(min, max).format(value);
}

/** `11140` → `"11.140"` (làm tròn về số nguyên). */
export function formatInt(value: number): string {
  return formatNumber(value, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

/**
 * Tỉ lệ 0–1 → phần trăm một chữ số thập phân, đơn vị cách một khoảng:
 * `0.92` → `"92,0 %"` (design-system.md §7).
 */
export function formatPercent(ratio: number, fractionDigits = 1): string {
  if (!Number.isFinite(ratio)) return '';
  return `${formatNumber(ratio * 100, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })} %`;
}

/** Số kèm đơn vị, cách một khoảng: `formatWithUnit(0.0291, 'mg')` → `"0,0291 mg"`. */
export function formatWithUnit(value: number, unit: string, options?: FormatNumberOptions): string {
  const text = formatNumber(value, options);
  return text === '' ? '' : `${text} ${unit}`;
}

/**
 * Chuỗi người dùng gõ → số. Chấp nhận cả `,` và `.`:
 * - `"0,0291"` → `0.0291` · `"0.0291"` → `0.0291`
 * - `"1.234.567,891"` → `1234567.891` · `"1,234,567.891"` → `1234567.891`
 * - Một dấu phân cách xuất hiện một lần → coi là dấu thập phân (`"11.140"` → `11.14`).
 * - Cùng một dấu xuất hiện nhiều lần (không có dấu khác) → hàng nghìn (`"1.234.567"` → `1234567`).
 * Trả `null` khi không phải số.
 */
export function parseDecimal(input: string | number | null | undefined): number | null {
  if (typeof input === 'number') return Number.isFinite(input) ? input : null;
  if (input == null) return null;
  const raw = input.replace(/[\s\u00a0\u202f_]/g, '');
  if (raw === '' || !/^[-+]?[0-9.,]+$/.test(raw)) return null;

  const lastComma = raw.lastIndexOf(',');
  const lastDot = raw.lastIndexOf('.');
  let normalized: string;
  if (lastComma !== -1 && lastDot !== -1) {
    // Có cả hai: dấu xuất hiện sau cùng là thập phân, dấu còn lại là hàng nghìn.
    normalized =
      lastComma > lastDot ? raw.replace(/\./g, '').replace(',', '.') : raw.replace(/,/g, '');
  } else if (lastComma !== -1) {
    normalized = countChar(raw, ',') > 1 ? raw.replace(/,/g, '') : raw.replace(',', '.');
  } else if (lastDot !== -1) {
    normalized = countChar(raw, '.') > 1 ? raw.replace(/\./g, '') : raw;
  } else {
    normalized = raw;
  }

  if (!/^[-+]?(\d+(\.\d*)?|\.\d+)$/.test(normalized)) return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

function countChar(text: string, ch: string): number {
  let n = 0;
  for (const c of text) if (c === ch) n += 1;
  return n;
}

export type DateInput = Date | string | number;

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Ngày nghiệp vụ `YYYY-MM-DD` (api-standards.md §4) → `dd/mm/yyyy`, không đổi múi giờ. */
function formatIsoDate(iso: string): string | null {
  const m = ISO_DATE.exec(iso);
  if (!m) return null;
  return `${m[3]}/${m[2]}/${m[1]}`;
}

function toDate(input: DateInput): Date | null {
  const date = input instanceof Date ? input : new Date(input);
  return Number.isNaN(date.getTime()) ? null : date;
}

const dateTimeFormatters = new Map<string, Intl.DateTimeFormat>();

function dateTimeFormatter(options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = JSON.stringify(options);
  let formatter = dateTimeFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(LOCALE, { timeZone: TIME_ZONE, ...options });
    dateTimeFormatters.set(key, formatter);
  }
  return formatter;
}

function parts(input: Date, options: Intl.DateTimeFormatOptions): Record<string, string> {
  const out: Record<string, string> = {};
  for (const p of dateTimeFormatter(options).formatToParts(input)) out[p.type] = p.value;
  return out;
}

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
};
const TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
};

/**
 * `dd/mm/yyyy` theo giờ Việt Nam. Chuỗi `YYYY-MM-DD` được hiểu là ngày nghiệp vụ và giữ nguyên.
 * Giá trị không hợp lệ → `""`.
 */
export function formatDate(input: DateInput): string {
  if (typeof input === 'string') {
    const iso = formatIsoDate(input);
    if (iso) return iso;
  }
  const date = toDate(input);
  if (!date) return '';
  const p = parts(date, DATE_OPTIONS);
  return `${p.day}/${p.month}/${p.year}`;
}

/** `HH:mm` 24 giờ theo giờ Việt Nam. Không hợp lệ → `""`. */
export function formatTime(input: DateInput): string {
  const date = toDate(input);
  if (!date) return '';
  const p = parts(date, TIME_OPTIONS);
  return `${p.hour}:${p.minute}`;
}

/** `dd/mm/yyyy HH:mm` theo giờ Việt Nam. Không hợp lệ → `""`. */
export function formatDateTime(input: DateInput): string {
  const date = toDate(input);
  if (!date) return '';
  return `${formatDate(date)} ${formatTime(date)}`;
}

/** Ngày nghiệp vụ `YYYY-MM-DD` của một thời điểm theo giờ Việt Nam (để so "hôm nay", gửi API). */
export function toBusinessDate(input: DateInput): string {
  const date = toDate(input);
  if (!date) return '';
  const p = parts(date, DATE_OPTIONS);
  return `${p.year}-${p.month}-${p.day}`;
}
