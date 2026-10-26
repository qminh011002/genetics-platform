# Web · hướng dẫn agent (Claude)

Đọc `docs/architecture/web.md` (§4 cấu trúc, §5 luật import, §7 dữ liệu, §8 UI, §12 checklist), `docs/design/design-system.md`, `docs/architecture/api-standards.md` §6–7.

Lệnh: `pnpm --filter @genetics/web dev|build|lint|typecheck|test` · `pnpm test:e2e` · `pnpm test:visual` (Docker) · `VITE_API_MOCK=1 pnpm --filter @genetics/web dev`.

Cấu trúc: `src/{app,routes,features/<x>,components/common,layouts,hooks,lib,styles,testing}`; primitive shadcn ở `@genetics/ui` (package, PR nhãn `shared`); route mỏng chỉ gọi `features/<x>/index.ts`.

Bắt buộc: mọi dữ liệu qua hook `@genetics/api-client`; state lọc trong URL (zod); `can.*` / `blockers` từ API, không tự tính; chuỗi qua i18n; 4 trạng thái (loading / empty / error / no-access); đối chiếu board wireframe ghi trong task và chụp ảnh vào PR.

Cấm: `fetch(` ngoài `lib/api.ts`; import sâu feature khác; hex / px tuỳ ý; component mới ngoài `design-system.md` §6; sửa `packages/api-client/src/generated`; Redux / Zustand cho dữ liệu server; optimistic update dữ liệu nghiệp vụ.
