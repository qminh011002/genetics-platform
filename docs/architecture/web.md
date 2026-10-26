# Web · React + TypeScript, kiến trúc theo feature, shadcn/ui

> Phạm vi: `apps/web` (tên dự án `genetics_platforms_web`, package `@genetics/web`). Chủ sở hữu code: **Claude (web)**. Giao diện máy tính cho Executive, Manager, Admin.
> Đọc trước: `overview.md`, `api-standards.md`, `docs/design/design-system.md`, `quality-standards.md`. Quyết định nền: ADR-0008 (kiến trúc web), ADR-0009 (UI / shadcn / token), ADR-0006 (client sinh từ OpenAPI).
> Tham chiếu màn hình: canvas Genetics Platform Wireframes (`docs/genetics-platform-wireframes/`); tên board ghi trong cột "Wireframe". **Wireframe là thiết kế đã duyệt: không thiết kế lại màn.**

## 1. Yêu cầu dẫn tới thiết kế

| Yêu cầu | Hệ quả |
|---|---|
| 95 màn máy tính theo 13 feature, đã duyệt (PLAN-001 §B.1) | Tổ chức theo feature; mỗi board wireframe map tới một page / dialog có tên |
| Server quyết định quyền và điều kiện (`api-standards.md` §6) | Web không tính KPI, không suy quyền; chỉ hiển thị `can.*` / `blockers` |
| Hai agent frontend làm song song với backend | Client sinh từ `contracts/openapi/openapi.json`; mock MSW sinh cùng lúc để làm UI trước khi API xong |
| Người dùng ~10, dữ liệu nhỏ, mạng nội bộ | Không SSR, không framework server; SPA Vite |
| Agent AI phải hiểu nhanh và không tạo component trùng | Ranh giới import kiểm bằng ESLint; danh sách component nghiệp vụ cố định; checklist "trước khi tạo component mới" |

## 2. Phương án đã cân nhắc

| Phương án | Ưu | Nhược với dự án này | Kết luận |
|---|---|---|---|
| Layered frontend (`components/`, `hooks/`, `services/`, `pages/` theo loại file) | Quen thuộc | 13 feature → thư mục `components/` hàng trăm file; không có ranh giới để chia việc cho agent; dependency rối | Không chọn |
| Feature-Sliced Design v2.1 (app / pages / widgets / features / entities / shared) | Luật import rõ, có linter riêng (Steiger) | 7 lớp cố định là quá nhiều cho SPA nội bộ; phân biệt entities / features / widgets gây tranh luận không cần thiết cho agent; FSD tự cảnh báo barrel file gây vòng import | Mượn luật "chỉ import từ lớp dưới" và "public API qua index" |
| Domain-oriented modules (mỗi module tự có route, state, UI, hoàn toàn độc lập) | Độc lập cao | Trùng lặp component dùng chung (DataTable, BatchHead) hoặc phải tạo shared package sớm | Không chọn nguyên bản |
| **Feature-based (bulletproof-react) + luật đơn hướng `shared → features → app`** | Đơn giản, map 1:1 với route và wireframe, có cấu hình ESLint mẫu, agent dễ đoán vị trí file | Cần kỷ luật public API (`index.ts`) và luật "feature không import feature" | **Chọn** (ADR-0008) |

Nguồn: FSD docs (layers, public API), bulletproof-react `project-structure.md`, eslint-plugin-boundaries 7 (`research-references.md` §C).

## 3. Công nghệ (phiên bản xác minh 26/10/2026)

| Việc | Chọn | Ghi chú |
|---|---|---|
| Build | Vite 8 (Rolldown), TypeScript `strict`, alias `@/` | Node ≥ 22.12 |
| UI | shadcn/ui CLI 4, **Base UI** làm primitive mặc định (ADR-0009; `-b radix` là phương án thay thế), Tailwind CSS 4 (`@theme`), `lucide-react` | shadcn: "không phải thư viện, là cách bạn xây thư viện của mình" — component nằm trong repo |
| React | 19.3; React Compiler 1.0 **bật** qua `@rolldown/plugin-babel` + `reactCompilerPreset()`; lint `eslint-plugin-react-hooks` recommended | Pin đúng phiên bản compiler |
| Router | TanStack Router 1.x, file-based, `validateSearch` với zod 4 (không cần adapter), `beforeLoad` + `redirect` cho guard, `autoCodeSplitting` | Guard route không phải ranh giới quyền; API mới là |
| Dữ liệu server | TanStack Query 5 + client sinh bởi **orval 8** (ADR-0006): hook `useX` theo `operationId`, mock MSW, schema zod | `queryClient` trong router context; loader `queryClient.ensureQueryData` / `query` để prefetch |
| Bảng | TanStack Table **v9** (`useTable`, `tableFeatures()`), `@tanstack/react-virtual` 3 | shadcn data-table example có thể còn v8: viết `DataTable` của mình theo v9 |
| Form | react-hook-form 7 + zod 4 (`zodResolver` từ `@hookform/resolvers` 6) | Schema dùng chung trong `@genetics/shared` |
| Biểu đồ | Recharts | Màu từ `tokens.ts` |
| Đăng nhập | `@azure/msal-browser` 5 + `@azure/msal-react` 5, **redirect flow**, `handleRedirectPromise()` mỗi lần tải, `cacheLocation: sessionStorage` (web) | Không trộn popup / redirect |
| i18n | i18next 26 + react-i18next 17; `vi` mặc định; tiếng Việt chỉ có dạng số nhiều `other` | Không dùng ICU ở bản đầu |
| Ngày / số | `date-fns` + `date-fns-tz`; `Intl.NumberFormat('vi-VN')` qua helper `@genetics/shared/format` | `1.234.567,891` |
| Test | Vitest 5 + Testing Library + MSW (pin **2.x** tới khi mock orval xác nhận chạy trên MSW 3); Playwright 1.64 (e2e, `toHaveScreenshot`, `@axe-core/playwright`) | Playwright component-test cũ đã bỏ: dùng trang gallery + e2e |
| Lint | ESLint 10 flat config: typescript-eslint, react-hooks, jsx-a11y, `eslint-plugin-boundaries` 7 (`policies`), Prettier + `prettier-plugin-tailwindcss` | |

## 4. Cấu trúc thư mục

```
apps/web/
├─ index.html
├─ vite.config.ts                  # plugin-react, rolldown babel (React Compiler), TanStack Router plugin
├─ components.json                 # shadcn: style new-york, base ui, cssVariables, aliases
├─ orval.config.ts                 # KHÔNG: orval chạy ở packages/api-client; web chỉ import
├─ eslint.config.js                # boundaries policies (mục 5)
├─ src/
│  ├─ main.tsx                     # MsalProvider → QueryClientProvider → RouterProvider
│  ├─ app/                         # cấu hình toàn app, không chứa nghiệp vụ
│  │  ├─ providers.tsx
│  │  ├─ query-client.ts           # retry, staleTime, xử lý 401 / 403 chung
│  │  ├─ router.tsx                # createRouter({ context: { auth, queryClient } })
│  │  ├─ auth/                     # msal config, useAccessToken, AuthGate, PlatformGate
│  │  └─ i18n/
│  ├─ routes/                      # TanStack Router file-based — file mỏng, chỉ gọi page của feature
│  │  ├─ __root.tsx                # errorComponent, notFoundComponent mặc định
│  │  ├─ _app.tsx                  # AppShell + beforeLoad: require login + platform.web
│  │  ├─ _app/index.tsx
│  │  ├─ _app/batches/index.tsx    # validateSearch(batchSearchSchema)
│  │  ├─ _app/batches/$batchId.tsx
│  │  └─ …
│  ├─ features/                    # một thư mục một feature (mục 6)
│  ├─ components/
│  │  └─ common/                   # component nghiệp vụ của web (danh sách cố định, mục 8); primitive shadcn nằm ở packages/ui (@genetics/ui)
│  ├─ layouts/                     # AppShell, AppSidebar (nav.ts), Topbar, Breadcrumb
│  ├─ hooks/                       # hook không thuộc feature (useDebounce…)
│  ├─ lib/                         # api.ts (fetch mutator cho orval: token, X-Request-ID, problem+json), utils
│  ├─ styles/globals.css           # @import "tailwindcss"; @import "@genetics/design-tokens/web.css"
│  └─ testing/                     # render helpers, msw server, fixtures
├─ e2e/                            # Playwright: *.spec.ts, screenshots/, a11y
└─ gallery/                        # route /__gallery (chỉ dev/test): mỗi component common + variant → visual test
```

## 5. Luật import (kiểm bằng `eslint-plugin-boundaries`)

Phần tử: `app`, `routes`, `features` (capture `feature`), `components-common`, `layouts`, `hooks`, `lib`, `shared-pkg` (`@genetics/*`, gồm `@genetics/ui`).

| Từ | Được import | Cấm |
|---|---|---|
| `routes/*` | `features/<x>/index.ts`, `layouts`, `app` | nội bộ feature |
| `features/<x>/*` | nội bộ `features/<x>`, `components/*`, `hooks`, `lib`, `@genetics/*`; `features/<y>/index.ts` **chỉ** khi có ghi chú lý do trong PR | `features/<y>/components/*`, `app`, `routes` |
| `components/common` | `@genetics/ui`, `lib`, `@genetics/*` | `features`, `app` |
| `@genetics/ui` (package) | thư viện ngoài, `@genetics/design-tokens` | mọi thứ trong app |
| `layouts` | `components/*`, `lib`, `app/auth` (đọc quyền) | `features` (trừ `index.ts` để lấy page lazy) |

Mỗi feature có `index.ts` là public API: export page component, (hiếm) hook hoặc type cần cho feature khác. Không re-export `*`. Vòng import giữa feature → CI fail (`dependency-cruiser` chạy rule `no-circular` trên `src/`).

## 6. Feature

| Feature | Route | Board wireframe | Feature PLAN-001 |
|---|---|---|---|
| `auth` | `/login`, `/worker`, NoAccess | Login, WorkerDesktop, NoAccess | F-0201, F-0208 |
| `home` | `/home` | HomeExec, HomeManager, HomeAdmin | F-1105 |
| `dashboard` | `/dashboard` | BreedDashboard | F-1102 |
| `batches` | `/batches`, `/batches/$batchId` | EggList, EggDetail…PupaeDetail, BatchHead | F-0603, F-0604 |
| `measurements` | tab + dialog trong batch | EggWeigh, EggSexing, SexingRows, NeonateWeigh, LarvaeFeed… RecordEdit*, DeleteConfirm | F-0606…F-0616, F-0622 |
| `stage-close` | dialog | CloseStage, NextBranch, Conditions, PupaeToEgg, ReopenBatch, EggApproved | F-0611, F-0617…F-0621 |
| `lineage` | `/lineage`, tab | Lineage, *Lineage, BatchLineage | F-0623 |
| `history` | `/history`, tab | History, *History, BatchHistory | F-0624 |
| `quality` | `/quality` | DQ | F-0704 |
| `imports` | `/import`, `/import/history` | Import1–3, ImportHistory, ImportUndo | F-0902…F-0904 |
| `labels` | `/labels` | Labels | F-0802 |
| `selective` | `/selective/*` | SBOverview, SBCage*, SBPhenotype, SBSelection, SBAllocation | F-1503…F-1508 |
| `reference` | `/strains`, `/generations`, `/master` | Strains, StrainDetail, Generation, AddGeneration, Master*, Protocol*, KpiDefs, ContainerDetail | F-0503…F-0507 |
| `work` | `/work`, `/work/routine` | MyTasks, RoutineSchedule, TaskCoverage | F-1003, F-1004 |
| `projects` | `/projects/*`, `/tasks/$taskId`, `/pm/*` | Projects, ProjectDetail, ProjectCreate, TaskCreate, TaskDetail, PMDashboard, PMReports | F-1402…F-1408 |
| `analytics` | `/analytics`, `/reports` | Analytics, Reports | F-1103, F-1104 |
| `inbox` | `/inbox` | Inbox | F-0308 |
| `search` | Ctrl K | Search | F-0625 |
| `admin` | `/admin/*` | Users, UserInvite, RolePerms, Roles, SystemSettings | F-0206, F-0207, F-1304 |
| `docs` | `/docs`, `/drive` | Documentation, Drive | F-0409, F-1407 |

Cấu trúc một feature:

```
features/batches/
├─ index.ts                        # export { BatchListPage, BatchDetailPage }
├─ pages/BatchListPage.tsx, BatchDetailPage.tsx
├─ components/                     # chỉ dùng trong feature: BatchKpiStats, StageTabs …
├─ api/                            # KHÔNG gọi fetch tay: bọc hook orval + query key của feature
│  ├─ queries.ts                   # useBatchesList = () => useBatchesList(params, { staleTime })…
│  └─ mutations.ts                 # invalidate đúng key
├─ model/
│  ├─ search.ts                    # zod schema search params
│  └─ mappers.ts
└─ __tests__/
```

## 7. Dữ liệu từ server

### 7.1 Client sinh từ OpenAPI (ADR-0006)

- `packages/api-client` chạy orval trên `contracts/openapi/openapi.json` → `src/generated/` gồm: hook TanStack Query theo `operationId` (`useBatchesList`, `useBatchesCloseStage`…), `queryKey` factory, type, schema zod (`output.client: 'react-query'`, `httpClient: 'fetch'`, `mock: true`). Mutator `customFetch` do `apps/web/src/lib/api.ts` cung cấp (gắn token MSAL, `X-Request-ID`, `Accept-Language`, `If-Match`, đọc problem+json → `ApiError`).
- **Không sửa tay** file sinh; không viết `fetch('/api/…')` trong feature (ESLint `no-restricted-imports` / `no-restricted-syntax` chặn `fetch(` ngoài `lib/api.ts`).
- Mock MSW sinh từ cùng spec: `packages/api-client/src/mocks/` → web dùng trong Vitest và trong chế độ `VITE_API_MOCK=1` để làm UI khi backend chưa có endpoint.

### 7.2 Query key và cache

- Key sinh bởi orval theo `operationId` + tham số; feature bọc thêm trong `api/queries.ts` để đặt `staleTime` và `select`.
- `staleTime` mặc định 30 s; `/me/permissions` 5 phút; tham chiếu 10 phút. Mutation `await queryClient.invalidateQueries(...)` trong `onSuccess` (đợi xong mới đóng dialog).
- Không optimistic update cho dữ liệu nghiệp vụ; chỉ cho đánh dấu đã đọc.
- Cursor pagination: `useInfiniteQuery` (`initialPageParam` bắt buộc).
- Loader route: `queryClient.ensureQueryData(options)` để prefetch; component dùng `useSuspenseQuery` khi dữ liệu bắt buộc; `defaultPreloadStaleTime: 0` ở router vì Query quản lý freshness.

### 7.3 Trạng thái client

| Loại | Ở đâu |
|---|---|
| Dữ liệu server | TanStack Query (duy nhất) |
| Bộ lọc, tab, trang | URL search params (zod) |
| Phiên đăng nhập | MSAL (sessionStorage) + router context `auth` |
| Form đang nhập | react-hook-form |
| UI tạm (dialog mở, sidebar thu gọn) | `useState` / context cục bộ; sidebar thu gọn lưu `localStorage` |
| Không dùng | Redux, Zustand, MobX cho dữ liệu server |

### 7.4 Lỗi

| Lỗi | Xử lý |
|---|---|
| 401 `token_expired` | `acquireTokenSilent`, gửi lại 1 lần; thất bại → `loginRedirect` (RT SPA hết hạn sau 24 h) |
| 403 `platform_not_allowed` | `/worker` |
| 403 `permission_denied` | toast + refetch `/me/permissions` |
| 404 | `notFoundComponent` |
| 409 `gate_not_met` | hiện `blockers` dịch theo `code` |
| 412 `version_conflict` | dialog "Dữ liệu vừa được người khác sửa" → Tải lại |
| 422 `validation_failed` | `setError` theo `errors[].field` |
| 422 `reason_required` | mở `ReasonDialog` rồi gửi lại |
| Lỗi render | `react-error-boundary` quanh mỗi page + `errorComponent` route; `QueryErrorResetBoundary` để reset |
| 5xx / mạng | toast có `trace_id` + Thử lại |

## 8. UI

### 8.1 Quyền sở hữu component (ADR-0009)

| Lớp | Ai tạo | Luật |
|---|---|---|
| `packages/ui/src/components/*` (shadcn, `@genetics/ui`) | CLI `pnpm dlx shadcn add <name>` chạy từ `apps/web` (cài vào `packages/ui` theo monorepo guide); sửa theo `design-system.md`; PR nhãn `shared` | Không viết tay; không thêm UI kit khác; `add --overwrite` cần review |
| `packages/ui/src/business/*` (dùng chung web + mobile) | BatchCode, StrainBadge, StatusBadge, Can, EmptyState, ErrorState, NoAccess | PR nhãn `shared` |
| `components/common/*` (web) | Claude (web) theo danh sách §6.2 của `design-system.md`: StageStepper, StatCard, KpiDelta, BatchHead, BlockerList, ReasonDialog, RecordTable, DataTable, Timeline, LineageChain, CupMap, PageHeader | Thêm component mới vào danh sách = sửa `design-system.md` trong cùng PR + ghi board wireframe |
| `features/<x>/components/*` | Claude (web) | Chỉ dùng trong feature; nếu feature thứ hai cần → chuyển lên `common` (một PR riêng) |
| Token | `packages/design-tokens` (Claude Planner sở hữu; đổi màu = PR riêng) | Không hex / px tuỳ ý trong component (ESLint rule `no-restricted-syntax` cho `#[0-9a-f]{3,6}` trong className + Stylelint cho CSS) |

Trước khi tạo component mới, agent phải: (1) tìm trong `components/ui`, `components/common` và `design-system.md` §6; (2) kiểm tra board wireframe có element đó; (3) nếu là biến thể → thêm `variant` bằng `cva`, không tạo file mới. Kiểm: PR template có checklist; reviewer từ chối component trùng.

### 8.2 Token và theme

- `packages/design-tokens/tokens.json` → script sinh `web.css` (Tailwind 4 `@theme` + biến shadcn `:root`) và `tokens.ts`. Web và mobile `globals.css` chỉ `@import`.
- shadcn `cssVariables: true`, OKLCH (CLI chuyển từ hex). Không dark mode (overview §1.2) nhưng vẫn giữ `.dark` block rỗng để không phải cài lại component sau này.

### 8.3 Responsive, accessibility

- Desktop-first: tốt từ 1280 px; tới 768 px sidebar thành drawer; không tối ưu điện thoại (dùng app).
- Tương phản ≥ 4.5:1 (token đã kiểm); focus ring; `aria-label` cho icon button; `<label>` cho mọi input; Base UI lo ARIA của dialog / menu / tab.
- Kiểm: `@axe-core/playwright` với tag `wcag2a`, `wcag2aa`, `wcag21aa` trên mọi route trong e2e smoke.

### 8.4 Visual regression

- Playwright `toHaveScreenshot()` cho: trang gallery (mỗi component common × variant × state) và 1 ảnh mỗi board wireframe chính (EggDetail, CloseStage, Import2, MyTasks, Users…).
- Baseline sinh **trong Docker image Playwright pin version** (`mcr.microsoft.com/playwright:v1.64.1-noble`) để không lệch font / OS; `maxDiffPixelRatio: 0.01`; cập nhật baseline chỉ khi PR ghi rõ "visual change" và reviewer duyệt ảnh diff.
- Storybook **không** đưa vào bản đầu (ADR-0009, điều kiện xem lại: khi cần Chromatic hoặc designer review từng story).

## 9. Form

- Schema zod 4 trong `@genetics/shared/forms/<form_code>.ts`, dùng chung mobile: chỉ kiểm hình thức (bắt buộc, kiểu, min). Khoảng hợp lệ protocol và DQ do server trả.
- Kiểu form: `useForm<z.input<S>, unknown, z.output<S>>` khi schema có `.default()`.
- Gửi kèm `id` client sinh (`crypto.randomUUID()`) khi tạo bản ghi; `If-Match` khi sửa; `reason` khi `edit_requires_reason`.
- Enter = lưu & thêm dòng; Esc đóng dialog; Ctrl K tìm.

## 10. Ví dụ luồng: Executive chốt batch Egg (F-0617)

1. Route `_app/batches/$batchId.tsx`: `beforeLoad` kiểm `auth`, `loader` → `queryClient.ensureQueryData(getBatchesGetQueryOptions(id))`.
2. `BatchDetailPage` → `BatchHead` đọc `batch.can.close`, `close_blockers`; nút Chốt `disabled` + `BlockerList` khi chưa đủ; ẩn nếu `!can('stage.close')`.
3. Bấm Chốt → `CloseStageDialog` (feature `stage-close`), form zod `{end_date, note}`.
4. `useBatchesCloseStage()` (orval) với header `If-Match: batch.version`; mutator gắn token.
5. 200 → `invalidateQueries` cho `batches.detail(id)`, `batches.list({stage: egg})`, `batches.list({stage: neonate})`, `me.work`; toast "Đã chốt, tạo TMA_F8_BC01"; điều hướng tab.
6. 409 `gate_not_met` → `BlockerList` cập nhật; 412 → dialog tải lại.
7. Test: component (nút bật / tắt / blockers, 412) với MSW handler sinh từ orval; e2e tạo batch → nhập → chốt → batch mới; visual CloseStage.

## 11. Kiểm chứng tự động (rule → cách kiểm)

| Quy tắc | Công cụ |
|---|---|
| Luật import §5 | `eslint-plugin-boundaries` policies; `dependency-cruiser --validate` no-circular |
| Không gọi `fetch` ngoài `lib/api.ts`; không sửa file sinh | ESLint `no-restricted-syntax`; CI `git diff --exit-code packages/api-client/src/generated` sau khi chạy orval |
| Không hex / px tuỳ ý | ESLint custom + Stylelint |
| Chuỗi qua i18n | `eslint-plugin-i18next` (`no-literal-string` trong JSX) |
| Kiểu | `tsc --noEmit` strict |
| Component trùng | PR checklist + reviewer; script liệt kê component mới ngoài danh sách |
| Trạng thái UI bắt buộc (loading / empty / error / no access) | test component mẫu mỗi page + checklist |
| Accessibility | axe trong e2e smoke |
| Visual | Playwright screenshots trong Docker |
| Hiệu năng | `vite build` báo kích thước; ngân sách JS ban đầu ≤ 250 KB gzip (`size-limit`) |

## 12. Checklist khi làm một màn

- [ ] Route khai báo quyền màn (`beforeLoad`), search params có schema zod.
- [ ] Đối chiếu board wireframe (ghi tên board trong PR); không thêm / bớt field, nút so với wireframe nếu không có ghi chú duyệt.
- [ ] Trạng thái: đang tải (skeleton), trống, lỗi, không có quyền.
- [ ] Nút: ẩn khi không có quyền, tắt kèm lý do khi chưa đủ điều kiện.
- [ ] Chuỗi qua i18n, số / ngày qua helper.
- [ ] Mutation invalidate đúng key; không optimistic.
- [ ] Test component cho logic; e2e đường đi chính; ảnh visual nếu là màn chính.
