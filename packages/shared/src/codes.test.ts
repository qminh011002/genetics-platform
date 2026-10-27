import { describe, expect, it } from 'vitest';

import {
  BLOCKER_CODES,
  ERROR_CODES,
  ERROR_CODE_LIST,
  FIELD_ERROR_CODES,
  FORM_CODES,
  isBlockerCode,
  isErrorCode,
  isFieldErrorCode,
  isFormCode,
} from './codes.js';
import { messages } from './i18n/index.js';

describe('ERROR_CODES (api-standards.md §7.1)', () => {
  it('đủ 29 mã, status đúng bảng', () => {
    expect(ERROR_CODE_LIST).toHaveLength(29);
    expect(ERROR_CODES.gate_not_met).toBe(409);
    expect(ERROR_CODES.version_conflict).toBe(412);
    expect(ERROR_CODES.precondition_required).toBe(428);
    expect(ERROR_CODES.edit_window_expired).toBe(422);
    expect(ERROR_CODES.import_undo_expired).toBe(409);
  });
  it('mã là snake_case, status 4xx / 5xx', () => {
    for (const [code, status] of Object.entries(ERROR_CODES)) {
      expect(code).toMatch(/^[a-z][a-z0-9_]*$/);
      expect(status).toBeGreaterThanOrEqual(400);
      expect(status).toBeLessThan(600);
    }
  });
  it('type guard', () => {
    expect(isErrorCode('not_found')).toBe(true);
    expect(isErrorCode('toString')).toBe(false);
    expect(isErrorCode(404)).toBe(false);
  });
});

describe('BLOCKER_CODES / FIELD_ERROR_CODES / FORM_CODES', () => {
  it('đúng số lượng và không trùng', () => {
    expect(BLOCKER_CODES).toHaveLength(12);
    expect(FIELD_ERROR_CODES).toHaveLength(7);
    expect(FORM_CODES).toHaveLength(13);
    for (const list of [BLOCKER_CODES, FIELD_ERROR_CODES, FORM_CODES]) {
      expect(new Set(list).size).toBe(list.length);
    }
  });
  it('type guards', () => {
    expect(isBlockerCode('pending_individuals')).toBe(true);
    expect(isBlockerCode('not_found')).toBe(false);
    expect(isFieldErrorCode('out_of_range')).toBe(true);
    expect(isFieldErrorCode('required ')).toBe(false);
    expect(isFormCode('egg_collection')).toBe(true);
    expect(isFormCode('egg')).toBe(false);
  });
});

describe('i18n phủ mọi mã', () => {
  it.each(['vi', 'en'] as const)('%s có nhãn cho mọi error / blocker / field / form', (locale) => {
    const dict = messages[locale];
    for (const code of ERROR_CODE_LIST) expect(dict.error).toHaveProperty(code);
    for (const code of BLOCKER_CODES) expect(dict.blocker).toHaveProperty(code);
    for (const code of FIELD_ERROR_CODES) expect(dict.field_error).toHaveProperty(code);
    for (const code of FORM_CODES) expect(dict.form).toHaveProperty(code);
    expect(Object.keys(dict.error)).toHaveLength(ERROR_CODE_LIST.length);
    expect(Object.keys(dict.blocker)).toHaveLength(BLOCKER_CODES.length);
    expect(Object.keys(dict.field_error)).toHaveLength(FIELD_ERROR_CODES.length);
    expect(Object.keys(dict.form)).toHaveLength(FORM_CODES.length);
  });
});
