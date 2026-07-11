"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"form" | "success" | "error">("form");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (password.length < 6) {
      setErrorMsg("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("success");
      } else {
        if (data.error === "token_expired") {
          setErrorMsg("Link đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu lại.");
        } else if (data.error === "invalid_token") {
          setErrorMsg("Link không hợp lệ. Vui lòng yêu cầu đặt lại mật khẩu mới.");
        } else {
          setErrorMsg("Có lỗi xảy ra. Vui lòng thử lại.");
        }
        setStatus("error");
      }
    } catch {
      setErrorMsg("Lỗi kết nối. Vui lòng thử lại.");
      setStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-4 max-w-sm">
          <XCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Link không hợp lệ</h1>
          <p className="text-muted-foreground text-sm">Link đặt lại mật khẩu không đúng hoặc đã hết hạn.</p>
          <button
            onClick={() => router.push("/sign-up")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
          >
            Quay lại Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-4 max-w-sm">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Đặt lại mật khẩu thành công!</h1>
          <p className="text-muted-foreground text-sm">Bạn có thể đăng nhập bằng mật khẩu mới.</p>
          <button
            onClick={() => router.push("/sign-up")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-[400px] space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-extrabold text-foreground">Đặt lại mật khẩu</h1>
          <p className="text-sm text-muted-foreground">Nhập mật khẩu mới cho tài khoản của bạn.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mật khẩu mới */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider block">
              Mật khẩu mới
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Tối thiểu 6 ký tự"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-muted/40 border rounded-xl py-2.5 px-4 pr-11 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-background transition-all"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Xác nhận mật khẩu */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider block">
              Xác nhận mật khẩu
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full bg-muted/40 border rounded-xl py-2.5 px-4 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-background transition-all"
            />
          </div>

          {/* Error message */}
          {errorMsg && (
            <p className="text-red-500 text-xs font-bold">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading && (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            Đặt lại mật khẩu
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
