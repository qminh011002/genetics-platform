// design-system §6.2 `Can`: ẩn con nếu thiếu quyền. Quyền là dữ liệu `GET /me/permissions`
// (api-standards §5.1) do app nạp vào `PermissionsProvider`; UI chỉ ẩn / hiện, server vẫn kiểm.
import * as React from 'react';
import {
  can,
  type PermissionCode,
  type PermissionMap,
  type PermissionScope,
} from '@genetics/shared/permissions';

const EMPTY: PermissionMap = {};
const PermissionsContext = React.createContext<PermissionMap>(EMPTY);

function PermissionsProvider({
  permissions,
  children,
}: {
  permissions: PermissionMap;
  children?: React.ReactNode;
}) {
  return <PermissionsContext.Provider value={permissions}>{children}</PermissionsContext.Provider>;
}

/** Quyền hiệu lực của người dùng hiện tại; không có provider → rỗng (không có quyền gì). */
function usePermissions(): PermissionMap {
  return React.useContext(PermissionsContext);
}

function useCan(perm: PermissionCode, scope?: PermissionScope): boolean {
  return can(usePermissions(), perm, scope);
}

type CanProps = {
  perm: PermissionCode;
  /** Phạm vi tối thiểu (`own` < `mem` < `all`); bỏ trống = chỉ cần có quyền. */
  scope?: PermissionScope;
  /** Hiện thay cho con khi thiếu quyền (mặc định không hiện gì). */
  fallback?: React.ReactNode;
  children?: React.ReactNode;
};

function Can({ perm, scope, fallback = null, children }: CanProps) {
  return <>{useCan(perm, scope) ? children : fallback}</>;
}

export { Can, PermissionsProvider, useCan, usePermissions, type CanProps };
