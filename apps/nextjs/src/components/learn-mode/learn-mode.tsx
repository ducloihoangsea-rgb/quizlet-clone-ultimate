"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RotateCcw, Undo2, Star } from "lucide-react";

import type { Session } from "@acme/auth";
import { Separator } from "@acme/ui/separator";
import { Button } from "@acme/ui/button";
import { Card, CardContent } from "@acme/ui/card";
import { Switch } from "@acme/ui/switch";
import { toast } from "@acme/ui/toast";

import { api } from "~/trpc/react";
import FlashcardCard from "../shared/flashcard-card";
import GameResult from "../shared/game-result";
import MultipleChoiceCard from "../shared/multiple-choice-card";
import WrittenCard from "../shared/written-card";
import LearnOptionsDialog, { type LearnConfig } from "./learn-options-dialog";
import { useTranslation } from "~/contexts/i18n-context";

const defaultConfig: LearnConfig = {
  shuffle: false,
  starredOnly: false,
  soundEffects: true,
  questionTypes: {
    mc: true,
    written: false,
    flashcards: false,
  },
  answerWith: "definition",
  showImages: {
    question: false,
    answer: false,
  },
  gradingLevel: "strict",
  requireCorrect: false,
  oneAnswerSuffices: true,
  textToSpeech: false,
};

const LearnMode = ({ session }: { session: Session | null }) => {
  const { id }: { id: string } = useParams();
  const router = useRouter();
  const { t } = useTranslation();

  const [flashcards] = api.studySet.learnCards.useSuspenseQuery(
    { id },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  );

  // Load config from localStorage
  const [config, setConfig] = useState<LearnConfig>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`quizlet_learn_config_${id}`);
      if (saved) {
        try {
          return JSON.parse(saved) as LearnConfig;
        } catch (e) {
          return defaultConfig;
        }
      }
    }
    return defaultConfig;
  });

  const [sessionCards, setSessionCards] = useState<typeof flashcards>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string | undefined>();
  const [isCompleted, setIsCompleted] = useState(false);

  // Written Mode state
  const [writtenInput, setWrittenInput] = useState("");

  // Flashcards Mode state
  const [isFlipped, setIsFlipped] = useState(false);

  // Initialize session cards
  const restart = () => {
    let cards = [...flashcards];

    // Filter starred terms
    if (config.starredOnly) {
      cards = cards.filter((c) => c.starred);
    }

    // Shuffle cards
    if (config.shuffle) {
      cards.sort(() => Math.random() - 0.5);
    }

    // Fallback if no starred terms
    if (cards.length === 0 && config.starredOnly) {
      toast.info("Không có thuật ngữ nào được gắn sao! Đang học tất cả thuật ngữ.");
      cards = [...flashcards];
      if (config.shuffle) {
        cards.sort(() => Math.random() - 0.5);
      }
      setConfig((prev) => {
        const next = { ...prev, starredOnly: false };
        localStorage.setItem(`quizlet_learn_config_${id}`, JSON.stringify(next));
        return next;
      });
    }

    setSessionCards(cards);
    setCurrentIndex(0);
    setCorrectCount(0);
    setUserAnswer(undefined);
    setIsCompleted(false);
    setWrittenInput("");
    setIsFlipped(false);
  };

  useEffect(() => {
    if (flashcards.length > 0) {
      restart();
    }
  }, [flashcards, config.shuffle, config.starredOnly]);

  // Cập nhật tiến độ học tập thực tế vào localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && currentIndex > 0) {
      const currentLearned = Number(localStorage.getItem(`study_progress_learned_${id}`) ?? 0);
      if (currentIndex > currentLearned) {
        localStorage.setItem(`study_progress_learned_${id}`, String(currentIndex));
      }
    }
  }, [currentIndex, id]);

  useEffect(() => {
    if (typeof window !== "undefined" && isCompleted && sessionCards.length > 0) {
      localStorage.setItem(`study_progress_learned_${id}`, String(sessionCards.length));
    }
  }, [isCompleted, sessionCards.length, id]);

  // Bắt phím bất kỳ để tiếp tục trong chế độ tự luận khi trả lời sai hoặc bỏ qua
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (activeMode === "written" && userAnswer !== undefined) {
        const card = sessionCards[currentIndex];
        if (card) {
          const isCorrect = userAnswer.trim().toLowerCase() === card.definition.trim().toLowerCase();
          if (!isCorrect) {
            e.preventDefault();
            handleContinue();
          }
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [activeMode, userAnswer, currentIndex, sessionCards]);

  const saveConfig = (newConfig: LearnConfig) => {
    setConfig(newConfig);
    if (typeof window !== "undefined") {
      localStorage.setItem(`quizlet_learn_config_${id}`, JSON.stringify(newConfig));
    }
    toast.success("Đã lưu các tùy chọn!");
  };

  const handleToggleQuestionType = (type: "mc" | "written" | "flashcards", val: boolean) => {
    const nextQuestionTypes = { ...config.questionTypes, [type]: val };
    
    // Ensure at least one type is active
    if (!nextQuestionTypes.mc && !nextQuestionTypes.written && !nextQuestionTypes.flashcards) {
      nextQuestionTypes.mc = true;
    }

    const nextConfig = { ...config, questionTypes: nextQuestionTypes };
    setConfig(nextConfig);
    if (typeof window !== "undefined") {
      localStorage.setItem(`quizlet_learn_config_${id}`, JSON.stringify(nextConfig));
    }
  };

  const handleAnswerSelect = (idx: number, event: React.MouseEvent<HTMLDivElement>) => {
    if (userAnswer) return;
    const card = sessionCards[currentIndex];
    if (!card) return;

    const button = event.currentTarget;
    const selected = card.answers[idx];
    setUserAnswer(selected);

    const isCorrect = selected === card.definition;

    if (isCorrect) {
      button.style.background = "#bbf7d0";
      button.style.borderColor = "#16a34a";
      setCorrectCount((prev) => prev + 1);
    } else {
      button.style.background = "#fda4af";
      button.style.borderColor = "#e11d48";
    }

    setTimeout(() => {
      button.style.background = "hsla(var(--background))";
      button.style.borderColor = "hsla(var(--input))";
      
      setUserAnswer(undefined);
      if (currentIndex + 1 >= sessionCards.length) {
        setIsCompleted(true);
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    }, 1200);
  };

  function handleContinue() {
    setUserAnswer(undefined);
    setWrittenInput("");
    if (currentIndex + 1 >= sessionCards.length) {
      setIsCompleted(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }

  const handleWrittenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userAnswer || !writtenInput.trim()) return;
    const card = sessionCards[currentIndex];
    if (!card) return;

    const trimmedInput = writtenInput.trim();
    setUserAnswer(trimmedInput);

    const isCorrect = trimmedInput.toLowerCase() === card.definition.toLowerCase();

    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
      setTimeout(() => {
        handleContinue();
      }, 1000);
    }
  };

  const handleDontKnow = () => {
    if (userAnswer) return;
    setUserAnswer("Đã bỏ qua");
  };

  const handleOverrideCorrect = () => {
    setCorrectCount((prev) => prev + 1);
    handleContinue();
  };

  const handleFlashcardFeedback = (know: boolean) => {
    if (know) {
      setCorrectCount((prev) => prev + 1);
    }
    setIsFlipped(false);
    if (currentIndex + 1 >= sessionCards.length) {
      setIsCompleted(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const backToStudySet = () => {
    router.push(`/study-sets/${id}`);
  };

  const currentCard = sessionCards[currentIndex];
  const progress = sessionCards.length > 0 ? (currentIndex / sessionCards.length) * 100 : 0;

  // Determine active mode based on config priority: MC -> Written -> Flashcards
  const activeMode = config.questionTypes.mc 
    ? "mc" 
    : config.questionTypes.written 
      ? "written" 
      : "flashcards";

  return (
    <div className="grid gap-6 md:grid-cols-4 select-none pb-12">
      {/* Main column */}
      <div className="md:col-span-3 space-y-4">
        {/* Progress bar */}
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 mb-6">
          <div 
            className="h-full bg-[#10b981] rounded-full transition-all duration-500" 
            style={{ width: `${progress}%` }}
          />
        </div>

        {currentCard && !isCompleted && (
          <>
            {activeMode === "mc" && (
              <MultipleChoiceCard
                term={config.answerWith === "term" ? currentCard.definition : currentCard.term}
                answers={currentCard.answers}
                index={currentIndex}
                callback={handleAnswerSelect}
                definition={config.answerWith === "term" ? currentCard.term : currentCard.definition}
                userAnswer={userAnswer}
              />
            )}

            {activeMode === "written" && (
              <WrittenCard
                term={config.answerWith === "term" ? currentCard.definition : currentCard.term}
                definition={config.answerWith === "term" ? currentCard.term : currentCard.definition}
                userAnswer={userAnswer}
                value={writtenInput}
                onChange={(e) => setWrittenInput(e.target.value)}
                onDontKnow={handleDontKnow}
                onSubmit={handleWrittenSubmit}
                onOverrideCorrect={handleOverrideCorrect}
                onContinue={handleContinue}
              />
            )}

            {activeMode === "flashcards" && (
              <div className="space-y-6">
                <Card 
                  onClick={() => setIsFlipped(!isFlipped)} 
                  className="cursor-pointer min-h-[320px] flex items-center justify-center p-6 bg-card border-2 hover:shadow-md transition-all rounded-2xl relative overflow-hidden"
                >
                  <div className="text-center space-y-4 w-full">
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      {isFlipped ? "Định nghĩa" : "Thuật ngữ"}
                    </div>
                    <div className="text-2xl sm:text-3xl whitespace-pre-wrap font-sans leading-relaxed px-4 max-h-[220px] overflow-y-auto">
                      {isFlipped 
                        ? (config.answerWith === "term" ? currentCard.term : currentCard.definition) 
                        : (config.answerWith === "term" ? currentCard.definition : currentCard.term)
                      }
                    </div>
                    <div className="text-xs text-muted-foreground italic">
                      (Nhấp vào bất kỳ đâu trên thẻ để lật)
                    </div>
                  </div>
                </Card>

                <div className="flex gap-4">
                  <button
                    onClick={() => handleFlashcardFeedback(false)}
                    className="flex-1 py-3 bg-red-100 hover:bg-red-200 dark:bg-red-950/40 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-extrabold text-sm rounded-xl transition-all border border-red-200 dark:border-red-900/50"
                  >
                    Vẫn đang học
                  </button>
                  <button
                    onClick={() => handleFlashcardFeedback(true)}
                    className="flex-1 py-3 bg-green-100 hover:bg-green-200 dark:bg-green-950/40 dark:hover:bg-green-900/40 text-green-600 dark:text-green-400 font-extrabold text-sm rounded-xl transition-all border border-green-200 dark:border-green-900/50"
                  >
                    Đã hiểu
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {isCompleted && (
          <>
            <div className="mb-6 text-2xl font-extrabold tracking-tight">Chúc mừng! Bạn đã hoàn thành lượt học này.</div>
            <GameResult
              hard={sessionCards.length - correctCount}
              cardCount={sessionCards.length}
              firstButton={{
                text: "Học lại vòng mới",
                description: "Khởi động lại vòng học với bộ thẻ này.",
                Icon: <RotateCcw size={20} />,
                callback: restart,
              }}
              secondButton={{
                text: "Quay lại học phần",
                description: "Trở lại trang chi tiết học phần.",
                Icon: <Undo2 size={20} />,
                callback: backToStudySet,
              }}
            />
            <Separator className="my-8" />
            <div>
              <span className="mb-4 inline-block text-xl font-bold tracking-tight">
                Các thuật ngữ đã học trong vòng này ({sessionCards.length})
              </span>
              <div className="flex flex-col gap-4">
                {sessionCards.map((flashcard, index) => (
                  <FlashcardCard
                    key={index}
                    flashcard={flashcard}
                    session={session}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Options Sidebar */}
      <div className="space-y-6">
        <div className="border rounded-2xl p-5 bg-card space-y-4 shadow-sm">
          <h3 className="font-extrabold text-xs uppercase text-muted-foreground tracking-widest border-b pb-2">
            {t("questionType")}
          </h3>
          <div className="space-y-4 py-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-foreground">{t("multipleChoice")}</span>
              <Switch
                checked={config.questionTypes.mc}
                onCheckedChange={(val) => handleToggleQuestionType("mc", val)}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-foreground">{t("written")}</span>
              <Switch
                checked={config.questionTypes.written}
                onCheckedChange={(val) => handleToggleQuestionType("written", val)}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-foreground">{t("flashcards")}</span>
              <Switch
                checked={config.questionTypes.flashcards}
                onCheckedChange={(val) => handleToggleQuestionType("flashcards", val)}
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <LearnOptionsDialog
              config={config}
              onSave={saveConfig}
              onRestart={restart}
              hasStarredTerms={flashcards.some((c) => c.starred)}
              triggerElement={
                <button className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-extrabold text-sm rounded-xl transition-all border border-blue-100 dark:border-blue-900/50">
                  Xem tất cả các tùy chọn
                </button>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnMode;
