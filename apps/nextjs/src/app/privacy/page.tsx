import React from "react";
import Link from "next/link";
import { Shield, Lock, Eye, FileText, ArrowLeft, CheckCircle } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-16 select-none font-sans">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-all mb-8 outline-none"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại trang chủ</span>
      </Link>

      {/* Header */}
      <div className="space-y-4 border-b pb-8 mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
          Chính Sách Quyền Riêng Tư (Privacy Policy)
        </h1>
        <p className="text-sm text-muted-foreground font-semibold">
          Cập nhật lần cuối: Ngày 08 tháng 06 năm 2026
        </p>
      </div>

      {/* Body content */}
      <div className="space-y-8 text-foreground/90 leading-relaxed text-sm md:text-base">
        <section className="space-y-3">
          <p>
            Chào mừng bạn đến với <strong>Quizlet Clone</strong>. Chúng tôi cam kết bảo vệ quyền riêng tư và thông tin cá nhân của bạn. Chính sách này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ thông tin của bạn khi bạn sử dụng dịch vụ của chúng tôi, bao gồm cả khi bạn đăng nhập thông qua các dịch vụ bên thứ ba như <strong>Facebook OAuth</strong>.
          </p>
        </section>

        {/* Section 1 */}
        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-extrabold flex items-center gap-2.5 text-foreground">
            <Eye className="w-5.5 h-5.5 text-blue-500" />
            <span>1. Thông tin chúng tôi thu thập</span>
          </h2>
          <p>
            Khi bạn sử dụng Quizlet Clone, chúng tôi có thể thu thập các loại thông tin sau:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Thông tin tài khoản cơ bản:</strong> Email, tên người dùng, mật khẩu (được mã hóa PBKDF2/SHA-512 an toàn) và ngày sinh để xác nhận độ tuổi.
            </li>
            <li>
              <strong>Thông tin từ các dịch vụ bên thứ ba (OAuth):</strong> Khi bạn đăng nhập bằng Facebook, Google hoặc Github, chúng tôi chỉ thu thập các thông tin công khai cơ bản được bạn cho phép bao gồm: <strong>Tên hiển thị</strong>, <strong>Địa chỉ email</strong>, và <strong>Ảnh đại diện (Avatar)</strong>.
            </li>
            <li>
              <strong>Nội dung học tập:</strong> Các học phần (study sets), thẻ ghi nhớ, thư mục và lớp học mà bạn tạo ra trên nền tảng.
            </li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-extrabold flex items-center gap-2.5 text-foreground">
            <Lock className="w-5.5 h-5.5 text-blue-500" />
            <span>2. Cách chúng tôi sử dụng thông tin của bạn</span>
          </h2>
          <p>Chúng tôi chỉ sử dụng thông tin đã thu thập cho các mục đích sau:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/40 rounded-xl border border-border/50">
              <h3 className="font-bold mb-1 flex items-center gap-2 text-foreground">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Cung cấp dịch vụ
              </h3>
              <p className="text-xs text-muted-foreground">
                Đăng nhập, xác thực tài khoản và cá nhân hóa trải nghiệm học tập của bạn trên hệ thống.
              </p>
            </div>
            <div className="p-4 bg-muted/40 rounded-xl border border-border/50">
              <h3 className="font-bold mb-1 flex items-center gap-2 text-foreground">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Đồng bộ hóa dữ liệu
              </h3>
              <p className="text-xs text-muted-foreground">
                Lưu trữ các thẻ ghi nhớ, kết quả ôn tập và tiến trình học tập của bạn qua các thiết bị.
              </p>
            </div>
            <div className="p-4 bg-muted/40 rounded-xl border border-border/50">
              <h3 className="font-bold mb-1 flex items-center gap-2 text-foreground">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Bảo mật hệ thống
              </h3>
              <p className="text-xs text-muted-foreground">
                Phát hiện, ngăn chặn và xử lý các hành vi gian lận hoặc vi phạm điều khoản sử dụng.
              </p>
            </div>
            <div className="p-4 bg-muted/40 rounded-xl border border-border/50">
              <h3 className="font-bold mb-1 flex items-center gap-2 text-foreground">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Hỗ trợ khách hàng
              </h3>
              <p className="text-xs text-muted-foreground">
                Phản hồi các thắc mắc, phản ánh và hỗ trợ kỹ thuật liên quan đến tài khoản của bạn.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-extrabold flex items-center gap-2.5 text-foreground">
            <FileText className="w-5.5 h-5.5 text-blue-500" />
            <span>3. Bảo vệ và lưu trữ thông tin</span>
          </h2>
          <p>
            Thông tin của bạn được lưu trữ an toàn trên hệ thống cơ sở dữ liệu được mã hóa của chúng tôi. Chúng tôi áp dụng các biện pháp bảo mật tối tân để bảo vệ dữ liệu khỏi việc bị truy cập trái phép, sửa đổi hoặc tiết lộ bất hợp pháp. Mật khẩu của bạn luôn được băm bảo mật một chiều trước khi lưu vào database.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-4 border-t pt-8">
          <h2 className="text-xl md:text-2xl font-extrabold text-foreground">
            4. Yêu cầu xóa dữ liệu người dùng
          </h2>
          <p>
            Chúng tôi tôn trọng quyền kiểm soát dữ liệu cá nhân của bạn. Nếu bạn muốn xóa tài khoản của mình hoặc yêu cầu chúng tôi xóa vĩnh viễn các dữ liệu đã thu thập được từ Facebook hoặc các dịch vụ bên thứ ba khác:
          </p>
          <p>
            Vui lòng làm theo hướng dẫn chi tiết tại trang hướng dẫn xóa dữ liệu của chúng tôi:{" "}
            <Link href="/delete-user" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
              Hướng dẫn xóa dữ liệu người dùng (/delete-user)
            </Link>
            .
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-extrabold text-foreground">
            5. Liên hệ với chúng tôi
          </h2>
          <p>
            Nếu bạn có bất kỳ câu hỏi hoặc đóng góp ý kiến nào về Chính sách bảo mật này, xin vui lòng gửi email về hòm thư hỗ trợ của chúng tôi tại địa chỉ:{" "}
            <a href="mailto:support@quizlet-clone.com" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
              support@quizlet-clone.com
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
