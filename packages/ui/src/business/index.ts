// Component nghiệp vụ dùng chung web + mobile (ADR-0009; design-system §6.2).
export { BatchCode, type BatchCodeProps } from './batch-code';
export { Can, PermissionsProvider, useCan, usePermissions, type CanProps } from './can';
export { EmptyState, type EmptyStateProps } from './empty-state';
export { ErrorState, type ErrorStateProps } from './error-state';
export { NoAccess, type NoAccessProps } from './no-access';
export { StateBlock, type StateBlockProps } from './state-block';
export {
  StatusBadge,
  statusInfo,
  STATUS_ENUMS,
  type StatusBadgeProps,
  type StatusKind,
} from './status-badge';
export { StrainBadge, STRAIN_CLASSES, type StrainBadgeProps } from './strain-badge';
