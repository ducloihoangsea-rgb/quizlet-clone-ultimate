# BỐI CẢNH DỰ ÁN (PROJECT CONTEXT)
*Tài liệu này dùng để cung cấp ngữ cảnh cho IDE ở các đoạn hội thoại mới, giúp AI hiểu ngay cấu trúc dự án mà không tốn nhiều token để đọc lại từ đầu.*

## 1. Thông tin chung & Tech Stack
- **Loại dự án**: Ứng dụng Web Clone Quizlet (Monorepo bằng Turborepo).
- **Framework chính**: Next.js 14 (App Router).
- **Ngôn ngữ**: TypeScript.
- **Styling**: Tailwind CSS + Radix UI (chứa trong `packages/ui`).
- **Database & ORM**: Drizzle ORM kết nối với PostgreSQL (hiện đang dùng Neon DB). Schema nằm ở `packages/db`.
- **API/Backend**: tRPC (nằm ở `packages/api`).
- **Xác thực**: NextAuth.js (nằm ở `packages/auth`).
- **Upload file**: Đã chuyển logic từ AWS S3 sang API upload local (`apps/nextjs/src/app/api/upload/route.ts`), lưu file vào `apps/nextjs/public/uploads`.

## 2. Cấu trúc thư mục cốt lõi
- `/apps/nextjs/`: Nơi chứa toàn bộ giao diện, routes, components của Next.js.
  - `/src/app/`: Chứa các trang (pages) và API routes.
  - `/src/components/`: Chứa các UI components (đặc biệt thư mục `user` có chứa tính năng Avatar, `test-mode` chứa tính năng làm bài thi).
  - `/public/images/`: Chứa các ảnh mẫu (các avatar con vật).
  - `/public/uploads/`: Nơi lưu ảnh người dùng tự tải lên.
- `/packages/api/`: Định nghĩa các tRPC routers (như `user.ts`, `studySet.ts`...).
- `/packages/db/`: Định nghĩa các bảng Drizzle (như `user.ts`, `folder.ts`...).
- `/packages/ui/`: Các UI component dùng chung như Dialog, Avatar, Cropper, Button...

## 3. Các tính năng quan trọng vừa hoàn thiện
1. **Tính năng đổi Avatar ở trang Profile (`profile-layout.tsx` & `avatar-picker-modal.tsx`)**:
   - Sử dụng modal/dialog để hiển thị danh sách các avatar (động vật) có sẵn trong `public/images/`.
   - Có nút `+` để upload hình từ máy tính.
   - Có khung cắt ảnh (Cropper) với chế độ zoom và lưới 3x3 (`packages/ui/src/cropper.tsx`).
   - Tải file ảnh lên qua API `/api/upload` và lưu thẳng vào thư mục local thay vì AWS S3 để tiện lợi cho môi trường dev.

2. **Tính năng làm bài thi (Test Mode - `test-mode.tsx`)**:
   - Khắc phục lỗi hiệu ứng phát sáng màu xanh (glow) không hiển thị khi cuộn tới câu hỏi.
   - Chuyển từ việc dùng state React sang dùng thao tác trực tiếp DOM (`element.classList.add`) để đảm bảo animation luôn chạy từ đầu mượt mà, kết hợp với event `animationend`.

## 4. Quy tắc hoạt động (Luôn ghi nhớ cho AI mới)
1. **Giao tiếp**: Luôn trả lời bằng tiếng Việt.
2. **Hiệu suất**: Code luôn hướng tới tốc độ xử lý nhanh nhất, tối ưu dung lượng.
3. **Thực thi**: Có một file `run.bat` ở thư mục gốc dùng để chạy server (pnpm dev) trên PC bằng mã ASCII. 
4. Tuân thủ việc dùng các công cụ chuyên dụng (không dùng lệnh bash tùy tiện khi có tool hỗ trợ, ví dụ dùng `grep_search` thay vì bash grep).

---
*Ghi chú cho AI ở phiên mới: Hãy đọc file này và bạn đã nắm được 90% những gì chúng tôi đã làm. Hãy sẵn sàng nhận yêu cầu tiếp theo từ người dùng dựa trên nền tảng này.*
