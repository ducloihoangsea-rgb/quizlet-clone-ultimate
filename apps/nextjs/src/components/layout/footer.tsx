"use client";

import React from "react";
import { useTranslation, type Language } from "~/contexts/i18n-context";
import { Globe } from "lucide-react";

export default function Footer() {
  const { language, setLanguage, t } = useTranslation();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  return (
    <footer className="w-full border-t border-border bg-card/40 py-6 px-4 md:px-8 mt-auto shrink-0 select-none">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Left Side: Logo & Copyright */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-sm text-muted-foreground">
          <span className="font-bold text-base text-foreground tracking-wider">
            Quizlet<span className="text-blue-500 font-extrabold">+</span>
          </span>
          <span className="hidden sm:inline text-muted-foreground/40">|</span>
          <span>&copy; {new Date().getFullYear()} Quizlet Clone. All rights reserved.</span>
        </div>

        {/* Right Side: Language Selector */}
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-bold text-muted-foreground mr-1 uppercase tracking-wider">{t("language")}:</span>
          <select
            value={language}
            onChange={handleLanguageChange}
            className="bg-background border border-input rounded-xl px-3 py-1.5 text-xs font-bold text-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 cursor-pointer transition-all hover:bg-accent/50"
          >
            <option value="vi">Tiếng Việt (VI)</option>
            <option value="en">English (EN)</option>
            <option value="zh">中文 (ZH)</option>
          </select>
        </div>

      </div>
    </footer>
  );
}
