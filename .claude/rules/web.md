---
paths: ["apps/web/**"]
---
Áp dụng `docs/architecture/web.md` §5 (luật import), §7 (dữ liệu chỉ qua `@genetics/api-client`), §8 (không component ngoài danh sách, không hex), §12 (checklist). Mỗi màn phải khớp board wireframe ghi trong task; có 4 trạng thái UI; chuỗi qua i18n. Trước khi tạo component mới: tìm trong `@genetics/ui`, `components/common`, `design-system.md` §6.
