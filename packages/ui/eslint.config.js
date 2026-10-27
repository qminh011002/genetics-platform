// @genetics/ui: kế thừa config gốc (cấm hex, a11y, react-hooks, i18n chuỗi JSX).
// Thêm: cấm hex nằm BÊN TRONG chuỗi (vd className `bg-[#013db3]`) — luật gốc chỉ bắt literal là
// nguyên một mã hex. Màu chỉ lấy từ token @genetics/design-tokens (design-system.md §3).
import base from '../../eslint.config.base.js';

const baseSyntax = base.find((c) => Array.isArray(c.rules?.['no-restricted-syntax'])).rules[
  'no-restricted-syntax'
];

const noHexInString = {
  selector: 'Literal[value=/#[0-9a-fA-F]{3,8}\\b/]',
  message:
    'Không dùng màu hex trong chuỗi / className; dùng lớp token (bg-primary, text-status-ok-fg…).',
};

export default [
  ...base,
  { ignores: ['dist/**'] },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/**/*.test.{ts,tsx}', 'src/testing/**'],
    rules: { 'no-restricted-syntax': [...baseSyntax, noHexInString] },
  },
];
