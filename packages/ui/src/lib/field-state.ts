// design-system §6.1: Input · Textarea · Select · Combobox có trạng thái `error` (viền destructive)
// và `warning` (viền warning, vẫn lưu được). `error` đặt thêm `aria-invalid` để trình đọc màn hình báo.
import type { AriaAttributes } from 'react';
import { cva } from 'class-variance-authority';

export type FieldState = 'default' | 'error' | 'warning';

/** Lớp cho phần tử có viền tự nhận focus (input, textarea, select trigger). */
export const fieldStateVariants = cva('', {
  variants: {
    state: {
      default: '',
      error: 'border-destructive',
      warning: 'border-warning focus-visible:border-warning focus-visible:ring-warning/20',
    },
  },
  defaultVariants: { state: 'default' },
});

/** Lớp cho khung bọc (InputGroup, ô có đơn vị) mà phần tử focus nằm bên trong. */
export const fieldGroupStateVariants = cva('', {
  variants: {
    state: {
      default: '',
      error: 'border-destructive',
      warning:
        'border-warning has-[:focus-visible]:border-warning has-[:focus-visible]:ring-warning/20',
    },
  },
  defaultVariants: { state: 'default' },
});

/** `aria-invalid` theo trạng thái; không ghi đè khi người gọi tự truyền. */
export function fieldStateAria(
  state: FieldState | undefined,
  ariaInvalid: AriaAttributes['aria-invalid'],
): AriaAttributes['aria-invalid'] {
  return ariaInvalid ?? (state === 'error' ? true : undefined);
}
