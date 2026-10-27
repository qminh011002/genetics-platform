// Danh mục mã ổn định của API (api-standards.md §7.1, §14; ADR-0007).
// File này là NGUỒN cho test backend `test_error_codes_match_shared` (T0303) và test form_def (T0201):
// giữ đúng định dạng — mỗi mã một dòng, dạng `code: status,` (ERROR_CODES) hoặc `'code',` (các mảng).
// Thêm mã mới = sửa bảng trong api-standards.md §7 + file này + danh mục Python trong cùng PR.

/** `code` của lỗi HTTP → status (api-standards.md §7.1). */
export const ERROR_CODES = {
  bad_request: 400,
  unauthenticated: 401,
  token_expired: 401,
  account_pending: 403,
  platform_not_allowed: 403,
  permission_denied: 403,
  not_found: 404,
  batch_closed: 409,
  gate_not_met: 409,
  dq_blocking: 409,
  duplicate_code: 409,
  duplicate_id: 409,
  has_children: 409,
  generation_not_latest: 409,
  invalid_transition: 409,
  assignee_lacks_permission: 409,
  idempotency_key_reused: 409,
  import_not_validated: 409,
  import_undo_expired: 409,
  version_conflict: 412,
  payload_too_large: 413,
  unsupported_media_type: 415,
  validation_failed: 422,
  reason_required: 422,
  edit_window_expired: 422,
  precondition_required: 428,
  rate_limited: 429,
  internal_error: 500,
  service_unavailable: 503,
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;
export type ErrorStatus = (typeof ERROR_CODES)[ErrorCode];

export const ERROR_CODE_LIST = Object.keys(ERROR_CODES) as readonly ErrorCode[];

/** Mã trong `blockers[]` (gate chốt / mở form) — api-standards.md §7.1 nhóm "Gate". */
export const BLOCKER_CODES = [
  'missing_population_size',
  'missing_sexing',
  'missing_egg_collection',
  'missing_egg_weighing',
  'pending_individuals',
  'missing_neonate_harvest',
  'missing_neonate_weighing',
  'missing_conditions',
  'missing_larvae_observation',
  'missing_pupae_sample',
  'branch_required',
  'dq_errors_open',
] as const;

export type BlockerCode = (typeof BLOCKER_CODES)[number];

/** Mã trong `errors[].code` của lỗi 422 theo trường — api-standards.md §7.1 nhóm "Trường". */
export const FIELD_ERROR_CODES = [
  'required',
  'out_of_range',
  'outside_batch_dates',
  'invalid_format',
  'unknown_reference',
  'duplicate_record',
  'not_latest_generation',
] as const;

export type FieldErrorCode = (typeof FIELD_ERROR_CODES)[number];

/** `form_code` hợp lệ (bảng `core.form_def`) — api-standards.md §14. */
export const FORM_CODES = [
  'egg_collection',
  'egg_weighing',
  'sexing',
  'neonate_harvest',
  'neonate_weighing',
  'larvae_observation',
  'nursery_observation',
  'pupae_sample',
  'feeding',
  'sb_clutch',
  'sb_clutch_sampling',
  'sb_hatch',
  'sb_phenotype',
] as const;

export type FormCode = (typeof FORM_CODES)[number];

export function isErrorCode(value: unknown): value is ErrorCode {
  return typeof value === 'string' && Object.hasOwn(ERROR_CODES, value);
}

export function isBlockerCode(value: unknown): value is BlockerCode {
  return typeof value === 'string' && (BLOCKER_CODES as readonly string[]).includes(value);
}

export function isFieldErrorCode(value: unknown): value is FieldErrorCode {
  return typeof value === 'string' && (FIELD_ERROR_CODES as readonly string[]).includes(value);
}

export function isFormCode(value: unknown): value is FormCode {
  return typeof value === 'string' && (FORM_CODES as readonly string[]).includes(value);
}

/** Một blocker trong `blockers[]` / `can.close_blockers[]`. */
export interface Blocker {
  code: BlockerCode;
  params?: Record<string, unknown>;
}

/** Một lỗi theo trường trong `errors[]` của 422. */
export interface FieldError {
  field: string;
  code: FieldErrorCode;
  message?: string;
  params?: Record<string, unknown>;
}

/** Thân lỗi `application/problem+json` (RFC 9457 + mở rộng, ADR-0007). */
export interface Problem {
  type: string;
  title: string;
  status: ErrorStatus | number;
  code: ErrorCode;
  detail?: string;
  trace_id: string;
  blockers?: Blocker[];
  errors?: FieldError[];
  required_permission?: string;
  scope?: string;
  current_version?: number;
  allowed?: string[];
}
