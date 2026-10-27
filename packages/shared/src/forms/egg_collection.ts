// Form Thu trứng (`form_code = egg_collection`) — mẫu cho các form còn lại.
// Trường theo PLAN-001 INV-14 (`batch_id, room_id, collected_on, seq, egg_mass_mg`): `batch_id` nằm
// trên URL, `seq` server cấp; client gửi `id` tự sinh (web.md §9). `egg_mass_mg ≥ 1` (INV-77).
// Board MEggCollect / EggDetail: Phòng, Ngày thu, Khối lượng trứng (mg), Ghi chú.
import { z } from 'zod';

import { decimalField, isoDateField, optionalText, uuidField } from './common.js';

export const EGG_COLLECTION_FORM_CODE = 'egg_collection' as const;

export const eggCollectionSchema = z.object({
  id: uuidField,
  room_id: uuidField,
  collected_on: isoDateField,
  egg_mass_mg: decimalField({ min: 1 }),
  note: optionalText,
});

/** Kiểu giá trị form (trước parse: khối lượng có thể là chuỗi gõ tay). */
export type EggCollectionInput = z.input<typeof eggCollectionSchema>;
/** Kiểu payload gửi `POST /batches/{id}/measurements/egg_collection`. */
export type EggCollectionPayload = z.output<typeof eggCollectionSchema>;
