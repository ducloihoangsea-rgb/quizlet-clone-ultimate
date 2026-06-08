"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@acme/ui/toast";
import { useTranslation, type Language } from "~/contexts/i18n-context";
import { Globe } from "lucide-react";

// Custom Google, Facebook, Github SVG icons
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5 mr-3 text-[#1877f2] fill-current" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const GithubIcon = () => (
  <svg className="w-5 h-5 mr-3 text-black dark:text-white fill-current" viewBox="0 0 24 24">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577v-2.234c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22v3.293c0 .319.22.694.825.576C20.565 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

interface SignUpClientProps {
  initialMode: "signup" | "signin";
  onSignInGoogle: () => Promise<void>;
  onSignInGithub: () => Promise<void>;
  onSignInCredentials: (formData: FormData) => Promise<void>;
  onRegister: (formData: {
    email: string;
    password?: string;
    username: string;
    birthDate?: string;
  }) => Promise<{ error?: string; success?: boolean }>;
}

const SignUpClient = ({ 
  initialMode, 
  onSignInGoogle, 
  onSignInGithub,
  onSignInCredentials,
  onRegister
}: SignUpClientProps) => {
  const [mode, setMode] = useState<"signup" | "signin">(initialMode);
  const router = useRouter();
  const { language, setLanguage, t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [birthDay, setBirthDay] = useState("1");
  const [birthMonth, setBirthMonth] = useState("1");
  const [birthYear, setBirthYear] = useState("2010");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (!email || !password || (mode === "signup" && !username)) {
      toast.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "signup") {
        // Đăng ký tài khoản
        const birthDate = `${birthYear}-${birthMonth}-${birthDay}`;
        const res = await onRegister({
          email,
          password,
          username,
          birthDate,
        });

        if (res.error) {
          if (res.error === "email_exists") {
            toast.error("Email này đã tồn tại trong hệ thống!");
          } else if (res.error === "missing_fields") {
            toast.error("Vui lòng điền đầy đủ các trường thông tin!");
          } else {
            toast.error("Đăng ký thất bại. Vui lòng kiểm tra lại!");
          }
          setIsLoading(false);
          return;
        }

        toast.success("Đăng ký tài khoản thành công! Đang tiến hành đăng nhập...");
        
        // Tự động đăng nhập sau khi đăng ký thành công
        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);
        await onSignInCredentials(formData);
      } else {
        // Đăng nhập tài khoản
        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);
        
        await onSignInCredentials(formData);
      }
    } catch (err: any) {
      // Tránh báo lỗi giả lập nếu đó là lỗi redirect nội bộ của NextJS (NextAuth điều hướng thành công)
      if (err.message && err.message.includes("NEXT_REDIRECT")) {
        return;
      }
      console.error(err);
      toast.error("Đăng nhập thất bại! Vui lòng kiểm tra lại email và mật khẩu.");
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = () => {
    toast.info("Đăng nhập bằng Facebook sẽ được hỗ trợ sớm!");
  };

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden bg-background select-none">
      
      {/* Close button top right */}
      <button 
        onClick={() => router.push("/")}
        className="absolute top-4 right-4 z-40 p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full transition-all outline-none"
        title="Quay lại Trang chủ"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Left Column (Illustration & Branding) */}
      <div className="hidden md:flex md:w-[45%] bg-[#4257b2] text-white flex-col justify-between p-12 relative overflow-hidden">
        
        {/* Background shapes */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full filter blur-2xl -translate-x-12 -translate-y-12" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full filter blur-3xl translate-x-24 translate-y-24" />

        {/* Branding text */}
        <div className="space-y-4 pt-16 z-10">
          <h2 className="text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight">
            {mode === "signup" ? t("signUpTitle") : t("signInTitle")}
          </h2>
        </div>

        {/* 3D-like book & headphone SVG Illustration */}
        <div className="flex-1 flex items-center justify-center py-6 z-10">
          <svg className="w-full max-w-[280px] lg:max-w-[320px] h-auto text-white drop-shadow-2xl" viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Book Stack */}
            {/* Book 1 (Green) */}
            <g transform="translate(60, 180) rotate(-8)">
              <rect x="0" y="0" width="180" height="24" rx="4" fill="#10b981" />
              <rect x="4" y="2" width="172" height="20" rx="3" fill="#34d399" />
              <rect x="10" y="2" width="4" height="20" fill="#ffffff" fillOpacity="0.3" />
            </g>
            {/* Book 2 (Orange/Yellow) */}
            <g transform="translate(50, 150) rotate(5)">
              <rect x="0" y="0" width="190" height="24" rx="4" fill="#d97706" />
              <rect x="4" y="2" width="182" height="20" rx="3" fill="#fbbf24" />
              <rect x="12" y="2" width="4" height="20" fill="#ffffff" fillOpacity="0.3" />
            </g>
            {/* Book 3 (Pink) */}
            <g transform="translate(65, 120) rotate(-3)">
              <rect x="0" y="0" width="175" height="24" rx="4" fill="#db2777" />
              <rect x="4" y="2" width="167" height="20" rx="3" fill="#f472b6" />
              <rect x="8" y="2" width="4" height="20" fill="#ffffff" fillOpacity="0.3" />
            </g>
            
            {/* Headphone Headband */}
            <path d="M70 140 C70 60, 230 60, 230 140" stroke="#f1f5f9" strokeWidth="12" strokeLinecap="round" fill="none" />
            <path d="M70 140 C70 60, 230 60, 230 140" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" fill="none" />
            
            {/* Ear Cushion Left */}
            <rect x="58" y="115" width="16" height="42" rx="8" fill="#ffffff" />
            <rect x="50" y="121" width="8" height="30" rx="4" fill="#e2e8f0" />
            
            {/* Ear Cushion Right */}
            <rect x="226" y="115" width="16" height="42" rx="8" fill="#ffffff" />
            <rect x="242" y="121" width="8" height="30" rx="4" fill="#e2e8f0" />

            {/* Sparkles */}
            <path d="M40 80l6-3-6-3-3-6-3 6-6 3 6 3 3 6 3-6z" fill="#f59e0b" />
            <path d="M260 220l6-3-6-3-3-6-3 6-6 3 6 3 3 6 3-6z" fill="#f59e0b" />
          </svg>
        </div>

        {/* Brand Logo bottom left */}
        <div className="z-10 text-2xl font-black tracking-wider font-sans select-none flex items-center gap-1 opacity-90">
          <span>Quizlet</span>
          <span className="text-blue-300">+</span>
        </div>

      </div>

      {/* Right Column (Forms) */}
      <div className="flex-1 w-full bg-background flex flex-col justify-center items-center px-6 md:px-12 lg:px-20 overflow-y-auto py-12">
        <div className="w-full max-w-[420px] space-y-8">
          
          {/* Tabs header */}
          <div className="flex items-center gap-8 border-b pb-1 select-none shrink-0 justify-center sm:justify-start">
            <button 
              disabled={isLoading}
              onClick={() => setMode("signup")}
              className={`font-extrabold text-xl pb-2 transition-all border-b-4 outline-none ${
                mode === "signup" 
                  ? "border-[#db2777] text-foreground" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("signUp")}
            </button>
            <button 
              disabled={isLoading}
              onClick={() => setMode("signin")}
              className={`font-extrabold text-xl pb-2 transition-all border-b-4 outline-none ${
                mode === "signin" 
                  ? "border-[#db2777] text-foreground" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("signin")}
            </button>
          </div>

          {/* OAuth Forms (Google, Facebook, Github) */}
          <div className="space-y-3 shrink-0">
            <form action={onSignInGoogle}>
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center py-3 px-4 bg-muted/40 hover:bg-muted/70 border border-input rounded-xl font-bold text-sm text-foreground transition-all outline-none active:scale-[0.99] disabled:opacity-50"
              >
                <GoogleIcon />
                <span>{t("continueWithGoogle")}</span>
              </button>
            </form>

            <button 
              onClick={handleFacebookLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center py-3 px-4 bg-muted/40 hover:bg-muted/70 border border-input rounded-xl font-bold text-sm text-foreground transition-all outline-none active:scale-[0.99] disabled:opacity-50"
            >
              <FacebookIcon />
              <span>{t("continueWithFacebook")}</span>
            </button>

            <form action={onSignInGithub}>
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center py-3 px-4 bg-muted/40 hover:bg-muted/70 border border-input rounded-xl font-bold text-sm text-foreground transition-all outline-none active:scale-[0.99] disabled:opacity-50"
              >
                <GithubIcon />
                <span>{t("continueWithGithub")}</span>
              </button>
            </form>
          </div>

          {/* Divider line */}
          <div className="relative flex py-2 items-center shrink-0">
            <div className="flex-grow border-t border-muted"></div>
            <span className="flex-shrink mx-4 text-xs font-bold text-muted-foreground uppercase tracking-widest bg-background">{t("orEmail")}</span>
            <div className="flex-grow border-t border-muted"></div>
          </div>

          {/* Form details */}
          <form onSubmit={handleSubmit} className="space-y-4 shrink-0">
            {mode === "signup" && (
              <>
                {/* BirthDate drop-down */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider block">{t("birthDay")}</label>
                  <div className="grid grid-cols-3 gap-2">
                    <select 
                      disabled={isLoading}
                      value={birthDay}
                      onChange={(e) => setBirthDay(e.target.value)}
                      className="bg-muted/40 border rounded-xl py-2 px-3 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-background transition-all"
                    >
                      {Array.from({ length: 31 }, (_, i) => String(i + 1)).map(d => (
                        <option key={d} value={d}>{t("day")} {d}</option>
                      ))}
                    </select>

                    <select 
                      disabled={isLoading}
                      value={birthMonth}
                      onChange={(e) => setBirthMonth(e.target.value)}
                      className="bg-muted/40 border rounded-xl py-2 px-3 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-background transition-all"
                    >
                      {Array.from({ length: 12 }, (_, i) => String(i + 1)).map(m => (
                        <option key={m} value={m}>{t("month")} {m}</option>
                      ))}
                    </select>

                    <select 
                      disabled={isLoading}
                      value={birthYear}
                      onChange={(e) => setBirthYear(e.target.value)}
                      className="bg-muted/40 border rounded-xl py-2 px-3 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-background transition-all"
                    >
                      {Array.from({ length: 60 }, (_, i) => String(2026 - i)).map(y => (
                        <option key={y} value={y}>{t("year")} {y}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider block">Email</label>
              <input 
                disabled={isLoading}
                type="email" 
                placeholder="tên@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-muted/40 border rounded-xl py-2.5 px-4 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-background transition-all disabled:opacity-50"
              />
            </div>

            {mode === "signup" && (
              <>
                {/* Username field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider block">{t("username")}</label>
                  <input 
                    disabled={isLoading}
                    type="text" 
                    placeholder="andrew123"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full bg-muted/40 border rounded-xl py-2.5 px-4 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-background transition-all disabled:opacity-50"
                  />
                </div>
              </>
            )}

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider block">{t("password")}</label>
              <input 
                disabled={isLoading}
                type="password" 
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-muted/40 border rounded-xl py-2.5 px-4 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-background transition-all disabled:opacity-50"
              />
            </div>

            {mode === "signup" && (
              <label className="flex items-start gap-2.5 py-1 cursor-pointer select-none">
                <input disabled={isLoading} type="checkbox" required className="mt-0.5" />
                <span className="text-xs text-muted-foreground leading-normal">
                  {t("iAcceptTerms")}
                </span>
              </label>
            )}

            {/* Submit button */}
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl transition-all outline-none shadow-md hover:shadow-blue-500/10 active:scale-[0.99] mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading && (
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {mode === "signup" ? t("signUp") : t("signin")}
            </button>
          </form>

          {/* Toggle buttons at bottom */}
          <div className="text-center shrink-0">
            {mode === "signup" ? (
              <button 
                disabled={isLoading}
                onClick={() => setMode("signin")}
                className="text-xs font-bold text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
              >
                <span className="text-blue-600 hover:underline">{t("alreadyHaveAccount")}</span>
              </button>
            ) : (
              <button 
                disabled={isLoading}
                onClick={() => setMode("signup")}
                className="text-xs font-bold text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
              >
                <span className="text-blue-600 hover:underline">{t("dontHaveAccount")}</span>
              </button>
            )}
          </div>

          {/* Language Selector at the very bottom of signup page */}
          <div className="pt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground select-none shrink-0 border-t border-muted/30 mt-4 w-full">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-transparent border-none text-xs font-bold text-muted-foreground hover:text-foreground outline-none cursor-pointer transition-all focus:ring-0"
            >
              <option value="vi">Tiếng Việt (VI)</option>
              <option value="en">English (EN)</option>
              <option value="zh">中文 (ZH)</option>
            </select>
          </div>

        </div>
      </div>

    </div>
  );
};

export default SignUpClient;
