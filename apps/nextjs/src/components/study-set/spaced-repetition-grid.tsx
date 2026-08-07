"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { type Session } from "@acme/auth";
import { api } from "~/trpc/react";
import { cn } from "@acme/ui";
import LevelFlashcardsModal from "./level-flashcards-modal";

const LEVELS = [
  { level: 0, title: "Chưa thuộc", days: 0, color: "slate" },
  { level: 1, title: "Đang học", days: 0, color: "red" },
  { level: 2, title: "Nhớ ngắn hạn", days: 1, color: "orange" },
  { level: 3, title: "Bắt đầu thuộc", days: 3, color: "yellow" },
  { level: 4, title: "Khá thuộc", days: 7, color: "lime" },
  { level: 5, title: "Thuộc tốt", days: 21, color: "green" },
  { level: 6, title: "Thuộc sâu", days: 56, color: "emerald" },
  { level: 7, title: "Thành thạo", days: 150, color: "blue" },
];

const COLORS = {
  slate: { bg: "bg-slate-500", border: "border-slate-500", hover: "hover:border-slate-500", text: "text-slate-200 dark:text-slate-200 text-slate-700", badgeText: "text-slate-500 dark:text-slate-400 text-slate-700", badgeBg: "bg-slate-500/10", timeText: "text-slate-600 dark:text-slate-300" },
  red: { bg: "bg-red-500", border: "border-red-500", hover: "hover:border-red-500", text: "text-red-700 dark:text-red-200", badgeText: "text-red-600 dark:text-red-400", badgeBg: "bg-red-500/10", timeText: "text-red-600 dark:text-red-300" },
  orange: { bg: "bg-orange-500", border: "border-orange-500", hover: "hover:border-orange-500", text: "text-orange-700 dark:text-orange-200", badgeText: "text-orange-600 dark:text-orange-400", badgeBg: "bg-orange-500/10", timeText: "text-orange-600 dark:text-orange-300" },
  yellow: { bg: "bg-yellow-500", border: "border-yellow-500", hover: "hover:border-yellow-500", text: "text-yellow-700 dark:text-yellow-200", badgeText: "text-yellow-600 dark:text-yellow-400", badgeBg: "bg-yellow-500/10", timeText: "text-yellow-600 dark:text-yellow-300" },
  lime: { bg: "bg-lime-500", border: "border-lime-500", hover: "hover:border-lime-500", text: "text-lime-700 dark:text-lime-200", badgeText: "text-lime-600 dark:text-lime-400", badgeBg: "bg-lime-500/10", timeText: "text-lime-600 dark:text-lime-300" },
  green: { bg: "bg-green-500", border: "border-green-500", hover: "hover:border-green-500", text: "text-green-700 dark:text-green-200", badgeText: "text-green-600 dark:text-green-400", badgeBg: "bg-green-500/10", timeText: "text-green-600 dark:text-green-300" },
  emerald: { bg: "bg-emerald-500", border: "border-emerald-500", hover: "hover:border-emerald-500", text: "text-emerald-700 dark:text-emerald-200", badgeText: "text-emerald-600 dark:text-emerald-400", badgeBg: "bg-emerald-500/10", timeText: "text-emerald-600 dark:text-emerald-300" },
  blue: { bg: "bg-blue-500", border: "border-blue-500", hover: "hover:border-blue-500", text: "text-blue-700 dark:text-blue-200", badgeText: "text-blue-600 dark:text-blue-400", badgeBg: "bg-blue-500/10", timeText: "text-blue-600 dark:text-blue-300" },
};

function formatTimeLeft(targetDate: Date, now: Date) {
  const diff = targetDate.getTime() - now.getTime();
  if (diff <= 0) return "Học ngay!";
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days >= 30) {
      const months = Math.floor(days / 30);
      const remDays = days % 30;
      return `${months}th ${remDays}d`;
  }
  
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / 1000 / 60) % 60);
  const s = Math.floor((diff / 1000) % 60);
  
  const hStr = h.toString().padStart(2, "0");
  const mStr = m.toString().padStart(2, "0");
  const sStr = s.toString().padStart(2, "0");

  if (days > 0) {
      return `${days}d ${hStr}:${mStr}:${sStr}`;
  }
  return `${hStr}:${mStr}:${sStr}`;
}

export default function SpacedRepetitionGrid({ session }: { session: Session | null }) {
  const { id }: { id: string } = useParams();
  const [{ flashcards }] = api.studySet.byId.useSuspenseQuery({ id });
  
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<number, typeof flashcards>();
    for (let i = 0; i < 8; i++) map.set(i, []);
    
    flashcards.forEach(card => {
      let lvl = 0;
      // @ts-ignore
      if (card.progress) {
         // @ts-ignore
         lvl = Math.min(card.progress.srsStep || 0, 7);
      }
      map.get(lvl)?.push(card);
    });
    return map;
  }, [flashcards]);

  if (!session) return null; // Only for logged-in users
  
  const cardsByLevel = (levelIndex: number) => grouped.get(levelIndex) || [];

  return (
    <div className="space-y-5 mb-8 pt-4">
      <div className="flex justify-between items-end">
          <h2 className="text-xl font-bold text-foreground">Tiến độ ghi nhớ</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {LEVELS.map((lvl, idx) => {
          const cards = cardsByLevel(idx);
          const theme = COLORS[lvl.color as keyof typeof COLORS];
          
          let latestDate: Date | null = null;
          cards.forEach(c => {
             // @ts-ignore
             if (c.progress?.nextReviewDate) {
                 // @ts-ignore
                 const d = new Date(c.progress.nextReviewDate);
                 if (!latestDate || d > latestDate) latestDate = d;
             }
          });

          return (
            <div 
              key={idx}
              onClick={() => { if(cards.length > 0) setSelectedLevel(idx) }}
              className={cn(
                "p-3 rounded-xl bg-card border border-border flex flex-col gap-1.5 relative overflow-hidden transition-all shadow-sm",
                cards.length > 0 ? `cursor-pointer hover:-translate-y-1 ${theme.hover} shadow-md` : "opacity-50 grayscale cursor-not-allowed"
              )}
            >
              <div className={cn("absolute top-0 left-0 w-full h-1", theme.bg)}></div>
              <div className="flex justify-between items-center">
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", theme.badgeText, theme.badgeBg)}>
                      LV {idx} ({lvl.days === 0 && idx === 0 ? "0 ngày" : lvl.days === 0 ? "1 giờ" : `${lvl.days} ngày`})
                  </span>
                  <span className="text-sm font-black text-foreground">
                      {cards.length} <span className="text-[10px] font-medium text-muted-foreground">thẻ</span>
                  </span>
              </div>
              <h3 className={cn("text-sm font-bold", theme.text)}>{lvl.title}</h3>
              <div className="mt-1 pt-1.5 border-t border-border/50 flex justify-between items-center">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Trễ nhất:</span>
                  <span className={cn("text-xs font-mono font-bold", theme.timeText)}>
                      {mounted && now ? (latestDate ? formatTimeLeft(latestDate, now) : (idx === 0 ? "Học ngay!" : "--:--:--")) : "--:--:--"}
                  </span>
              </div>
            </div>
          )
        })}
      </div>

      {selectedLevel !== null && now && (
        <LevelFlashcardsModal 
            level={LEVELS[selectedLevel]!}
            cards={cardsByLevel(selectedLevel)}
            onClose={() => setSelectedLevel(null)}
            theme={COLORS[LEVELS[selectedLevel]!.color as keyof typeof COLORS]}
            now={now}
        />
      )}
    </div>
  );
}
