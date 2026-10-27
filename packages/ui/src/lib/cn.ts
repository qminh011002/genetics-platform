// Gộp className: clsx (điều kiện) + tailwind-merge (lớp sau thắng lớp trước cùng nhóm).
// tailwind-merge phải biết tên token tuỳ biến của @genetics/design-tokens, nếu không `text-caption`
// bị coi là màu chữ và bị `text-status-open-fg` xoá mất. Danh sách khớp `web.css` (test cn.test.ts).
import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/** `--text-*` trong web.css (design-system.md §4). */
export const TOKEN_TEXT_SIZES = [
  'display',
  'h1',
  'h2',
  'h3',
  'body',
  'body-sm',
  'caption',
  'overline',
  'stat',
  'stat-sm',
  'code',
  'm-title',
  'm-input',
] as const;

/** `--spacing-*` trong web.css (design-system.md §5). */
export const TOKEN_SPACING = [
  'sidebar',
  'content',
  'button-sm',
  'button-md',
  'button-lg',
  'button-xl',
  'input-md',
  'input-lg',
  'segmented',
  'list-row',
  'tab-bar',
  'mobile-header',
  'touch',
  'touch-primary',
  'badge',
] as const;

/** `--radius-*` không có trong Tailwind mặc định. */
export const TOKEN_RADIUS = ['sheet'] as const;

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [...TOKEN_TEXT_SIZES],
      spacing: [...TOKEN_SPACING],
      radius: [...TOKEN_RADIUS],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
