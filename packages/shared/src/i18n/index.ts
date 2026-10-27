// Từ điển dùng chung web + mobile (lỗi, blocker, lỗi trường, tên form, nhãn enum).
// App nạp vào i18next dưới namespace `shared`; chuỗi riêng từng màn nằm trong app.
import en from './en.json' with { type: 'json' };
import vi from './vi.json' with { type: 'json' };

export const LOCALES = ['vi', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'vi';

export type SharedMessages = typeof vi;

export const messages: Readonly<Record<Locale, SharedMessages>> = { vi, en };

export { vi, en };
