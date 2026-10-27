// Mã quyền (RBAC) — backend.md §12 (mô hình) + danh mục quyền ban đầu backend.md bản 1.0 §8.2
// (T0201 trích "giữ nguyên nội dung"). Quyền là dữ liệu: Admin sửa ma trận theo vai trò; code CHỈ
// dùng mã quyền, cấm kiểm tên vai trò. Test backend so khớp danh mục này với seed `auth.permission`.

import type { FormCode } from './codes.js';

/** Phạm vi của một quyền: `own` của mình ⊂ `mem` thành viên / người giao ⊂ `all` tất cả. */
export const PERMISSION_SCOPES = ['own', 'mem', 'all'] as const;
export type PermissionScope = (typeof PERMISSION_SCOPES)[number];

const SCOPE_RANK: Readonly<Record<PermissionScope, number>> = { own: 0, mem: 1, all: 2 };

/** Loại quyền: `screen` vào màn, `button` bấm nút, `form` nhập một form đo lường. */
export type PermissionKind = 'screen' | 'button' | 'form';

export interface PermissionMeta {
  kind: PermissionKind;
  /** Chỉ có ở quyền `form`: mã form_def tương ứng (`<form_code>.add`). */
  form_code?: FormCode;
}

/** Danh mục quyền ban đầu. Khoá = mã quyền; thứ tự theo bảng §8.2. */
export const PERMISSIONS = {
  'platform.web': { kind: 'screen' },
  'platform.app': { kind: 'screen' },
  'strain.view': { kind: 'screen' },
  'generation.view': { kind: 'screen' },
  'strain.create': { kind: 'button' },
  'strain.edit': { kind: 'button' },
  'generation.create': { kind: 'button' },
  'master.edit': { kind: 'button' },
  'batch.view': { kind: 'screen' },
  'batch.create': { kind: 'button' },
  'egg_collection.add': { kind: 'form', form_code: 'egg_collection' },
  'egg_weighing.add': { kind: 'form', form_code: 'egg_weighing' },
  'neonate_harvest.add': { kind: 'form', form_code: 'neonate_harvest' },
  'neonate_weighing.add': { kind: 'form', form_code: 'neonate_weighing' },
  'sb_clutch.add': { kind: 'form', form_code: 'sb_clutch' },
  'sb_hatch.add': { kind: 'form', form_code: 'sb_hatch' },
  'sb_clutch_sampling.add': { kind: 'form', form_code: 'sb_clutch_sampling' },
  'sb_phenotype.add': { kind: 'form', form_code: 'sb_phenotype' },
  'sexing.add': { kind: 'form', form_code: 'sexing' },
  'larvae_observation.add': { kind: 'form', form_code: 'larvae_observation' },
  'nursery_observation.add': { kind: 'form', form_code: 'nursery_observation' },
  'pupae_sample.add': { kind: 'form', form_code: 'pupae_sample' },
  'feeding.add': { kind: 'form', form_code: 'feeding' },
  'record.edit': { kind: 'button' },
  'record.delete': { kind: 'button' },
  'stage.set_conditions': { kind: 'button' },
  'stage.close': { kind: 'button' },
  'batch.reopen': { kind: 'button' },
  'label.print': { kind: 'button' },
  'import.run': { kind: 'button' },
  'import.undo': { kind: 'button' },
  'dq.view': { kind: 'screen' },
  'dq.ignore': { kind: 'button' },
  'selection.run': { kind: 'button' },
  'allocation.edit': { kind: 'button' },
  'routine.view': { kind: 'screen' },
  'routine.assign': { kind: 'button' },
  'project.view': { kind: 'screen' },
  'project.view_confidential': { kind: 'screen' },
  'project.create': { kind: 'button' },
  'task.create': { kind: 'button' },
  'task.update_own': { kind: 'button' },
  'task.complete': { kind: 'button' },
  'task.return': { kind: 'button' },
  'report.view': { kind: 'screen' },
  'analytics.view': { kind: 'screen' },
  'export.run': { kind: 'button' },
  'admin.users': { kind: 'screen' },
  'admin.roles': { kind: 'screen' },
  'admin.settings': { kind: 'screen' },
  'audit.view': { kind: 'screen' },
} as const satisfies Record<string, PermissionMeta>;

export type PermissionCode = keyof typeof PERMISSIONS;

export const PERMISSION_CODES = Object.keys(PERMISSIONS) as readonly PermissionCode[];

export function isPermissionCode(value: unknown): value is PermissionCode {
  return typeof value === 'string' && Object.hasOwn(PERMISSIONS, value);
}

/** `egg_collection` → `egg_collection.add`. */
export function formPermission(formCode: FormCode): PermissionCode {
  return `${formCode}.add`;
}

/** Một quyền hiệu lực như `GET /me/permissions` trả (api-standards.md §5.1). */
export interface PermissionGrant {
  scope: PermissionScope;
}

/** `permissions` của `GET /me/permissions`: mã quyền → phạm vi hiệu lực. */
export type PermissionMap = Readonly<
  Partial<Record<PermissionCode | (string & {}), PermissionGrant>>
>;

/**
 * Người dùng có quyền `code` với phạm vi ít nhất là `scope` không?
 * - Không có quyền → `false`.
 * - Bỏ `scope` → chỉ cần có quyền.
 * - Có `scope` → phạm vi được cấp phải ≥ phạm vi yêu cầu (`own` < `mem` < `all`):
 *   `can({ 'record.edit': { scope: 'own' } }, 'record.edit', 'all')` → `false`.
 * UI chỉ dùng để ẩn / hiện nút; server vẫn kiểm (backend.md §12).
 */
export function can(perms: PermissionMap, code: PermissionCode, scope?: PermissionScope): boolean {
  const grant = perms[code];
  if (!grant) return false;
  if (scope === undefined) return true;
  const granted = SCOPE_RANK[grant.scope];
  if (granted === undefined) return false;
  return granted >= SCOPE_RANK[scope];
}
