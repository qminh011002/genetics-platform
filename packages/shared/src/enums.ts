// Enum nghiệp vụ + nhãn vi / en (từ i18n) + token badge (design-system.md §3.2, mapping cố định).
// Giá trị enum lấy từ overview.md §6.1, api-standards.md §14, mobile.md (sync), backend.md §8.2 (scope).
// Nhãn chỉ nằm trong `i18n/*.json`; file này không chứa chuỗi hiển thị.

import { messages, DEFAULT_LOCALE, type Locale } from './i18n/index.js';

export type { Locale } from './i18n/index.js';

/** Token badge trạng thái (design-system.md §3.2). */
export const STATUS_TOKENS = [
  'status-open',
  'status-pending',
  'status-ok',
  'status-closed',
  'status-error',
  'status-warning',
  'status-outline',
] as const;
export type StatusToken = (typeof STATUS_TOKENS)[number];

type EnumName = keyof typeof messages.vi.enum;

export interface EnumOption<V extends string> {
  value: V;
  label: string;
  token?: StatusToken;
}

export interface EnumDef<V extends string> {
  readonly name: EnumName;
  readonly values: readonly V[];
  readonly tokens?: Readonly<Record<V, StatusToken>>;
  is(value: unknown): value is V;
  label(value: V, locale?: Locale): string;
  token(value: V): StatusToken | undefined;
  options(locale?: Locale): EnumOption<V>[];
}

function defineEnum<const V extends string>(
  name: EnumName,
  values: readonly V[],
  tokens?: Readonly<Record<V, StatusToken>>,
): EnumDef<V> {
  const label = (value: V, locale: Locale = DEFAULT_LOCALE): string => {
    const dict = messages[locale].enum[name] as Readonly<Record<string, string>>;
    return dict[value] ?? value;
  };
  const token = (value: V): StatusToken | undefined => tokens?.[value];
  const def: EnumDef<V> = {
    name,
    values,
    is: (value: unknown): value is V => (values as readonly unknown[]).includes(value),
    label,
    token,
    options: (locale) =>
      values.map((value) => {
        const t = token(value);
        return t === undefined
          ? { value, label: label(value, locale) }
          : { value, label: label(value, locale), token: t };
      }),
  };
  if (tokens) (def as { tokens?: Readonly<Record<V, StatusToken>> }).tokens = tokens;
  return def;
}

/** Chương trình nhân giống (overview §6.1). */
export const PROGRAM = defineEnum('program', ['maintenance', 'selective']);
export type Program = (typeof PROGRAM.values)[number];

/** Giai đoạn batch (overview §6.1, §14). */
export const STAGE = defineEnum('stage', ['egg', 'neonate', 'nursery', 'larvae', 'pupae']);
export type Stage = (typeof STAGE.values)[number];

/** Trạng thái batch (overview §6.1; token §3.2). Nhãn `reopened` kèm "còn n giờ" do UI nối thêm. */
export const BATCH_STATUS = defineEnum('batch_status', ['open', 'closed', 'reopened'], {
  open: 'status-open',
  closed: 'status-ok',
  reopened: 'status-pending',
});
export type BatchStatus = (typeof BATCH_STATUS.values)[number];

/** Trạng thái task PM (api-standards §14 luồng transition; token §3.2). */
export const TASK_STATUS = defineEnum(
  'task_status',
  [
    'assigned',
    'in_progress',
    'under_review',
    'requires_amendment',
    'pending',
    'completed',
    'cancelled',
  ],
  {
    assigned: 'status-closed',
    in_progress: 'status-open',
    under_review: 'status-pending',
    requires_amendment: 'status-warning',
    pending: 'status-pending',
    completed: 'status-ok',
    cancelled: 'status-closed',
  },
);
export type TaskStatus = (typeof TASK_STATUS.values)[number];

/** Loại task (overview §7.4). */
export const TASK_KIND = defineEnum('task_kind', ['data', 'general']);
export type TaskKind = (typeof TASK_KIND.values)[number];

/** Trạng thái việc định kỳ (§3.2). Nhãn `late` kèm "n′" do UI nối thêm. */
export const ROUTINE_STATUS = defineEnum(
  'routine_status',
  ['planned', 'done', 'late', 'missed', 'cancelled'],
  {
    planned: 'status-closed',
    done: 'status-ok',
    late: 'status-error',
    missed: 'status-error',
    cancelled: 'status-closed',
  },
);
export type RoutineStatus = (typeof ROUTINE_STATUS.values)[number];

/** Trạng thái lỗi DQ đúng như bảng §3.2 liệt kê (mức + xử lý gộp một hàng). */
export const DQ_STATE = defineEnum('dq_state', ['error', 'warning', 'ignored', 'resolved'], {
  error: 'status-error',
  warning: 'status-warning',
  ignored: 'status-closed',
  resolved: 'status-ok',
});
export type DqState = (typeof DQ_STATE.values)[number];

/** Trạng thái bản ghi trong outbox điện thoại (mobile.md §sync; token §3.2 "đồng bộ"). */
export const SYNC_STATUS = defineEnum('sync_status', ['pending', 'sent', 'conflict', 'failed'], {
  pending: 'status-pending',
  sent: 'status-ok',
  conflict: 'status-error',
  failed: 'status-error',
});
export type SyncStatus = (typeof SYNC_STATUS.values)[number];

/** Độ ưu tiên task (§3.2). */
export const PRIORITY = defineEnum('priority', ['urgent', 'important', 'normal', 'low'], {
  urgent: 'status-error',
  important: 'status-warning',
  normal: 'status-closed',
  low: 'status-outline',
});
export type Priority = (typeof PRIORITY.values)[number];

/** 4 vai trò hệ thống (overview §2; `role.code` trong `GET /me`). Admin có thể thêm vai trò mới. */
export const ROLE = defineEnum('role', ['worker', 'executive', 'manager', 'admin']);
export type Role = (typeof ROLE.values)[number];

/** Nền tảng phiên (api-standards §5). */
export const PLATFORM = defineEnum('platform', ['web', 'app']);
export type Platform = (typeof PLATFORM.values)[number];

/** Line (overview §14). */
export const LINE = defineEnum('line', ['SEL', 'CTR', 'BK']);
export type Line = (typeof LINE.values)[number];

/** Loại container (overview §6.2, §14). */
export const CONTAINER_TYPE = defineEnum('container_type', ['room', 'cage', 'crate']);
export type ContainerType = (typeof CONTAINER_TYPE.values)[number];

/** Trạng thái dòng import (api-standards §14 `GET /imports/{id}/rows?status=`). */
export const IMPORT_ROW_STATUS = defineEnum('import_row_status', ['error', 'warning', 'ok'], {
  error: 'status-error',
  warning: 'status-warning',
  ok: 'status-ok',
});
export type ImportRowStatus = (typeof IMPORT_ROW_STATUS.values)[number];

/** Hiệu lực quyền riêng (backend.md §12 `user_permission.effect`). */
export const PERMISSION_EFFECT = defineEnum('permission_effect', ['grant', 'deny']);
export type PermissionEffect = (typeof PERMISSION_EFFECT.values)[number];

/** Phạm vi quyền (backend.md §8.2 chú thích). Giá trị khớp `PERMISSION_SCOPES` ở permissions.ts. */
export const PERMISSION_SCOPE = defineEnum('permission_scope', ['own', 'mem', 'all']);

export const ENUMS = {
  PROGRAM,
  STAGE,
  BATCH_STATUS,
  TASK_STATUS,
  TASK_KIND,
  ROUTINE_STATUS,
  DQ_STATE,
  SYNC_STATUS,
  PRIORITY,
  ROLE,
  PLATFORM,
  LINE,
  CONTAINER_TYPE,
  IMPORT_ROW_STATUS,
  PERMISSION_EFFECT,
  PERMISSION_SCOPE,
} as const;
