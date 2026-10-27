// Bảng thuật ngữ dùng chung (overview.md §14; api-standards.md §21). Tên trường API, bảng DB và nhãn
// i18n dùng cùng từ. PR thêm khái niệm mới phải thêm vào đây và vào overview.md §14.

export interface GlossaryEntry {
  /** Khoá kỹ thuật (dùng trong tên trường / bảng / i18n). */
  key: string;
  /** Thuật ngữ như tài liệu viết. */
  term: string;
  /** Nghĩa (tiếng Việt, theo overview.md §14). */
  meaning: string;
}

export const GLOSSARY = [
  { key: 'batch', term: 'Batch', meaning: 'Nhóm cá thể ở một giai đoạn, có mã như `TMA_F4_BC01`' },
  { key: 'stage', term: 'Stage', meaning: 'Giai đoạn: egg, neonate, nursery, larvae, pupae' },
  {
    key: 'strain',
    term: 'Strain · dòng',
    meaning: 'TMA, TME, REF (Maintenance); MSA, MSB, MSC là scheme của Selective',
  },
  { key: 'line', term: 'Line', meaning: 'SEL (chọn lọc), CTR (đối chứng), BK (dự phòng)' },
  {
    key: 'generation',
    term: 'Generation',
    meaning: 'Thế hệ: F0…F7 (Maintenance), G0…G4 (Selective)',
  },
  { key: 'container', term: 'Container', meaning: 'Phòng (MC), lồng (BC), crate' },
  { key: 'gate', term: 'Gate', meaning: 'Điều kiện để mở form con hoặc bật nút Chốt' },
  {
    key: 'close',
    term: 'Chốt (close)',
    meaning: 'Đóng batch và tạo batch kế trong một transaction',
  },
  { key: 'lineage', term: 'Lineage', meaning: 'Quan hệ batch cha → con qua `batch_transfer`' },
  {
    key: 'individual',
    term: 'Emerge & sexing',
    meaning: 'Ghi từng cá thể nở: ngày nở, giới tính, khối lượng',
  },
  { key: 'clutch', term: 'Clutch', meaning: 'Ổ trứng; `sampling` để cân, `incubated` để ấp' },
  { key: 'fcr', term: 'FCR', meaning: 'Hệ số chuyển hoá thức ăn (wet / dry)' },
  { key: 'dq', term: 'DQ', meaning: 'Data quality: luật kiểm tra dữ liệu' },
  { key: 'routine', term: 'Routine', meaning: 'Việc định kỳ sinh từ protocol' },
  { key: 'pwa', term: 'PWA', meaning: 'Web app cài được lên màn hình điện thoại' },
  { key: 'outbox', term: 'Outbox', meaning: 'Hàng đợi bản ghi chờ gửi trên điện thoại' },
] as const satisfies readonly GlossaryEntry[];

export type GlossaryKey = (typeof GLOSSARY)[number]['key'];

export function glossaryEntry(key: GlossaryKey): GlossaryEntry {
  return GLOSSARY.find((e) => e.key === key) as GlossaryEntry;
}
