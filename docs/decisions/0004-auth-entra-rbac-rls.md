# ADR-0004 · Xác thực Entra ID (OIDC, token v2) và phân quyền 3 lớp (RBAC dữ liệu + Postgres RLS)

- Trạng thái: **Proposed** · Ngày: 2026-10-26

## Bối cảnh
AppSheet: tài khoản @entobel.com, bảng `users` với role enum + 4 cờ; MB gần như không kiểm role; PM kiểm `role = Manager` (PLAN-001 INV-85…89). Yêu cầu mới: quyền là dữ liệu, 4 vai trò mặc định, quyền riêng có hạn, batch chốt khoá với mọi người, Worker chỉ app / Manager chỉ web. Microsoft Learn: SPA refresh token hết hạn sau 24 h; API phải kiểm `aud`, `iss`, chữ ký qua JWKS; `azp` chỉ có ở token v2.

## Động lực
SSO sẵn có của Entobel; không quản lý mật khẩu; chặn ở 3 lớp để lỗi code không lộ dữ liệu; thêm vai trò không sửa code.

## Phương án
| Hạng mục | Chọn | Thay thế |
|---|---|---|
| IdP | Entra ID OIDC, 3 app registration (API, web SPA, mobile SPA), token **v2** | Entra External ID / tài khoản riêng (loại: thêm mật khẩu) |
| Kiểm token | PyJWT `PyJWKClient` (cache 24 h), kiểm `iss`, `aud`, `exp`, `tid`; nền tảng từ `azp` | python-jose (loại: gap phát hành 3,5 năm); thư viện Microsoft cho Python API (không có bản chính thức cho FastAPI) |
| Mô hình quyền | `auth.role / permission / role_permission(scope, device) / user_permission(grant|deny, batch, hạn, lý do) / user_scope`; deny thắng | Entra App Roles / groups (loại: không diễn đạt được scope own / 24 h / batch; Admin không tự quản được) |
| Lớp kiểm | (1) dependency `require(perm, scope)` → 403 sớm; (2) `actor.require` trong use case; (3) RLS `auth.has_perm()` đọc `app.user_id`, `app.device` | chỉ (1)+(2) (loại: job / import / lỗi code lọt) |
| RLS | bật + `FORCE` trên bảng đo lường, batch, project / task / message / attachment; policy chỉ so cột dòng; join qua function `SECURITY DEFINER` có test | |
| Phiên client | MSAL redirect flow; web `sessionStorage`; mobile `localStorage` (giữ phiên, chấp nhận mã hoá không phải ranh giới bảo mật) | popup (loại: Safari / mobile không ổn định) |

## Quyết định đề xuất
Như trên. Vai trò hệ thống `worker / executive / manager / admin` (`is_system`), Project Leader gộp vào Executive (tạo lại được). User hệ thống cho job.

## Hệ quả
- Entra admin consent cần IT (open question OQ-3).
- Người dùng phải đăng nhập lại mỗi 24 h (SPA); mobile giữ outbox.
- Mọi bảng có RLS cần test integration theo 4 vai trò (quality gate W2).
- 404 thay 403 cho tài nguyên bị RLS ẩn.
- Xem lại nếu: Microsoft đổi lifetime SPA; cần đăng nhập ngoài tenant (nhà thầu).

## Tham chiếu
Microsoft Learn: access-tokens, access-token-claims-reference, v2-protocols-oidc, refresh-tokens, configurable-token-lifetimes, msal-js-initializing, scenario-spa-sign-in; MSAL.js docs (initialization, caching, browser-specific-guidance, redirect-bridge); PyJWT usage; PostgreSQL ddl-rowsecurity — `research-references.md` §A, §C.
