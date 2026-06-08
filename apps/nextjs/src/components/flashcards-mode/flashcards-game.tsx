"use client";

import { useParams, useRouter } from "next/navigation";
import { GraduationCap, RotateCcw, Undo2 } from "lucide-react";

import type { Session } from "@acme/auth";
import { Progress } from "@acme/ui/progress";

import { useFlashcardsModeContext } from "~/contexts/flashcards-mode-context";
import GameResult from "../shared/game-result";
import FlashcardsGameButtons from "./flashcards-game-buttons";
import FlipCard from "./flip-card";
import MessageCard from "./message-card";

export type FlashcardAnimation = "left" | "right" | "know" | "learning" | null;

interface FlashcardsGameProps {
  session: Session | null;
  fullscreen?: boolean;
}

const FlashcardsGame = ({ fullscreen, session }: FlashcardsGameProps) => {
  const {
    currentCard,
    count,
    hardCount,
    sorting,
    reset,
    reviewHard,
    progress,
    trackProgress,
    learningCount,
    knownCount,
  } = useFlashcardsModeContext();
  const router = useRouter();
  const { id }: { id: string } = useParams();

  const learnFlashcards = () => {
    router.push(`/study-sets/${id}/learn`);
  };

  const backToStudySet = () => {
    router.push(`/study-sets/${id}`);
  };

  const firstButton = {
    text:
      hardCount > 0
        ? "Review the tough terms"
        : !fullscreen
          ? "Learn flashcards"
          : "Back to set",
    description:
      hardCount > 0
        ? `Review Flashcards again with the ${hardCount} terms you're still learing.`
        : !fullscreen
          ? "Learn flashcards"
          : "Get back to the study set.",
    callback:
      hardCount > 0
        ? reviewHard
        : !fullscreen
          ? learnFlashcards
          : backToStudySet,
    Icon: !fullscreen ? <GraduationCap size={42} /> : <Undo2 size={32} />,
  };

  const secondButton = {
    text: "Reset Flashcards",
    description: `Study all ${count} terms from the beginning.`,
    callback: reset,
    Icon: <RotateCcw size={32} />,
  };

  if (!currentCard) {
    return (
      <GameResult
        hard={hardCount}
        cardCount={count}
        firstButton={firstButton}
        secondButton={secondButton}
      />
    );
  }

  return (
    <>
      {/* Thanh trạng thái Đang học / Đã biết khi bật Track Progress */}
      {trackProgress && (
        <div className="flex items-center justify-between mb-3 select-none">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 text-sm font-extrabold">
              {learningCount}
            </span>
            <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
              Đang học
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              Đã biết
            </span>
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-sm font-extrabold">
              {knownCount}
            </span>
          </div>
        </div>
      )}

      <div className="relative flex [perspective:1000px]">
        {(sorting || trackProgress) && <MessageCard />}
        <FlipCard fullscreen={fullscreen} session={session} />
      </div>

      {/* Footer "Nhấp vào thẻ để lật" khi không bật track progress */}
      {!trackProgress && (
        <div className="mt-0 mb-2 rounded-b-xl bg-blue-600 dark:bg-blue-700 text-white text-center py-2.5 text-sm font-bold select-none cursor-pointer shadow-sm">
          Nhấp vào thẻ để lật
        </div>
      )}

      {/* Footer "Phím tắt" khi bật track progress */}
      {trackProgress && (
        <div className="mt-0 mb-2 rounded-b-xl bg-indigo-50 dark:bg-indigo-950/30 text-center py-2.5 text-sm text-muted-foreground select-none border border-t-0 border-border">
          <span className="inline-flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-xs font-mono font-bold">Phím tắt</kbd>
            <span>Nhấn</span>
            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-xs font-mono font-bold">phím cách</kbd>
            <span>hoặc nhấp vào thẻ để lật</span>
          </span>
        </div>
      )}

      <FlashcardsGameButtons fullscreen={fullscreen} />

      {!trackProgress && <Progress value={progress} className="mb-6" />}
    </>
  );
};

export default FlashcardsGame;
