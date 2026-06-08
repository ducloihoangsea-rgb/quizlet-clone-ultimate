"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useSignInDialogContext } from "~/contexts/sign-in-dialog-context";
import { useTranslation } from "~/contexts/i18n-context";

export default function Hero() {
  const { t } = useTranslation();
  const { onOpenChange } = useSignInDialogContext();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const openSignIn = () => {
    onOpenChange(true);
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { scrollLeft } = scrollContainerRef.current;
      const scrollAmount = 320; // Cuộn ngang khoảng 1 card và gap
      scrollContainerRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="space-y-16 select-none pb-20 pt-8 max-w-6xl mx-auto px-4">
      
      {/* Banner Section */}
      <div className="text-center space-y-6 max-w-2xl mx-auto pt-6">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-[#1a1b1d] dark:text-white leading-tight">
          Bạn muốn học như thế nào?
        </h1>
        
        <p className="text-base sm:text-lg text-muted-foreground font-medium max-w-xl mx-auto leading-relaxed">
          Nắm vững kiến thức đang học với thẻ ghi nhớ tương tác, bài kiểm tra thử và hoạt động học tập của Quizlet.
        </p>
        
        <div className="flex flex-col items-center gap-4 pt-2">
          <button 
            onClick={openSignIn}
            className="px-10 py-4 bg-[#4257b2] hover:bg-[#3b4c9b] text-white font-extrabold text-base rounded-full transition-all shadow-md active:scale-[0.98] outline-none"
          >
            Đăng ký miễn phí
          </button>
          
          <button 
            onClick={openSignIn}
            className="text-sm font-bold text-[#4257b2] dark:text-[#60a5fa] hover:underline transition-all outline-none"
          >
            Tôi là giáo viên
          </button>
        </div>
      </div>

      {/* 4 Card Features Section */}
      <div className="relative group">
        
        {/* Left Arrow Button */}
        <button 
          onClick={() => scroll("left")}
          className="absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full border bg-background text-foreground shadow-md hover:bg-accent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity active:scale-95 outline-none hidden md:flex"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Scroll Container */}
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-6 pb-6 scrollbar-none snap-x snap-mandatory touch-pan-x"
        >
          
          {/* Card 1: Học */}
          <div 
            onClick={openSignIn}
            className="min-w-[280px] sm:min-w-[290px] md:min-w-0 md:flex-1 h-[420px] bg-card border rounded-3xl overflow-hidden hover:shadow-lg transition-all cursor-pointer snap-start flex flex-col group/card"
          >
            {/* Header portion */}
            <div className="bg-[#bce6fc] h-32 flex items-center justify-center relative select-none shrink-0">
              <span className="font-extrabold text-2xl text-[#1a1b1d]">Học</span>
            </div>
            {/* Simulation portion */}
            <div className="flex-1 p-6 bg-muted/20 dark:bg-muted/5 flex flex-col justify-between">
              <div className="border rounded-2xl p-5 bg-background shadow-sm space-y-4 min-h-[160px] flex flex-col justify-center relative">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest absolute top-3 left-4">Thuật ngữ</span>
                <div className="text-xl font-bold text-center text-[#1a1b1d] dark:text-white leading-normal pt-2">
                  la pintura
                </div>
              </div>
              <div className="w-full">
                <div className="w-full bg-background border rounded-xl px-4 py-3 text-xs font-semibold text-muted-foreground/60 shadow-inner flex items-center">
                  Nhập đáp án
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Thẻ ghi nhớ */}
          <div 
            onClick={openSignIn}
            className="min-w-[280px] sm:min-w-[290px] md:min-w-0 md:flex-1 h-[420px] bg-card border rounded-3xl overflow-hidden hover:shadow-lg transition-all cursor-pointer snap-start flex flex-col group/card"
          >
            {/* Header portion */}
            <div className="bg-[#2e3895] h-32 flex items-center justify-center relative select-none shrink-0">
              <span className="font-extrabold text-2xl text-white">Thẻ ghi nhớ</span>
            </div>
            {/* Simulation portion */}
            <div className="flex-1 p-6 bg-muted/20 dark:bg-muted/5 flex flex-col justify-center">
              <div className="border rounded-2xl p-5 bg-background shadow-md min-h-[200px] flex flex-col justify-between items-center relative rotate-[-2deg] transition-transform group-hover/card:rotate-0">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest absolute top-3 left-4">Thẻ lật</span>
                
                <div className="flex-1 flex flex-col justify-center items-center gap-4 w-full pt-4">
                  {/* Heart SVG */}
                  <svg className="w-16 h-16 text-rose-500" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M32 16c-3-5-9-5-12 0-4 5-4 13 0 18l12 14 12-14c4-5 4-13 0-18-3-5-9-5-12 0z" fill="currentColor" />
                    <path d="M28 8v8M36 6v10" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
                    <path d="M32 16h4M28 20h4" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  
                  <span className="font-bold text-base text-center text-[#1a1b1d] dark:text-white leading-normal">
                    tĩnh mạch chủ trên
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Kiểm tra */}
          <div 
            onClick={openSignIn}
            className="min-w-[280px] sm:min-w-[290px] md:min-w-0 md:flex-1 h-[420px] bg-card border rounded-3xl overflow-hidden hover:shadow-lg transition-all cursor-pointer snap-start flex flex-col group/card"
          >
            {/* Header portion */}
            <div className="bg-[#ffcd1f] h-32 flex items-center justify-center relative select-none shrink-0">
              <span className="font-extrabold text-2xl text-[#1a1b1d]">Kiểm tra</span>
            </div>
            {/* Simulation portion */}
            <div className="flex-1 p-6 bg-muted/20 dark:bg-muted/5 flex flex-col justify-between">
              <div className="text-sm font-bold text-[#1a1b1d] dark:text-white flex justify-between items-center shrink-0">
                <span>Thời gian: 6 phút</span>
              </div>
              
              <div className="flex-1 flex items-center justify-center py-2">
                {/* Dial progress percentage 75% */}
                <div className="w-24 h-24 rounded-full border-[8px] border-[#10b981] flex items-center justify-center relative">
                  <div className="absolute inset-0 rounded-full border-[8px] border-slate-100 dark:border-slate-800 -m-[8px] -z-10" />
                  <span className="font-black text-xl text-[#1a1b1d] dark:text-white">75%</span>
                </div>
              </div>
              
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400 flex items-center justify-center text-xs font-bold">✓</div>
                  <span className="text-sm font-bold text-muted-foreground">Đúng: 9</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xs font-bold">✕</div>
                  <span className="text-sm font-bold text-muted-foreground">Sai: 3</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Ghép thẻ */}
          <div 
            onClick={openSignIn}
            className="min-w-[280px] sm:min-w-[290px] md:min-w-0 md:flex-1 h-[420px] bg-card border rounded-3xl overflow-hidden hover:shadow-lg transition-all cursor-pointer snap-start flex flex-col group/card"
          >
            {/* Header portion */}
            <div className="bg-[#ffdbd0] h-32 flex items-center justify-center relative select-none shrink-0">
              <span className="font-extrabold text-2xl text-[#1a1b1d]">Ghép thẻ</span>
            </div>
            {/* Simulation portion */}
            <div className="flex-1 p-5 bg-muted/20 dark:bg-muted/5 flex flex-col justify-center">
              <div className="grid grid-cols-2 gap-3.5 w-full">
                {/* Lung text box */}
                <div className="border-2 rounded-xl p-3 bg-background shadow-sm text-center font-bold text-xs flex items-center justify-center min-h-[56px] text-[#1a1b1d] dark:text-white">
                  phổi
                </div>
                
                {/* Lungs SVG box */}
                <div className="border-2 rounded-xl p-2 bg-background shadow-sm flex items-center justify-center min-h-[56px] text-rose-400">
                  <svg className="w-10 h-10" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 16c-4 0-8 3-8 9v12c0 6 4 9 8 9h2V16h-2z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="2" />
                    <path d="M44 16c4 0 8 3 8 9v12c0 6-4 9-8 9h-2V16h2z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="2" />
                    <path d="M32 8v36" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    <path d="M24 16h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
                
                {/* Active correct connection box */}
                <div className="col-span-2 border-2 border-green-500 bg-green-50/70 dark:bg-green-950/20 rounded-xl p-3 shadow-sm flex items-center justify-between min-h-[56px]">
                  <span className="font-bold text-xs text-green-700 dark:text-green-400">Đã ghép đúng</span>
                  <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3px]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Arrow Button */}
        <button 
          onClick={() => scroll("right")}
          className="absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full border bg-background text-foreground shadow-md hover:bg-accent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity active:scale-95 outline-none hidden md:flex"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

      </div>

    </div>
  );
}
