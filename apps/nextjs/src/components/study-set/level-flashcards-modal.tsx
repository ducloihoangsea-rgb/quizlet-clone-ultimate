"use client";

import { useEffect } from "react";
import { cn } from "@acme/ui";
import { type SelectFlashcard } from "@acme/db/schema";

export default function LevelFlashcardsModal({
  level,
  cards,
  onClose,
  theme,
  now
}: {
  level: { level: number; title: string; days: number };
  cards: any[];
  onClose: () => void;
  theme: any;
  now: Date;
}) {
  
  // lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const formatTimeLeft = (targetDate: Date) => {
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

      if (days > 0) return `${days} ngày ${hStr}:${mStr}:${sStr}`;
      return `${hStr}:${mStr}:${sStr}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <div 
            className="bg-card border border-border w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b border-border bg-muted/30 rounded-t-2xl">
                <div>
                    <h2 className={cn("text-xl font-bold flex items-center gap-2", theme.text)}>
                        LEVEL {level.level}: {level.title}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">Gồm {cards.length} thẻ • Lịch ôn tập sau {level.days === 0 && level.level === 0 ? "0 ngày" : level.days === 0 ? "1 giờ" : `${level.days} ngày`}</p>
                </div>
                <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 text-muted-foreground transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-3">
                {cards.map(card => {
                    const reviewDate = card.progress?.nextReviewDate ? new Date(card.progress.nextReviewDate) : null;
                    return (
                        <div key={card.id} className="bg-muted/20 p-4 rounded-xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex-1 flex gap-4">
                                <span className="w-1/2 border-r border-border font-semibold text-foreground pr-4 break-words">{card.term}</span>
                                <span className="w-1/2 text-muted-foreground break-words">{card.definition}</span>
                            </div>
                            <div className="flex flex-col items-end shrink-0">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Tới hạn ôn tập sau:</span>
                                <span className={cn("text-sm font-mono font-bold px-2 py-0.5 rounded mt-1", theme.badgeText, theme.badgeBg)}>
                                    {reviewDate ? formatTimeLeft(reviewDate) : "Học ngay!"}
                                </span>
                            </div>
                        </div>
                    )
                })}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-border bg-card rounded-b-2xl flex justify-end">
                <button onClick={onClose} className="px-5 py-2.5 bg-muted hover:bg-muted/80 border border-border rounded-lg font-bold transition-all text-sm text-foreground shadow-sm">Đóng lại</button>
            </div>
        </div>
    </div>
  )
}
