"use client";

import { useEffect, useRef, useState } from "react";
import { Star, Volume2, VolumeX } from "lucide-react";

import type { Session } from "@acme/auth";
import type { RouterOutputs } from "@acme/api";
import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import { Card } from "@acme/ui/card";
import { Separator } from "@acme/ui/separator";

import { useSignInDialogContext } from "~/contexts/sign-in-dialog-context";
import useStar from "~/hooks/use-star";

type Flashcard = RouterOutputs["studySet"]["learnCards"][number];
type FlashcardWithAnswers = Flashcard & { answers: string[] };

// ─── Sub-component cho mỗi thẻ (để gọi useStar hook ở component level) ───
const SegmentCardItem = ({
  card,
  isWrong,
  session,
}: {
  card: FlashcardWithAnswers;
  isWrong: boolean;
  session: Session | null;
}) => {
  const { toggleStar } = useStar(card);
  const { onOpenChange } = useSignInDialogContext();
  const [localStarred, setLocalStarred] = useState(card.starred);
  const [speaking, setSpeaking] = useState(false);

  const handleStar = () => {
    if (session) {
      toggleStar();
      setLocalStarred((prev) => !prev);
    } else {
      onOpenChange(true);
    }
  };

  const handleSpeak = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const text = `${card.term}. ${card.definition}`;
    const hasVi =
      /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(
        text,
      );
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = hasVi ? "vi-VN" : "en-US";
    utt.onend = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utt);
    setSpeaking(true);
  };

  // Cleanup TTS on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div
      className={cn(
        "flex items-stretch border rounded-xl transition-all text-sm",
        isWrong
          ? "border-red-300 bg-red-50/60 dark:border-red-900/60 dark:bg-red-950/20"
          : "border-border bg-card",
      )}
    >
      {/* Term */}
      <div className="flex-1 p-3 whitespace-pre-wrap border-r text-foreground">
        {card.term}
      </div>
      {/* Definition */}
      <div className="flex-1 p-3 whitespace-pre-wrap text-foreground">
        {card.definition}
      </div>
      {/* Actions */}
      <div className="flex items-center gap-0.5 px-2 border-l flex-shrink-0">
        <button
          onClick={handleStar}
          className="p-1.5 rounded-full hover:bg-muted transition-colors"
          title={localStarred ? "Bỏ gắn sao" : "Gắn sao"}
        >
          <Star
            size={16}
            className={
              localStarred
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground"
            }
          />
        </button>
        <button
          onClick={handleSpeak}
          className={cn(
            "p-1.5 rounded-full hover:bg-muted transition-colors",
            speaking && "text-blue-600 bg-blue-50 dark:bg-blue-950/40",
          )}
          title={speaking ? "Dừng phát" : "Phát âm"}
        >
          {speaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>
    </div>
  );
};

// ─── Main component ───
interface SegmentEndScreenProps {
  segmentCards: FlashcardWithAnswers[];
  wrongIds: Set<number>;
  correctAnswersCount: number;
  totalCards: number;
  onContinue: () => void;
  session: Session | null;
  isLastSegment: boolean;
}

const SegmentEndScreen = ({
  segmentCards,
  wrongIds,
  correctAnswersCount,
  totalCards,
  onContinue,
  session,
  isLastSegment,
}: SegmentEndScreenProps) => {
  const progressPercent =
    totalCards > 0
      ? Math.round((correctAnswersCount / totalCards) * 100)
      : 0;

  const wrongCount = segmentCards.filter((c) => wrongIds.has(c.id)).length;

  return (
    <div className="space-y-6 font-sans">
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
          {wrongCount > 0
            ? "Mạnh mẽ lên, bạn có thể thành công."
            : "Xuất sắc! Bạn đã hoàn thành đoạn này."}
        </h2>
        {wrongCount > 0 && (
          <p className="text-sm text-muted-foreground">
            Bạn đã trả lời sai {wrongCount} câu trong đoạn này. Hãy tiếp tục
            cố gắng!
          </p>
        )}
      </div>

      {/* Overall progress */}
      <Card className="p-5 space-y-3 border-2 rounded-2xl shadow-sm">
        <div className="text-sm text-muted-foreground font-bold">
          Tiến trình tổng thể: {progressPercent}%
        </div>
        <div className="relative h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full"
            style={{
              width: `${progressPercent}%`,
              transition: "width 0.5s ease",
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground font-semibold">
          <span>
            Đúng:{" "}
            <span className="text-emerald-600 dark:text-emerald-400">
              {correctAnswersCount}
            </span>
          </span>
          <span>Tổng số câu hỏi: {totalCards}</span>
        </div>
      </Card>

      {/* Card list */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-foreground">
          Thuật ngữ đã học trong vòng này ({segmentCards.length})
        </h3>
        {segmentCards.map((card, idx) => (
          <SegmentCardItem
            key={card.id ?? idx}
            card={card}
            isWrong={wrongIds.has(card.id)}
            session={session}
          />
        ))}
      </div>

      <Separator />

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground italic">
          Nhấn phím bất kỳ để tiếp tục
        </span>
        <Button
          onClick={onContinue}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl px-8 py-3 transition-all active:scale-[0.98]"
        >
          {isLastSegment ? "Xem kết quả cuối cùng" : "Tiếp tục"}
        </Button>
      </div>
    </div>
  );
};

export default SegmentEndScreen;
