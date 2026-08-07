"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ChevronDown, 
  Activity, 
  Users, 
  BookOpen, 
  MoreVertical, 
  Plus,
  Play,
  EyeOff,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

import { Button } from "@acme/ui/button";
import { toast } from "@acme/ui/toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";

import { api } from "~/trpc/react";
import { useFolderDialogContext } from "~/contexts/folder-dialog-context";
import { useTranslation } from "~/contexts/i18n-context";

// Custom SVG Icons matching Quizlet styles
const StudySetIcon = () => (
  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="14" height="14" rx="2" fill="currentColor" fillOpacity="0.1" />
    <path d="M6 2h14a2 2 0 0 1 2 2v14" />
    <path d="M6 10h6" strokeWidth="1.5" />
    <path d="M6 14h4" strokeWidth="1.5" />
  </svg>
);

const StudyGuideIcon = () => (
  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="currentColor" fillOpacity="0.1" />
    <path d="M8 6h8" strokeWidth="1.5" />
    <path d="M8 10h8" strokeWidth="1.5" />
    <path d="M8 14h4" strokeWidth="1.5" />
  </svg>
);

const PracticeTestIcon = () => (
  <svg className="w-5 h-5 text-orange-500 dark:text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="currentColor" fillOpacity="0.1" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" strokeWidth="1.5" />
    <line x1="16" y1="17" x2="8" y2="17" strokeWidth="1.5" />
  </svg>
);

const LiveIcon = () => (
  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="4" y1="7" x2="20" y2="7" />
    <line x1="7" y1="12" x2="17" y2="12" />
    <line x1="10" y1="17" x2="14" y2="17" />
  </svg>
);

const BlastIcon = () => (
  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21 3 21 3s-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.7c-.2.5 0 1 .4 1.3L9 12l-4 4H3l-1 3 3-1v-2l4-4 3.2 5.2c.3.4.8.6 1.3.4l.7-.3c.4-.2.6-.6.5-1.1z" fill="currentColor" fillOpacity="0.1" />
  </svg>
);

// Simple hash function to generate consistent percentages for cards
const getHashPercentage = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const percentage = Math.abs(hash % 70) + 25; // 25% to 95%
  return percentage;
};

const DashboardContent = ({ userId }: { userId: string }) => {
  const [studySets] = api.studySet.allByUser.useSuspenseQuery({ userId });
  const [, dispatch] = useFolderDialogContext();
  const { t } = useTranslation();
  const router = useRouter();

  // Fetch tiến độ thực tế từ DB qua tRPC
  const studySetIds = React.useMemo(() => studySets.map((s) => s.id), [studySets]);
  const { data: progressData } = api.studyProgress.getStudySetsProgress.useQuery(
    { studySetIds },
    { enabled: studySetIds.length > 0 }
  );

  if (studySets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 p-4 bg-primary/10 rounded-full text-primary">
          <BookOpen size={48} />
        </div>
        <h3 className="text-xl font-bold mb-2">Chưa có học phần nào</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Tạo học phần đầu tiên của bạn để bắt đầu học và rèn luyện trí nhớ!
        </p>
        <Link href="/create-set">
          <Button>Tạo học phần</Button>
        </Link>
      </div>
    );
  }

  // Carousel state
  const carouselRef = React.useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = React.useState(0);
  const [hiddenSets, setHiddenSets] = React.useState<string[]>([]);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("hidden_jump_back_sets");
      if (stored) setHiddenSets(JSON.parse(stored));
    } catch (e) {}
  }, []);

  const handleHideSet = (id: string) => {
    const newHidden = [...hiddenSets, id];
    setHiddenSets(newHidden);
    localStorage.setItem("hidden_jump_back_sets", JSON.stringify(newHidden));
    toast.success("Đã xóa khỏi bảng tin");
  };

  // Lọc bỏ những set đã ẩn, lấy tối đa 5 set cho thanh trượt
  const jumpBackSets = React.useMemo(() => {
    return studySets.filter(s => !hiddenSets.includes(s.id)).slice(0, 5);
  }, [studySets, hiddenSets]);

  const recentSets = studySets;

  const handleScroll = () => {
    if (carouselRef.current && carouselRef.current.children.length > 0) {
      const scrollLeft = carouselRef.current.scrollLeft;
      const cardWidth = (carouselRef.current.children[0] as HTMLElement).offsetWidth;
      const gap = 16; // gap-4 is 16px
      // Khoảng cách cuộn của 1 thẻ
      const scrollDistance = cardWidth + gap;
      const slideIndex = Math.round(scrollLeft / scrollDistance);
      setActiveSlide(slideIndex);
    }
  };

  const scrollByAmount = (direction: "left" | "right") => {
    if (carouselRef.current && carouselRef.current.children.length > 0) {
      const cardWidth = (carouselRef.current.children[0] as HTMLElement).offsetWidth;
      const gap = 16;
      const scrollDistance = cardWidth + gap;
      
      const newScrollLeft = direction === "left" 
        ? carouselRef.current.scrollLeft - scrollDistance 
        : carouselRef.current.scrollLeft + scrollDistance;
      carouselRef.current.scrollTo({ left: newScrollLeft, behavior: "smooth" });
    }
  };

  const handleQuickAction = (action: string) => {
    if (action === "create") {
      dispatch({ type: "open" });
    } else if (action === "studyset") {
      router.push("/create-set");
    } else {
      toast.info(`Tính năng "${action}" sẽ được phát triển sớm!`);
    }
  };

  return (
    <div className="space-y-8 select-none">
      {/* Quick Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold text-sm rounded-xl transition-all outline-none">
              <span>{t("createContent")}</span>
              <ChevronDown size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 p-1">
            <DropdownMenuItem onClick={() => handleQuickAction("studyset")} className="flex items-center gap-3 cursor-pointer py-2 px-3 font-semibold text-sm rounded-lg">
              <StudySetIcon />
              <span>{t("studySet")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleQuickAction("Hướng dẫn học")} className="flex items-center gap-3 cursor-pointer py-2 px-3 font-semibold text-sm rounded-lg">
              <StudyGuideIcon />
              <span>{t("studyGuide")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleQuickAction("Bài kiểm tra thử")} className="flex items-center gap-3 cursor-pointer py-2 px-3 font-semibold text-sm rounded-lg">
              <PracticeTestIcon />
              <span>{t("practiceTest")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          onClick={() => handleQuickAction("Giao hoạt động")}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold text-sm rounded-xl transition-all outline-none"
        >
          <Activity size={16} />
          <span>{t("assignActivity")}</span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold text-sm rounded-xl transition-all outline-none">
              <Users size={16} />
              <span>{t("playClassGame")}</span>
              <ChevronDown size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48 p-1">
            <DropdownMenuItem onClick={() => handleQuickAction("Live")} className="flex items-center gap-3 cursor-pointer py-2 px-3 font-semibold text-sm rounded-lg">
              <LiveIcon />
              <span>{t("live")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleQuickAction("Blast")} className="flex items-center gap-3 cursor-pointer py-2 px-3 font-semibold text-sm rounded-lg">
              <BlastIcon />
              <span>{t("blast")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Jump back in section */}
      {jumpBackSets.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4 tracking-tight">{t("jumpBackIn")}</h2>
          <div className="relative group/carousel">
            
            {/* Nút lùi */}
            <button 
              onClick={() => scrollByAmount("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-10 h-10 bg-secondary text-secondary-foreground border border-border rounded-full flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 disabled:opacity-0 transition-opacity shadow-lg hover:bg-secondary/80"
              disabled={activeSlide === 0}
            >
              <ChevronLeft size={24} />
            </button>

            {/* Vùng trượt (Carousel container) có mask làm mờ 2 cạnh */}
            <div 
              ref={carouselRef}
              onScroll={handleScroll}
              className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 pb-2 px-[2%] md:px-[7%]"
              style={{ 
                scrollbarWidth: "none", 
                msOverflowStyle: "none",
                WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
                maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)"
              }}
            >
              {jumpBackSets.map((set, index) => {
                const prog = progressData?.[set.id];
                const percentage = prog?.percentage ?? 0;
                const total = prog?.total ?? 0;
                const learned = prog?.learned ?? 0;
                
                return (
                  <div 
                    key={set.id}
                    className="flex items-center justify-between border-2 border-border/50 rounded-2xl p-6 bg-card text-card-foreground hover:border-border transition-all relative overflow-hidden group min-w-[96%] md:min-w-[86%] min-h-[220px] snap-center shrink-0 shadow-sm"
                  >
                    {/* Information */}
                    <div className="space-y-4 flex-1 z-10 pr-4 mt-2">
                      <h3 className="font-extrabold text-2xl line-clamp-2 text-foreground">
                        {set.title}
                      </h3>
                      
                      <div className="space-y-2 w-full max-w-[280px]">
                        {/* Progress bar ở trên */}
                        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                          <div 
                            className="h-full bg-[#10b981] rounded-full transition-all duration-500" 
                            style={{ width: `${Math.max(percentage, 5)}%` }}
                          />
                        </div>
                        {/* Chữ hiển thị tiến trình ở dưới (fraction) */}
                        <p className="text-[13px] text-muted-foreground font-semibold tracking-wide flex items-center gap-2">
                          <span className="text-[#10b981]">{percentage}%</span> 
                          <span>&bull;</span> 
                          <span>{t("cardsSortedCount").replace("{learned}", String(learned)).replace("{total}", String(total))}</span>
                        </p>
                      </div>
    
                      <Button asChild className="rounded-full bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold px-7 py-5 text-[15px] h-auto mt-4 active:scale-95 transition-all shadow-sm">
                        <Link href={`/study-sets/${set.id}`}>
                          {t("continue")}
                        </Link>
                      </Button>
                    </div>

                    {/* SVG Illustration side (3D Cards) */}
                    <div className="hidden sm:block w-48 h-full shrink-0 relative opacity-90 group-hover:opacity-100 transition-opacity translate-y-4 translate-x-4">
                      <svg viewBox="0 0 200 200" className="absolute bottom-0 right-0 w-56 h-56 -mb-6 -mr-4 drop-shadow-2xl">
                        {/* Card 1 (Xanh nước biển chìm) */}
                        <rect x="20" y="80" width="100" height="130" rx="8" className="fill-blue-600/80 dark:fill-[#1e3a8a] dracula:fill-[#bd93f9]" transform="rotate(-15 60 140)" />
                        {/* Card 2 (Cam dấu X) */}
                        <rect x="40" y="60" width="100" height="130" rx="8" className="fill-orange-600/80 dark:fill-[#9a3412] dracula:fill-[#ffb86c]" transform="rotate(-5 90 120)" />
                        <path d="M70 100 L110 140 M110 100 L70 140" className="stroke-orange-200 dark:stroke-[#f97316] dracula:stroke-[#282a36]" strokeWidth="12" strokeLinecap="round" transform="rotate(-5 90 120)" />
                        {/* Card 3 (Xanh lá dấu Check - Lên trên cùng) */}
                        <rect x="70" y="40" width="100" height="130" rx="8" className="fill-emerald-600/90 dark:fill-[#064e3b] dracula:fill-[#50fa7b]" />
                        <rect x="70" y="40" width="100" height="130" rx="8" fill="none" className="stroke-emerald-300 dark:stroke-[#34d399] dracula:stroke-[#50fa7b]" strokeWidth="2" />
                        <path d="M100 110 L115 125 L145 80" className="stroke-emerald-100 dark:stroke-[#34d399] dracula:stroke-[#282a36]" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                        <rect x="100" y="145" width="40" height="6" rx="3" className="fill-emerald-300 dark:fill-[#34d399] dracula:fill-[#282a36]/50" />
                        <rect x="100" y="157" width="25" height="6" rx="3" className="fill-emerald-300 dark:fill-[#34d399] dracula:fill-[#282a36]/50" />
                      </svg>
                    </div>

                    {/* Options button (Xóa) */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-accent transition-colors">
                          <MoreVertical size={20} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-popover border-border">
                        <DropdownMenuItem 
                          onClick={() => handleHideSet(set.id)}
                          className="flex items-center gap-3 cursor-pointer py-2.5 px-3 font-semibold text-sm rounded-lg text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                        >
                          <EyeOff size={18} />
                          <span>Xóa</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>

            {/* Nút tiến */}
            <button 
              onClick={() => scrollByAmount("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-10 h-10 bg-secondary text-secondary-foreground border border-border rounded-full flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 disabled:opacity-0 transition-opacity shadow-lg hover:bg-secondary/80"
              disabled={activeSlide === jumpBackSets.length - 1}
            >
              <ChevronRight size={24} />
            </button>

            {/* Dots */}
            {jumpBackSets.length > 1 && (
              <div className="flex justify-center gap-2 mt-6 mb-2">
                {jumpBackSets.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-2 rounded-full transition-all ${i === activeSlide ? "w-6 bg-[#4f46e5]" : "w-2 bg-secondary"}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recents section */}
      <div>
        <h2 className="text-xl font-bold mb-4 tracking-tight">{t("recents")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recentSets.map((set) => (
            <Link key={set.id} href={`/study-sets/${set.id}`}>
              <div className="flex items-center gap-4 border rounded-xl p-4 bg-card hover:bg-accent/40 active:scale-[0.98] transition-all cursor-pointer">
                {/* Icon card */}
                <div className="p-3 bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
                  <BookOpen size={22} />
                </div>
                
                {/* Details */}
                <div className="overflow-hidden flex-1">
                  <h3 className="font-bold text-sm truncate">{set.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                    {t("cardsCount").replace("{count}", String(set.flashcardCount))} &middot; {t("byYou")}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Suggestion section */}
      {studySets.length > 0 && (
        <div className="border-t pt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold tracking-tight">{t("basedOnRecent")}</h2>
            <button className="text-muted-foreground hover:text-foreground">
              <MoreVertical size={18} />
            </button>
          </div>
          <div className="border rounded-xl p-6 bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-extrabold text-lg">{studySets[studySets.length - 1]?.title}</h3>
              <p className="text-xs text-muted-foreground">{t("continuePracticing")}</p>
            </div>
            <Link href={`/study-sets/${studySets[studySets.length - 1]?.id ?? ""}`}>
              <Button variant="outline" className="gap-2 text-xs font-bold rounded-full">
                <Play size={12} className="fill-current" />
                {t("studyNext")}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

const Dashboard = ({ userId }: { userId: string }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="h-10 w-48 bg-muted animate-pulse rounded-md" />
            <div className="grid gap-6 md:grid-cols-2">
              <div className="h-40 bg-muted animate-pulse rounded-2xl" />
              <div className="h-40 bg-muted animate-pulse rounded-2xl" />
            </div>
          </div>
        }
      >
        <DashboardContent userId={userId} />
      </Suspense>
    </div>
  );
};

export default Dashboard;
