"use client";

import { cn } from "@acme/ui";

interface LearnProgressBarProps {
  correctAnswersCount: number;
  totalCards: number;
  totalSegments: number;
  isFlashRed: boolean;
  isStreakActive: boolean;
}

const LearnProgressBar = ({
  correctAnswersCount,
  totalCards,
  totalSegments,
  isFlashRed,
  isStreakActive,
}: LearnProgressBarProps) => {
  const progressPercent =
    totalCards > 0
      ? Math.min((correctAnswersCount / totalCards) * 100, 100)
      : 0;

  // Màu thanh tiến trình
  const barColor = isFlashRed
    ? "#ef4444"
    : isStreakActive
      ? "#f97316"
      : "#10b981";

  return (
    <div className="flex items-center gap-2.5 w-full mb-6 select-none">
      {/* Bar container */}
      <div className="relative flex-1 h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full"
        style={{ overflow: "visible" }}
      >
        {/* Filled portion */}
        <div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: barColor,
            transition: "width 0.5s ease, background-color 0.3s ease",
          }}
        />

        {/* Segment dividers */}
        {Array.from({ length: Math.max(totalSegments - 1, 0) }).map(
          (_, i) => (
            <div
              key={i}
              className="absolute top-0 h-full w-[2px] bg-white dark:bg-slate-900"
              style={{
                left: `${((i + 1) / totalSegments) * 100}%`,
                zIndex: 1,
              }}
            />
          ),
        )}

        {/* Icon positioned at progress point */}
        <div
          className="absolute top-1/2 z-10"
          style={{
            left: `${progressPercent}%`,
            transform: "translate(-50%, -50%)",
            transition: "left 0.5s ease",
          }}
        >
          {isStreakActive ? (
            <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white font-extrabold text-[11px] shadow-lg border-2 border-orange-300 gap-0.5">
              <span className="text-[10px] leading-none">🔥</span>
              {correctAnswersCount}
            </div>
          ) : (
            <div
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-white font-extrabold text-[11px] shadow-lg border-2",
                isFlashRed
                  ? "bg-red-500 border-red-300 animate-pulse"
                  : "bg-emerald-600 border-emerald-400",
              )}
              style={{ transition: "background-color 0.3s ease" }}
            >
              {correctAnswersCount}
            </div>
          )}
        </div>
      </div>

      {/* Total count */}
      <div className="text-xs font-bold text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg min-w-[36px] text-center border border-slate-200 dark:border-slate-700 flex-shrink-0">
        {totalCards}
      </div>
    </div>
  );
};

export default LearnProgressBar;
