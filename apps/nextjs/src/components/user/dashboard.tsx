"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { 
  ChevronDown, 
  Activity, 
  Users, 
  BookOpen, 
  MoreVertical, 
  Plus,
  Play
} from "lucide-react";

import { Progress } from "@acme/ui/progress";
import { Button } from "@acme/ui/button";
import { toast } from "@acme/ui/toast";

import { api } from "~/trpc/react";
import { useFolderDialogContext } from "~/contexts/folder-dialog-context";

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
    } else {
      toast.info(`Tính năng "${action}" sẽ được phát triển sớm!`);
    }
  };

  return (
    <div className="space-y-8 select-none">
      {/* Quick Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => handleQuickAction("create")}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-semibold text-sm rounded-xl transition-all"
        >
          <span>Tạo nội dung</span>
          <ChevronDown size={16} />
        </button>

        <button
          onClick={() => handleQuickAction("Giao hoạt động")}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-semibold text-sm rounded-xl transition-all"
        >
          <Activity size={16} />
          <span>Giao hoạt động</span>
        </button>

        <button
          onClick={() => handleQuickAction("Chơi trò chơi lớp")}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-semibold text-sm rounded-xl transition-all"
        >
          <Users size={16} />
          <span>Chơi trò chơi lớp ...</span>
        </button>
      </div>

      {/* Jump back in section */}
      <div>
        <h2 className="text-xl font-bold mb-4 tracking-tight">Jump back in</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {jumpBackSets.map((set) => {
            const percentage = getHashPercentage(set.id);
            return (
              <div 
                key={set.id}
                className="flex items-center justify-between border rounded-2xl p-6 bg-card hover:shadow-md transition-all relative overflow-hidden group min-h-[160px]"
              >
                {/* Information */}
                <div className="space-y-4 flex-1 z-10 pr-4">
                  <div>
                    <h3 className="font-extrabold text-xl line-clamp-1 group-hover:text-primary transition-colors">
                      {set.title}
                    </h3>
                  </div>
                  
                  <div className="space-y-1 max-w-[200px]">
                    <Progress value={percentage} className="h-2 bg-secondary" />
                    <p className="text-xs text-muted-foreground font-semibold">
                      {percentage}% of questions completed
                    </p>
                  </div>

                  <Link href={`/study-sets/${set.id}`}>
                    <Button className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 text-xs h-auto mt-2 active:scale-95 transition-all">
                      Continue
                    </Button>
                  </Link>
                </div>

                {/* SVG Illustration side */}
                <div className="hidden sm:block w-36 h-full shrink-0 relative opacity-80 group-hover:opacity-100 transition-opacity">
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
        <h2 className="text-xl font-bold mb-4 tracking-tight">Recents</h2>
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
                    {set.flashcardCount} cards &middot; by you
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
            <h2 className="text-xl font-bold tracking-tight">Based on your recent studying</h2>
            <button className="text-muted-foreground hover:text-foreground">
              <MoreVertical size={18} />
            </button>
          </div>
          <div className="border rounded-xl p-6 bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-extrabold text-lg">{studySets[studySets.length - 1]?.title}</h3>
              <p className="text-xs text-muted-foreground">Tiếp tục ôn luyện học phần này để chuẩn bị cho các bài thi sắp tới.</p>
            </div>
            <Link href={`/study-sets/${studySets[studySets.length - 1]?.id ?? ""}`}>
              <Button variant="outline" className="gap-2 text-xs font-bold rounded-full">
                <Play size={12} className="fill-current" />
                Ôn tập tiếp
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
