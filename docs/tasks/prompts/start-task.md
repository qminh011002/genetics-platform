Bạn làm task TASK_ID trong repo này.

1. Đọc theo thứ tự: AGENTS.md, AGENTS.md của app (nếu có), file task `docs/tasks/items/*/TASK_ID-*.md`, rồi đúng các mục tài liệu mà task trỏ tới. Đọc board wireframe ghi trong task (`docs/genetics-platform-wireframes/screens/<Board>.html`) nếu là UI.
2. Đổi `status: in_progress` trong task file. Chỉ sửa trong `allowed_paths`. Không thêm dependency ngoài task. Không sửa file sinh tay.
3. Làm đủ "Làm", không làm "Không làm". Mỗi tiêu chí chấp nhận phải có test hoặc bước kiểm thủ công ghi rõ.
4. Thiếu thông tin hoặc phụ thuộc chưa merge → đổi `status: blocked`, ghi câu hỏi + phương án đề xuất vào mục "Câu hỏi", dừng và báo.
5. Trước khi báo xong: chạy `pnpm ci` (hoặc lệnh kiểm của app) và dán kết quả vào mục "Kết quả"; commit theo Conventional Commits có `(TASK_ID)`; mở PR theo template, nhãn phù hợp (`contract`, `shared`, `visual-change`, `deps-approved` nếu đúng).
6. Cuối phiên dù xong hay chưa: cập nhật task file (Kết quả / Còn lại / Lệnh để tiếp tục) và dòng của TASK_ID trong `docs/tasks/W1-status.md`.
