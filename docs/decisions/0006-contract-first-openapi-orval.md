# ADR-0006 · Contract-first: OpenAPI commit trong `contracts/`, SDK + hook + mock sinh bằng orval, kiểm breaking bằng oasdiff, contract test bằng schemathesis

- Trạng thái: **Proposed** · Ngày: 2026-10-26

## Bối cảnh
Ba agent làm song song; frontend cần hợp đồng ổn định và mock để không chờ backend; AppSheet có tài liệu lệch app (PLAN-001 §9) → tài liệu API phải sinh từ code. Nghiên cứu 26/10/2026: orval 8.45 (hook TanStack Query theo `operationId`, mock MSW + faker, zod 3/4, fetch client, đang phát triển tích cực); openapi-typescript 7 + openapi-fetch 0.17 (chỉ type, gọi theo path, không hook / mock, phát hành gần nhất 2/2026); @hey-api/openapi-ts 0.99 (0.x, breaking gần như mỗi minor, MSW / Faker "In Progress"). MSW 3.0 vừa ra (10/2026), orval mock với MSW 3 chưa xác minh.

## Động lực
Một nguồn sự thật cho endpoint, tên hàm ổn định cho agent, mock sinh tự động, phát hiện breaking change trong CI, client không viết tay.

## Phương án
| | orval | openapi-typescript + openapi-fetch (+ openapi-react-query) | hey-api |
|---|---|---|---|
| Hook TanStack sinh sẵn | có (`useBatchesList`) | không (wrapper runtime theo path) | option factory |
| Mock MSW + faker | có | không | in progress |
| zod | có | không | có (chi tiết chưa xác minh) |
| Ổn định | 8.x, Node ≥ 22.18 | ổn định, runtime 6 kB | 0.x |
| Rủi ro | kích thước code sinh lớn hơn; MSW 3 chưa xác minh | phải tự viết hook, mock | breaking thường xuyên |

## Quyết định đề xuất
- Spec: FastAPI sinh, `operationId = route.name` theo mẫu `<tag>_<verb>_<noun>`, commit `contracts/openapi/openapi.json`; Codex sở hữu; CI diff.
- SDK: orval 8 trong `packages/api-client` (`react-query`, `httpClient: fetch`, `mock: true`, zod cho body); mutator chung; Claude web vận hành script; CI diff `generated/`.
- MSW pin 2.x cho tới khi test mock orval trên 3.x xanh (task init).
- Breaking: `oasdiff breaking` fail CI trừ khi nhãn `api-breaking` + kế hoạch; Spectral lint ruleset.
- Contract test: schemathesis `from_asgi` trong CI backend; không Pact.
- Quy trình "PR contract trước" (`api-standards.md` §16).

## Hệ quả
- Frontend không bao giờ gọi `fetch` tay; thiếu endpoint → task blocked, không bịa.
- Tên hàm router backend phải duy nhất toàn app.
- Xem lại nếu: orval ngừng bảo trì hoặc không hỗ trợ MSW 3 sau 6 tháng → chuyển openapi-typescript + openapi-react-query (type tương thích, hook viết tay theo feature).

## Tham chiếu
FastAPI path-operation-advanced-configuration; orval docs (react-query, msw, zod, output); openapi-ts docs; hey-api docs; MSW 2→3 migration; oasdiff; Spectral; schemathesis — `research-references.md` §A, §C, §D.
