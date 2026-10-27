// Trường zod 4 dùng lại cho mọi schema form. Schema form chỉ kiểm HÌNH THỨC (bắt buộc, kiểu, min);
// khoảng hợp lệ theo protocol và DQ do server trả (web.md §9). Thông điệp lỗi = mã `FIELD_ERROR_CODES`
// để UI dịch qua i18n `field_error.*`, giống `errors[].code` của backend.
import { z } from 'zod';

import { parseDecimal } from '../format/index.js';

const requiredOrInvalid = (issue: { input: unknown }) =>
  issue.input === undefined || issue.input === null || issue.input === ''
    ? 'required'
    : 'invalid_format';

/** `id` client sinh (`crypto.randomUUID()`) hoặc id tham chiếu. */
export const uuidField = z.uuid({ error: requiredOrInvalid });

/** Ngày nghiệp vụ `YYYY-MM-DD` (api-standards.md §4). */
export const isoDateField = z.iso.date({ error: requiredOrInvalid });

/** Chuỗi tự do không bắt buộc; rỗng → bỏ. */
export const optionalText = z
  .string()
  .trim()
  .transform((s) => (s === '' ? undefined : s))
  .optional();

export interface DecimalFieldOptions {
  min?: number;
  max?: number;
}

/**
 * Số thập phân người dùng gõ (`"0,0291"` / `"0.0291"`) hoặc number → number.
 * Input kiểu `string | number`, output `number`; lỗi: `required`, `invalid_format`, `out_of_range`.
 */
export function decimalField(options: DecimalFieldOptions = {}) {
  let schema = z.number({ error: requiredOrInvalid });
  if (options.min !== undefined) schema = schema.min(options.min, { error: 'out_of_range' });
  if (options.max !== undefined) schema = schema.max(options.max, { error: 'out_of_range' });
  return z.preprocess((value) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    if (trimmed === '') return undefined;
    return parseDecimal(trimmed) ?? trimmed;
  }, schema);
}
