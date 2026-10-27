// design-system §3.2 `StatusBadge`: nhận `kind` + `value`, tự map token + nhãn vi / en.
// Mapping và nhãn lấy từ @genetics/shared/enums (một nguồn cho web + mobile), không tự định nghĩa.
import * as React from 'react';
import {
  BATCH_STATUS,
  DQ_STATE,
  IMPORT_ROW_STATUS,
  PRIORITY,
  ROUTINE_STATUS,
  SYNC_STATUS,
  TASK_STATUS,
  type BatchStatus,
  type DqState,
  type EnumDef,
  type ImportRowStatus,
  type Locale,
  type Priority,
  type RoutineStatus,
  type StatusToken,
  type SyncStatus,
  type TaskStatus,
} from '@genetics/shared/enums';
import { Badge } from '@genetics/ui/components/badge';

const STATUS_ENUMS = {
  batch: BATCH_STATUS,
  task: TASK_STATUS,
  routine: ROUTINE_STATUS,
  dq: DQ_STATE,
  sync: SYNC_STATUS,
  priority: PRIORITY,
  import_row: IMPORT_ROW_STATUS,
} as const satisfies Record<string, EnumDef<string>>;

type StatusValues = {
  batch: BatchStatus;
  task: TaskStatus;
  routine: RoutineStatus;
  dq: DqState;
  sync: SyncStatus;
  priority: Priority;
  import_row: ImportRowStatus;
};

type StatusKind = keyof StatusValues;

type StatusBadgeProps = {
  [K in StatusKind]: {
    kind: K;
    value: StatusValues[K];
    locale?: Locale;
    /** Phần nối sau nhãn, vd "còn 12 giờ" (batch reopened), "15′" (routine late). */
    detail?: React.ReactNode;
    /** Chấm tròn 6 px cùng màu chữ ở đầu (design-system §3.2). */
    dot?: boolean;
    className?: string;
  };
}[StatusKind];

/** Token + nhãn cho một trạng thái; giá trị lạ (API mới hơn client) → `status-outline` + giá trị thô. */
function statusInfo(
  kind: StatusKind,
  value: string,
  locale?: Locale,
): { token: StatusToken; label: string } {
  const def = STATUS_ENUMS[kind] as EnumDef<string>;
  if (!def.is(value)) return { token: 'status-outline', label: value };
  return { token: def.token(value) ?? 'status-outline', label: def.label(value, locale) };
}

function StatusBadge({ kind, value, locale, detail, dot = false, className }: StatusBadgeProps) {
  const { token, label } = statusInfo(kind, value, locale);
  return (
    <Badge variant={token} data-kind={kind} data-value={value} className={className}>
      {dot && <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-current" />}
      {label}
      {detail !== undefined && detail !== null && (
        <>
          {' · '}
          {detail}
        </>
      )}
    </Badge>
  );
}

export { StatusBadge, statusInfo, STATUS_ENUMS, type StatusBadgeProps, type StatusKind };
