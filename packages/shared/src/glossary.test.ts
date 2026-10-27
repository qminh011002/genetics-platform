import { describe, expect, it } from 'vitest';

import { GLOSSARY, glossaryEntry } from './glossary.js';

describe('GLOSSARY (overview.md §14, api-standards.md §21)', () => {
  it('đủ các khái niệm §21 và không trùng khoá', () => {
    const keys = GLOSSARY.map((e) => e.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const key of [
      'batch',
      'stage',
      'strain',
      'line',
      'generation',
      'container',
      'gate',
      'close',
      'lineage',
      'individual',
      'clutch',
      'fcr',
      'dq',
      'routine',
      'outbox',
    ]) {
      expect(keys).toContain(key);
    }
  });
  it('tra theo khoá', () => {
    expect(glossaryEntry('close').term).toBe('Chốt (close)');
  });
});
