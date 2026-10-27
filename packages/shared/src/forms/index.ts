// Schema zod 4 cho form, dùng chung web + mobile (web.md §9, mobile.md). Thêm form = thêm file
// `<form_code>.ts` + export ở đây; mã form phải có trong `FORM_CODES` (codes.ts).
export { decimalField, isoDateField, optionalText, uuidField } from './common.js';
export type { DecimalFieldOptions } from './common.js';
export {
  EGG_COLLECTION_FORM_CODE,
  eggCollectionSchema,
  type EggCollectionInput,
  type EggCollectionPayload,
} from './egg_collection.js';
