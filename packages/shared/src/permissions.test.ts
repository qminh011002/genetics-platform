import { describe, expect, it } from 'vitest';

import { FORM_CODES } from './codes.js';
import {
  PERMISSIONS,
  PERMISSION_CODES,
  PERMISSION_SCOPES,
  can,
  formPermission,
  isPermissionCode,
} from './permissions.js';

describe('can()', () => {
  it('scope own không đủ cho yêu cầu all (tiêu chí 3)', () => {
    expect(can({ 'record.edit': { scope: 'own' } }, 'record.edit', 'all')).toBe(false);
  });
  it('scope được cấp ≥ yêu cầu → true', () => {
    expect(can({ 'record.edit': { scope: 'all' } }, 'record.edit', 'all')).toBe(true);
    expect(can({ 'record.edit': { scope: 'all' } }, 'record.edit', 'own')).toBe(true);
    expect(can({ 'project.view': { scope: 'mem' } }, 'project.view', 'own')).toBe(true);
    expect(can({ 'project.view': { scope: 'mem' } }, 'project.view', 'all')).toBe(false);
  });
  it('không truyền scope → chỉ cần có quyền', () => {
    expect(can({ 'stage.close': { scope: 'all' } }, 'stage.close')).toBe(true);
    expect(can({ 'record.edit': { scope: 'own' } }, 'record.edit')).toBe(true);
    expect(can({}, 'stage.close')).toBe(false);
  });
  it('thiếu quyền → false kể cả có scope', () => {
    expect(can({ 'batch.view': { scope: 'all' } }, 'stage.close', 'all')).toBe(false);
  });
  it('scope lạ từ server → false', () => {
    const perms = { 'record.edit': { scope: 'everything' } } as unknown as Parameters<
      typeof can
    >[0];
    expect(can(perms, 'record.edit', 'own')).toBe(false);
  });
});

describe('danh mục quyền (backend.md §8.2)', () => {
  it('đủ 51 mã, không trùng, dạng area.action', () => {
    expect(PERMISSION_CODES).toHaveLength(51);
    expect(new Set(PERMISSION_CODES).size).toBe(PERMISSION_CODES.length);
    for (const code of PERMISSION_CODES) expect(code).toMatch(/^[a-z_]+\.[a-z_]+$/);
  });
  it('mỗi form_code có quyền <form>.add và ngược lại', () => {
    const formPerms = PERMISSION_CODES.filter((c) => PERMISSIONS[c].kind === 'form');
    expect(formPerms).toHaveLength(FORM_CODES.length);
    for (const formCode of FORM_CODES) {
      const code = formPermission(formCode);
      expect(PERMISSIONS[code]).toEqual({ kind: 'form', form_code: formCode });
    }
  });
  it('scopes own < mem < all', () => {
    expect(PERMISSION_SCOPES).toEqual(['own', 'mem', 'all']);
  });
  it('type guard', () => {
    expect(isPermissionCode('stage.close')).toBe(true);
    expect(isPermissionCode('manager')).toBe(false);
    expect(isPermissionCode('hasOwnProperty')).toBe(false);
  });
});
