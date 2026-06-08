"use client";

import React from "react";
import Image from "next/image";
import { Copy, FilePen, GraduationCap, Puzzle, Star, Zap, CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@acme/ui/button";
import { useSignInDialogContext } from "~/contexts/sign-in-dialog-context";
import { useTranslation } from "~/contexts/i18n-context";

export default function Hero() {
  const { t } = useTranslation();
  const { onOpenChange } = useSignInDialogContext();

  const openSignIn = () => {
    onOpenChange(true);
  };

  const features = [
    {
      Icon: Copy,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-900",
      title: t("flashcards") || "Thẻ ghi nhớ",
      desc: "Chuyển đổi tài liệu học tập của bạn thành các thẻ ghi nhớ trực quan để ôn tập và ghi nhớ nhanh chóng mọi lúc mọi nơi.",
    },
    {
      Icon: GraduationCap,
      color: "bg-green-100 text-green-600 dark:bg-green-950/60 dark:text-green-400 border-green-200 dark:border-green-900",
      title: t("learn") || "Học",
      desc: "Chế độ học thông minh tự động điều chỉnh câu hỏi trắc nghiệm và tự luận để giúp bạn ôn luyện hiệu quả nhất.",
    },
    {
      Icon: FilePen,
      color: "bg-orange-100 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400 border-orange-200 dark:border-orange-900",
      title: t("test") || "Kiểm tra",
      desc: "Tạo các bài kiểm tra thử ngẫu nhiên để đánh giá năng lực thực tế của bạn trước khi bước vào kỳ thi chính thức.",
    },
    {
      Icon: Puzzle,
      color: "bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 border-purple-200 dark:border-purple-900",
      title: t("match") || "Ghép thẻ",
      desc: "Trò chơi ghép thẻ tính giờ kịch tính, vừa học vừa giải trí giúp bạn tăng tốc độ phản xạ và ghi nhớ sâu hơn.",
    },
  ];

  const stats = [
    { value: "90%", desc: "Học sinh sử dụng Quizlet cho biết họ đạt điểm cao hơn" },
    { value: "60M+", desc: "Người học chủ động sử dụng phần mềm mỗi tháng" },
    { value: "500M+", desc: "Bộ thẻ ghi nhớ đã được tạo lập và chia sẻ" },
  ];

  return (
    <div className="space-y-24 select-none pb-24">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-12 md:pt-20">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-12 gap-8 items-center">
          
          {/* Left Info */}
          <div className="md:col-span-7 space-y-6 text-center md:text-left z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-full font-bold text-xs border border-blue-100 dark:border-blue-900/50">
              <Zap size={14} className="fill-current" />
              <span>Phương pháp ghi nhớ hiện đại hiệu quả</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-foreground">
              Giải pháp tối ưu để <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">ghi nhớ mọi thứ</span>
            </h1>
            
            <p className="text-lg text-muted-foreground font-medium max-w-lg leading-relaxed mx-auto md:mx-0">
              Học tốt hơn ở bất kỳ môn học nào cùng công cụ thẻ ghi nhớ và các chế độ luyện tập thông minh. 90% học sinh đạt kết quả cao hơn nhờ Quizlet.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start pt-2">
              <button 
                onClick={openSignIn}
                className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-lg hover:shadow-blue-500/20 active:scale-[0.98]"
              >
                Đăng ký miễn phí
              </button>
              <button 
                onClick={openSignIn}
                className="px-8 py-3.5 bg-background hover:bg-muted border border-input font-extrabold text-sm rounded-xl transition-all text-foreground active:scale-[0.98]"
              >
                Học thử ngay
              </button>
            </div>
          </div>

          {/* Right SVG Graphic */}
          <div className="md:col-span-5 flex justify-center items-center relative">
            <div className="w-72 h-72 sm:w-96 sm:h-96 relative flex justify-center items-center">
              {/* Decorative Blur Background */}
              <div className="absolute w-64 h-64 bg-blue-500/10 dark:bg-blue-400/5 rounded-full filter blur-3xl -z-10" />
              
              {/* SVG Illustration resembling flying Flashcards */}
              <svg className="w-full h-full text-blue-600 dark:text-blue-500" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Main Card (front) */}
                <g filter="url(#shadow)">
                  <rect x="100" y="80" width="200" height="130" rx="16" fill="currentColor" />
                  <rect x="102" y="82" width="196" height="126" rx="14" fill="white" className="dark:fill-[#1e293b]" />
                  <circle cx="140" cy="115" r="15" fill="currentColor" fillOpacity="0.1" />
                  <line x1="170" y1="110" x2="260" y2="110" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeOpacity="0.1" />
                  <line x1="170" y1="122" x2="230" y2="122" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeOpacity="0.1" />
                  <line x1="125" y1="160" x2="275" y2="160" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  <line x1="125" y1="172" x2="225" y2="172" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </g>
                
                {/* Secondary Card (back skewed) */}
                <g transform="rotate(-12, 220, 240)">
                  <rect x="120" y="190" width="180" height="120" rx="14" fill="#6366f1" />
                  <rect x="122" y="192" width="176" height="116" rx="12" fill="white" className="dark:fill-[#0f172a]" />
                  <circle cx="150" cy="220" r="10" fill="#6366f1" fillOpacity="0.1" />
                  <line x1="170" y1="220" x2="260" y2="220" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" strokeOpacity="0.2" />
                  <path d="M150 260l20 20 40-40" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                </g>

                {/* Sparkling sparks */}
                <path d="M70 150l10-5-10-5-5-10-5 10-10 5 10 5 5 10 5-10z" fill="#f59e0b" />
                <path d="M330 110l6-3-6-3-3-6-3 6-6 3 6 3 3 6 3-6z" fill="#f59e0b" />
                <path d="M90 280l8-4-8-4-4-8-4 8-8 4 8 4 4 8 4-8z" fill="#10b981" />
                
                <defs>
                  <filter id="shadow" x="80" y="65" width="240" height="170" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#000000" floodOpacity="0.08" />
                  </filter>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Section */}
      <div className="max-w-6xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Luyện tập thông minh với các chế độ học
          </h2>
          <p className="text-muted-foreground font-medium max-w-xl mx-auto leading-relaxed">
            Mỗi công cụ được thiết kế khoa học giúp bạn tối ưu hóa thời gian học tập, ghi nhớ nhanh và phản xạ chính xác.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, index) => {
            const Icon = feat.Icon;
            return (
              <div 
                key={index}
                onClick={openSignIn}
                className="flex flex-col justify-between p-6 bg-card border rounded-2xl hover:shadow-md hover:border-blue-400 dark:hover:border-blue-900 transition-all cursor-pointer group"
              >
                <div className="space-y-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border font-bold ${feat.color}`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="font-extrabold text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    {feat.desc}
                  </p>
                </div>
                
                <div className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 mt-4 group-hover:translate-x-1 transition-transform">
                  <span>Trải nghiệm ngay</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Statistics Section */}
      <div className="bg-muted/40 border-y py-16">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-8 text-center">
          {stats.map((stat, idx) => (
            <div key={idx} className="space-y-2">
              <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <p className="text-sm font-semibold text-muted-foreground max-w-xs mx-auto leading-normal">
                {stat.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Why Choose Quizlet */}
      <div className="max-w-4xl mx-auto px-4 space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
            Lý do hàng triệu học sinh chọn chúng tôi
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex gap-3 items-start">
            <CheckCircle2 className="text-blue-600 shrink-0 mt-0.5" size={20} />
            <div className="space-y-1">
              <h4 className="font-extrabold text-sm">Hiệu quả đã được chứng minh</h4>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">Các phương pháp lặp lại ngắt quãng (spaced repetition) và truy hồi chủ động giúp củng cố liên kết thần kinh, tăng tốc trí nhớ dài hạn.</p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <CheckCircle2 className="text-blue-600 shrink-0 mt-0.5" size={20} />
            <div className="space-y-1">
              <h4 className="font-extrabold text-sm">Học tập đa nền tảng linh hoạt</h4>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">Bắt đầu học trên điện thoại khi đi xe buýt, tiếp tục ôn luyện trên máy tính tại nhà. Đồng bộ hóa dữ liệu mọi lúc mọi nơi.</p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <CheckCircle2 className="text-blue-600 shrink-0 mt-0.5" size={20} />
            <div className="space-y-1">
              <h4 className="font-extrabold text-sm">Cộng đồng học liệu khổng lồ</h4>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">Dễ dàng chia sẻ học phần với bạn bè cùng lớp, cùng học tập, cùng tiến bộ và thi đua thứ hạng điểm số.</p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <CheckCircle2 className="text-blue-600 shrink-0 mt-0.5" size={20} />
            <div className="space-y-1">
              <h4 className="font-extrabold text-sm">Tự do tùy biến học phần</h4>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">Tự thiết lập, nhập liệu nhanh các thuật ngữ học thuật hoặc định nghĩa theo ý thích. Tải tệp tin Excel, CSV lên để tạo học phần tức thì.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Footer */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-700 to-indigo-600 p-8 sm:p-12 text-center text-white shadow-xl">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full filter blur-xl transform translate-x-12 -translate-y-12" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/20 rounded-full filter blur-lg transform -translate-x-6 translate-y-6" />

          <div className="relative z-10 space-y-6 max-w-xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Sẵn sàng bứt phá điểm số học tập của bạn?
            </h2>
            <p className="text-sm text-blue-100 font-medium">
              Tham gia cùng hàng triệu học sinh và giáo viên trên toàn thế giới để biến việc học trở nên dễ dàng và thú vị hơn bao giờ hết.
            </p>
            <div className="pt-2">
              <button 
                onClick={openSignIn}
                className="px-8 py-3.5 bg-white text-blue-600 hover:bg-blue-50 font-extrabold text-sm rounded-xl transition-all shadow-md active:scale-[0.98]"
              >
                Bắt đầu học ngay bây giờ
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
