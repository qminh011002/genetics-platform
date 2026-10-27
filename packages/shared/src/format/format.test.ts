import { describe, expect, it } from 'vitest';

import {
  formatDate,
  formatDateTime,
  formatInt,
  formatNumber,
  formatPercent,
  formatTime,
  formatWithUnit,
  parseDecimal,
  toBusinessDate,
} from './index.js';

describe('formatNumber', () => {
  it('dùng dấu chấm hàng nghìn, phẩy thập phân (tiêu chí 1)', () => {
    expect(formatNumber(1234567.891)).toBe('1.234.567,891');
  });
  it('giữ chữ số thập phân nhỏ', () => {
    expect(formatNumber(0.0291)).toBe('0,0291');
  });
  it('tôn trọng min / max fraction digits', () => {
    expect(formatNumber(5, { minimumFractionDigits: 2 })).toBe('5,00');
    expect(formatNumber(1.23456, { maximumFractionDigits: 2 })).toBe('1,23');
  });
  it('không hữu hạn → chuỗi rỗng', () => {
    expect(formatNumber(Number.NaN)).toBe('');
    expect(formatNumber(Number.POSITIVE_INFINITY)).toBe('');
  });
});

describe('formatInt / formatPercent / formatWithUnit', () => {
  it('formatInt(11140) → "11.140"', () => {
    expect(formatInt(11140)).toBe('11.140');
    expect(formatInt(0)).toBe('0');
  });
  it('formatPercent(0.92) → "92,0 %"', () => {
    expect(formatPercent(0.92)).toBe('92,0 %');
    expect(formatPercent(0.536)).toBe('53,6 %');
    expect(formatPercent(1)).toBe('100,0 %');
  });
  it('đơn vị cách số một khoảng', () => {
    expect(formatWithUnit(0.0291, 'mg')).toBe('0,0291 mg');
    expect(formatWithUnit(Number.NaN, 'mg')).toBe('');
  });
});

describe('parseDecimal', () => {
  it('chấp nhận dấu phẩy thập phân (tiêu chí 1)', () => {
    expect(parseDecimal('0,0291')).toBe(0.0291);
  });
  it('chấp nhận dấu chấm thập phân', () => {
    expect(parseDecimal('0.0291')).toBe(0.0291);
    expect(parseDecimal('11.140')).toBe(11.14);
  });
  it('phân biệt hàng nghìn khi có cả hai dấu', () => {
    expect(parseDecimal('1.234.567,891')).toBe(1234567.891);
    expect(parseDecimal('1,234,567.891')).toBe(1234567.891);
  });
  it('cùng một dấu lặp lại là hàng nghìn', () => {
    expect(parseDecimal('1.234.567')).toBe(1234567);
    expect(parseDecimal('1,234,567')).toBe(1234567);
  });
  it('bỏ khoảng trắng, cho dấu âm, nhận number', () => {
    expect(parseDecimal(' 1 234,5 ')).toBe(1234.5);
    expect(parseDecimal('-0,5')).toBe(-0.5);
    expect(parseDecimal(3)).toBe(3);
  });
  it('không phải số → null', () => {
    expect(parseDecimal('')).toBeNull();
    expect(parseDecimal('abc')).toBeNull();
    expect(parseDecimal('1,2,3.4.5')).toBeNull();
    expect(parseDecimal(null)).toBeNull();
    expect(parseDecimal(undefined)).toBeNull();
    expect(parseDecimal(Number.NaN)).toBeNull();
  });
});

describe('formatDate / formatTime / formatDateTime (Asia/Ho_Chi_Minh)', () => {
  const instant = new Date('2026-10-22T03:05:00Z'); // 10:05 giờ VN

  it('đổi múi giờ UTC → VN', () => {
    expect(formatDate(instant)).toBe('22/10/2026');
    expect(formatTime(instant)).toBe('10:05');
    expect(formatDateTime(instant)).toBe('22/10/2026 10:05');
  });
  it('qua ngày khi đổi múi giờ', () => {
    const late = new Date('2026-10-22T17:30:00Z'); // 00:30 ngày 23 giờ VN
    expect(formatDate(late)).toBe('23/10/2026');
    expect(formatTime(late)).toBe('00:30');
    expect(toBusinessDate(late)).toBe('2026-10-23');
  });
  it('ngày nghiệp vụ YYYY-MM-DD giữ nguyên, không đổi múi giờ', () => {
    expect(formatDate('2026-10-22')).toBe('22/10/2026');
  });
  it('nhận chuỗi ISO và epoch ms', () => {
    expect(formatDate('2026-10-22T03:05:00Z')).toBe('22/10/2026');
    expect(formatTime(instant.getTime())).toBe('10:05');
  });
  it('không hợp lệ → chuỗi rỗng', () => {
    expect(formatDate('không phải ngày')).toBe('');
    expect(formatTime('x')).toBe('');
    expect(formatDateTime(Number.NaN)).toBe('');
  });
});
