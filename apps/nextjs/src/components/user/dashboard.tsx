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
  Play
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

  // Split studySets: first 2 for "Jump back in", the rest for "Recents"
  const jumpBackSets = studySets.slice(0, 2);
  const recentSets = studySets;

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
      <div>
        <h2 className="text-xl font-bold mb-4 tracking-tight">{t("jumpBackIn")}</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {jumpBackSets.map((set, index) => {
            const percentage = getHashPercentage(set.id);
            return (
              <div 
                key={set.id}
                className="flex items-center justify-between border rounded-2xl p-6 bg-card hover:shadow-md transition-all relative overflow-hidden group min-h-[160px]"
              >
                {/* Information */}
                <div className="space-y-4 flex-1 z-10 pr-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest block mb-0.5">CHƯƠNG {index + 5}</span>
                    <h3 className="font-extrabold text-xl line-clamp-1 group-hover:text-primary transition-colors">
                      {set.title}
                    </h3>
                  </div>
                  
                  <div className="space-y-2 w-full max-w-[240px]">
                    {/* Progress bar ở trên */}
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div 
                        className="h-full bg-[#10b981] rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    {/* Chữ hiển thị tiến trình ở dưới */}
                    <p className="text-xs text-muted-foreground font-semibold">
                      {percentage}% {t("questionsCompleted")}
                    </p>
                  </div>
 
                  <Link href={`/study-sets/${set.id}`}>
                    <Button className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 text-xs h-auto mt-2 active:scale-95 transition-all">
                      {t("continue")}
                    </Button>
                  </Link>
                </div>

                {/* SVG Illustration side */}
                <div className="hidden sm:block w-36 h-full shrink-0 relative opacity-85 group-hover:opacity-100 transition-opacity">
                  <svg className="w-full h-full text-blue-500/10 dark:text-blue-400/5" viewBox="0 0 100 100" fill="none">
                    <rect x="10" y="20" width="50" height="60" rx="6" stroke="currentColor" strokeWidth="2" />
                    <line x1="20" y1="35" x2="50" y2="35" stroke="currentColor" strokeWidth="2" />
                    <line x1="20" y1="45" x2="40" y2="45" stroke="currentColor" strokeWidth="2" />
                    <circle cx="75" cy="40" r="15" stroke="currentColor" strokeWidth="2" />
                    <rect x="65" y="65" width="25" height="15" rx="3" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>

                {/* Options button */}
                <button className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                  <MoreVertical size={18} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

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
