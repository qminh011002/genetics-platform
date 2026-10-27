import { describe, expect, it } from 'vitest';

import { isFormCode } from '../codes.js';
import { EGG_COLLECTION_FORM_CODE, eggCollectionSchema } from './egg_collection.js';

const valid = {
  id: '018f3c2e-8d4a-7b1c-9e2f-3a4b5c6d7e8f',
  room_id: '2d3f6a1e-4b5c-4d6e-8f90-a1b2c3d4e5f6',
  collected_on: '2026-10-22',
  egg_mass_mg: '175,4',
  note: '  ',
};

function codesOf(result: ReturnType<typeof eggCollectionSchema.safeParse>) {
  if (result.success) return {};
  const out: Record<string, string> = {};
  for (const issue of result.error.issues) out[issue.path.join('.')] = issue.message;
  return out;
}

describe('eggCollectionSchema', () => {
  it('form_code hợp lệ', () => {
    expect(isFormCode(EGG_COLLECTION_FORM_CODE)).toBe(true);
  });
  it('parse khối lượng gõ bằng dấu phẩy, bỏ ghi chú rỗng', () => {
    const result = eggCollectionSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        id: valid.id,
        room_id: valid.room_id,
        collected_on: '2026-10-22',
        egg_mass_mg: 175.4,
      });
    }
  });
  it('nhận number trực tiếp và ghi chú có nội dung', () => {
    const result = eggCollectionSchema.safeParse({ ...valid, egg_mass_mg: 182, note: ' ok ' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toMatchObject({ egg_mass_mg: 182, note: 'ok' });
  });
  it('thiếu trường → required', () => {
    expect(codesOf(eggCollectionSchema.safeParse({}))).toEqual({
      id: 'required',
      room_id: 'required',
      collected_on: 'required',
      egg_mass_mg: 'required',
    });
    expect(codesOf(eggCollectionSchema.safeParse({ ...valid, egg_mass_mg: '' }))).toEqual({
      egg_mass_mg: 'required',
    });
  });
  it('egg_mass_mg < 1 → out_of_range (INV-77)', () => {
    expect(codesOf(eggCollectionSchema.safeParse({ ...valid, egg_mass_mg: '0,5' }))).toEqual({
      egg_mass_mg: 'out_of_range',
    });
    expect(eggCollectionSchema.safeParse({ ...valid, egg_mass_mg: 1 }).success).toBe(true);
  });
  it('sai định dạng → invalid_format', () => {
    expect(
      codesOf(
        eggCollectionSchema.safeParse({
          ...valid,
          id: 'abc',
          collected_on: '22/10/2026',
          egg_mass_mg: 'nặng',
        }),
      ),
    ).toEqual({
      id: 'invalid_format',
      collected_on: 'invalid_format',
      egg_mass_mg: 'invalid_format',
    });
  });
});
