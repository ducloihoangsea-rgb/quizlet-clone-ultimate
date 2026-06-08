"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "@acme/ui/toast";
import { Trash2, AlertTriangle, CheckCircle2, ArrowLeft, ShieldAlert } from "lucide-react";

export default function DeleteUserPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Vui lòng nhập địa chỉ email tài khoản!");
      return;
    }

    setIsLoading(true);
    // Giả lập gửi yêu cầu xóa dữ liệu lên máy chủ
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      toast.success("Đã gửi yêu cầu xóa dữ liệu thành công!");
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 md:py-16 select-none font-sans">
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
        <div className="inline-flex items-center justify-center p-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl">
          <Trash2 className="w-8 h-8" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
          Yêu Cầu Xóa Dữ Liệu Người Dùng
        </h1>
        <p className="text-sm text-muted-foreground font-semibold">
          Data Deletion Instructions (Theo chính sách Facebook Platform)
        </p>
      </div>

      <div className="space-y-8">
        <section className="space-y-3 leading-relaxed">
          <p>
            Quizlet Clone cam kết bảo mật quyền riêng tư của bạn. Phù hợp với chính sách của nhà phát triển Meta (Facebook), chúng tôi cung cấp hướng dẫn rõ ràng dưới đây về cách bạn có thể yêu cầu xóa dữ liệu liên kết hoặc tài khoản của mình khỏi hệ thống của chúng tôi.
          </p>
        </section>

        {/* Hướng dẫn 1 */}
        <section className="bg-muted/40 rounded-2xl p-6 border border-border/50 space-y-4">
          <h2 className="text-lg md:text-xl font-extrabold flex items-center gap-2 text-foreground">
            <ShieldAlert className="w-5.5 h-5.5 text-rose-500" />
            <span>Cách 1: Gỡ bỏ liên kết ứng dụng trên Facebook</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Nếu bạn đã đăng nhập và liên kết tài khoản Facebook của mình với Quizlet Clone, bạn có thể xóa toàn bộ quyền truy cập và dữ liệu liên kết trực tiếp bằng cách thực hiện các bước sau trên Facebook:
          </p>
          <ol className="list-decimal pl-6 space-y-3 text-sm text-foreground/90">
            <li>
              Truy cập vào tài khoản Facebook cá nhân của bạn.
            </li>
            <li>
              Vào mục <strong>Cài đặt & Quyền riêng tư (Settings & Privacy)</strong>, sau đó chọn <strong>Cài đặt (Settings)</strong>.
            </li>
            <li>
              Tại menu bên trái, cuộn xuống và chọn mục <strong>Ứng dụng và trang web (Apps and Websites)</strong>.
            </li>
            <li>
              Tìm ứng dụng <strong>Quizlet Clone</strong> trong danh sách.
            </li>
            <li>
              Bấm vào nút <strong>Gỡ (Remove)</strong> bên cạnh tên ứng dụng để tiến hành xóa bỏ hoàn toàn quyền truy cập dữ liệu.
            </li>
          </ol>
        </section>

        {/* Hướng dẫn 2 */}
        <section className="space-y-4 border-t pt-8">
          <h2 className="text-lg md:text-xl font-extrabold flex items-center gap-2 text-foreground">
            <AlertTriangle className="w-5.5 h-5.5 text-amber-500" />
            <span>Cách 2: Gửi yêu cầu xóa trực tiếp dữ liệu từ hệ thống của chúng tôi</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Nếu bạn muốn xóa vĩnh viễn toàn bộ dữ liệu tài khoản, lịch sử học tập và thông tin cá nhân đã lưu trên máy chủ của Quizlet Clone, vui lòng gửi yêu cầu qua form bên dưới.
          </p>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4 max-w-md bg-muted/20 p-5 rounded-xl border border-border/40">
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider block">
                  Địa chỉ Email tài khoản cần xóa
                </label>
                <input
                  type="email"
                  required
                  disabled={isLoading}
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background border rounded-xl py-2.5 px-4 text-sm font-semibold outline-none focus:border-blue-500 transition-all disabled:opacity-50"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm rounded-xl transition-all outline-none shadow-md hover:shadow-rose-500/10 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Đang gửi yêu cầu...</span>
                  </>
                ) : (
                  <span>Gửi yêu cầu xóa dữ liệu</span>
                )}
              </button>
            </form>
          ) : (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="font-extrabold text-emerald-600 dark:text-emerald-400">Yêu cầu đã được ghi nhận!</h3>
                <p className="text-xs text-muted-foreground leading-normal">
                  Chúng tôi đã nhận được yêu cầu xóa dữ liệu cho tài khoản <strong>{email}</strong>. Quá trình xử lý xóa bỏ vĩnh viễn thông tin cá nhân và dữ liệu liên quan sẽ hoàn thành trong vòng 24-48 giờ làm việc. Một email xác nhận sẽ được gửi tới hòm thư của bạn sau khi hoàn tất.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Chú ý */}
        <section className="text-xs text-muted-foreground leading-normal pt-4 border-t border-muted/30">
          <p>
            * Lưu ý: Sau khi quá trình xóa hoàn thành, bạn sẽ không thể khôi phục lại các học phần (study sets) hay kết quả học tập của mình.
          </p>
        </section>
      </div>
    </div>
  );
}
