import { describe, expect, it } from 'vitest';

import {
  BATCH_STATUS,
  ENUMS,
  PRIORITY,
  ROUTINE_STATUS,
  STAGE,
  STATUS_TOKENS,
  TASK_STATUS,
  type EnumDef,
} from './enums.js';
import { messages } from './i18n/index.js';
import { PERMISSION_SCOPES } from './permissions.js';

describe('mapping badge cố định (design-system.md §3.2)', () => {
  it('batch', () => {
    expect(BATCH_STATUS.token('open')).toBe('status-open');
    expect(BATCH_STATUS.token('closed')).toBe('status-ok');
    expect(BATCH_STATUS.token('reopened')).toBe('status-pending');
    expect(BATCH_STATUS.label('closed')).toBe('Đã chốt');
    expect(BATCH_STATUS.label('closed', 'en')).toBe('Closed');
  });
  it('task', () => {
    expect(TASK_STATUS.values).toEqual([
      'assigned',
      'in_progress',
      'under_review',
      'requires_amendment',
      'pending',
      'completed',
      'cancelled',
    ]);
    expect(TASK_STATUS.token('requires_amendment')).toBe('status-warning');
    expect(TASK_STATUS.label('under_review')).toBe('Chờ kiểm tra');
  });
  it('routine / priority', () => {
    expect(ROUTINE_STATUS.token('late')).toBe('status-error');
    expect(ROUTINE_STATUS.label('planned')).toBe('Chưa tới giờ');
    expect(PRIORITY.token('low')).toBe('status-outline');
  });
  it('stage không có token', () => {
    expect(STAGE.token('egg')).toBeUndefined();
    expect(STAGE.options()[0]).toEqual({ value: 'egg', label: 'Egg production' });
  });
});

describe('EnumDef', () => {
  it('is / options', () => {
    expect(BATCH_STATUS.is('open')).toBe(true);
    expect(BATCH_STATUS.is('OPEN')).toBe(false);
    expect(BATCH_STATUS.options('en')).toEqual([
      { value: 'open', label: 'Open', token: 'status-open' },
      { value: 'closed', label: 'Closed', token: 'status-ok' },
      { value: 'reopened', label: 'Reopened', token: 'status-pending' },
    ]);
  });
  it('mọi enum có nhãn vi + en cho mọi giá trị, token hợp lệ, json không thừa khoá', () => {
    const defs = Object.values(ENUMS) as unknown as EnumDef<string>[];
    for (const def of defs) {
      for (const locale of ['vi', 'en'] as const) {
        const dict = messages[locale].enum[def.name] as Record<string, string>;
        expect(Object.keys(dict).sort()).toEqual([...def.values].sort());
        for (const value of def.values) expect(def.label(value, locale)).not.toBe('');
      }
      if (def.tokens) {
        for (const value of def.values) expect(STATUS_TOKENS).toContain(def.token(value));
      }
    }
    expect(Object.keys(messages.vi.enum).sort()).toEqual(
      Object.values(ENUMS)
        .map((d) => d.name)
        .sort(),
    );
  });
  it('PERMISSION_SCOPE khớp PERMISSION_SCOPES', () => {
    expect(ENUMS.PERMISSION_SCOPE.values).toEqual(PERMISSION_SCOPES);
  });
});
