"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RotateCcw, Undo2, Star, FileText, RotateCw } from "lucide-react";

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
import TestSettingsDialog from "../shared/test-settings-dialog";
import LearnProgressBar from "./learn-progress-bar";
import SegmentEndScreen from "./segment-end-screen";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@acme/ui/dialog";
import LearnModeDialog from "../study-set/learn-mode-dialog";

// Số câu hỏi mỗi đoạn (segment)
const SEGMENT_SIZE = 7;

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

const LearnMode = ({ session, goal, level, starredOnly }: { session: Session | null, goal?: "cramming" | "spaced_repetition", level?: number, starredOnly?: boolean }) => {
  const { id }: { id: string } = useParams();
  const router = useRouter();
  const { t } = useTranslation();

  const [flashcards] = api.studySet.learnCards.useSuspenseQuery(
    { id, goal, level, starredOnly },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  );

  const [studySet] = api.studySet.byId.useSuspenseQuery({ id });
  const { mutate: submitReview } = api.studyProgress.submitLearnReview.useMutation();

  const [config, setConfig] = useState<LearnConfig>(defaultConfig);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`quizlet_learn_config_${id}`);
      if (saved) {
        try {
          setConfig(JSON.parse(saved) as LearnConfig);
        } catch (e) {
          // ignore
        }
      }
    }
  }, [id]);

  // ─── Existing states ───
  const [sessionCards, setSessionCards] = useState<typeof flashcards>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [skippedCorrectCount, setSkippedCorrectCount] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string | undefined>();
  const [isCompleted, setIsCompleted] = useState(false);
  const [isTestSettingsOpen, setIsTestSettingsOpen] = useState(false);
  const [writtenInput, setWrittenInput] = useState("");
  const [isFlipped, setIsFlipped] = useState(false);

  // ─── NEW: Segment & Streak states ───
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [globalStreak, setGlobalStreak] = useState(0);
  const [currentSegment, setCurrentSegment] = useState(0);
  const [isSegmentLocked, setIsSegmentLocked] = useState(false);
  const [wrongQuestionsList, setWrongQuestionsList] = useState<typeof flashcards>([]);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);

  const [isRestartConfirmOpen, setIsRestartConfirmOpen] = useState(false);
  const [isLearnModalOpen, setIsLearnModalOpen] = useState(false);
  const [initialWrongIds, setInitialWrongIds] = useState<Set<number>>(new Set());
  const [showSegmentEnd, setShowSegmentEnd] = useState(false);
  const [segmentWrongIds, setSegmentWrongIds] = useState<Set<number>>(new Set());
  const [progressFlashRed, setProgressFlashRed] = useState(false);
  const [awaitingContinue, setAwaitingContinue] = useState(false);

  // ─── Computed values ───
  const activeMode = config.questionTypes.mc
    ? "mc"
    : config.questionTypes.written
      ? "written"
      : "flashcards";

  const totalSegments = Math.ceil(sessionCards.length / SEGMENT_SIZE);
  const segmentStart = currentSegment * SEGMENT_SIZE;
  const segmentEnd = Math.min(segmentStart + SEGMENT_SIZE, sessionCards.length);
  const isStreakActive = globalStreak >= 5 && !isSegmentLocked;

  // Card hiện tại phụ thuộc vào review mode
  const currentCard = isReviewMode
    ? wrongQuestionsList[reviewIndex]
    : sessionCards[currentIndex];

  const totalCards = sessionCards.length + skippedCorrectCount;
  const progress = totalCards > 0 ? ((currentIndex + skippedCorrectCount) / totalCards) * 100 : 0;

  const saveCardProgress = (cardId: number, status: "correct" | "incorrect") => {
    if (typeof window === "undefined") return;
    try {
      const key = `learn_session_state_${id}`;
      const savedStr = localStorage.getItem(key);
      const saved = savedStr ? JSON.parse(savedStr) : {};
      saved[cardId] = status;
      localStorage.setItem(key, JSON.stringify(saved));
    } catch (e) {}
  };

  // ─── Âm thanh trả lời đúng (Web Audio API - không cần file mp3) ───
  const playCorrectSound = useCallback(() => {
    if (!config.soundEffects) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {
      /* ignore audio errors */
    }
  }, [config.soundEffects]);

  // ─── Reset progress ───
  const handleResetProgress = () => {
    setIsRestartConfirmOpen(true);
  };

  const instantRestart = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(`learn_session_state_${id}`);
    }
    restart(config, true);
  };

  const confirmRestart = () => {
    setIsRestartConfirmOpen(false);
    setIsLearnModalOpen(true);
  };

  const startNewGoal = (newGoal: string) => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(`learn_session_state_${id}`);
    }
    router.replace(`/study-sets/${id}/learn?goal=${newGoal}`);
    window.location.reload(); // Refresh the page to clear all local runtime state
  };

  // ─── Initialize / restart ───
  const restart = (currentConfig = config, forceReset = false) => {
    let cards = [...flashcards];

    // Filter starred terms
    if (currentConfig.starredOnly) {
      cards = cards.filter((c) => c.starred);
    }

    // Shuffle cards
    if (currentConfig.shuffle) {
      cards.sort(() => Math.random() - 0.5);
    }

    // Fallback if no starred terms
    if (cards.length === 0 && currentConfig.starredOnly) {
      toast.info("Không có thuật ngữ nào được gắn sao! Đang học tất cả thuật ngữ.");
      cards = [...flashcards];
      if (currentConfig.shuffle) {
        cards.sort(() => Math.random() - 0.5);
      }

      const nextConfig = { ...currentConfig, starredOnly: false };
      if (typeof window !== "undefined") {
        localStorage.setItem(`quizlet_learn_config_${id}`, JSON.stringify(nextConfig));
      }
      setConfig(nextConfig);
    }

    // -- NEW: Load session state and filter --
    let savedProgress: Record<string, "correct" | "incorrect"> = {};
    if (!forceReset && typeof window !== "undefined") {
      try {
        const savedStr = localStorage.getItem(`learn_session_state_${id}`);
        if (savedStr) {
          savedProgress = JSON.parse(savedStr);
        }
      } catch (e) {}
    }

    const incorrectCards: typeof cards = [];
    const unseenCards: typeof cards = [];
    let correctCountLoaded = 0;
    const loadedWrongIds = new Set<number>();

    for (const c of cards) {
      const status = savedProgress[c.id];
      if (status === "correct") {
        correctCountLoaded++;
      } else if (status === "incorrect") {
        incorrectCards.push(c);
        loadedWrongIds.add(c.id);
      } else {
        unseenCards.push(c);
      }
    }
    
    setInitialWrongIds(loadedWrongIds);

    cards = [...incorrectCards, ...unseenCards];

    // Nếu người dùng đã học xong toàn bộ thẻ trong session này
    if (cards.length === 0 && correctCountLoaded > 0) {
      setSessionCards([]);
      setIsCompleted(true);
      setCorrectCount(correctCountLoaded);
      setSkippedCorrectCount(correctCountLoaded);
      return;
    }

    // Tự động tạo phương án trắc nghiệm phù hợp với hướng câu trả lời ở client
    cards = cards.map((card) => {
      // Kiểm tra xem thẻ ghi nhớ có phải là trắc nghiệm tự soạn (dạng A. B. C. D. trong term) hay không
      const extractMultipleChoice = (text: string) => {
        const regexA = /(?:^|\n)\s*([A|a][\.\)\-:\s]+[^\n]+)/;
        const regexB = /(?:^|\n)\s*([B|b][\.\)\-:\s]+[^\n]+)/;
        const regexC = /(?:^|\n)\s*([C|c][\.\)\-:\s]+[^\n]+)/;
        const regexD = /(?:^|\n)\s*([D|d][\.\)\-:\s]+[^\n]+)/;

        const a = text.match(regexA)?.[1]?.trim();
        const b = text.match(regexB)?.[1]?.trim();
        const c = text.match(regexC)?.[1]?.trim();
        const d = text.match(regexD)?.[1]?.trim();

        const options = [a, b, c, d].filter(Boolean) as string[];
        if (options.length >= 2) {
          return options;
        }
        return null;
      };

      const cleanText = (str: string) => {
        return str
          .replace(/^[a-zA-Z][.\)\-:\s]+/, "")
          .trim()
          .toLowerCase();
      };

      const choices = extractMultipleChoice(card.term);
      let answers: string[] = [];
      let updatedDefinition = card.definition;

      if (choices) {
        answers = choices;
        let matchedChoice = choices.find(
          (choice) => cleanText(choice) === cleanText(card.definition)
        );

        if (!matchedChoice) {
          matchedChoice = choices.find((choice) => {
            const cleanC = cleanText(choice);
            const cleanD = cleanText(card.definition);
            return cleanC.includes(cleanD) || cleanD.includes(cleanC);
          });
        }

        if (!matchedChoice) {
          const firstLetter = card.definition.trim().charAt(0).toUpperCase();
          if (["A", "B", "C", "D"].includes(firstLetter)) {
            matchedChoice = choices.find((choice) =>
              choice.trim().toUpperCase().startsWith(firstLetter)
            );
          }
        }

        if (matchedChoice) {
          updatedDefinition = matchedChoice;
        }
      } else {
        // Trắc nghiệm tự tạo ở client dựa trên config.answerWith
        const isAnswerWithTerm = currentConfig.answerWith === "term";
        const correctAnswer = isAnswerWithTerm ? card.term : card.definition;

        const falseAnswers = flashcards
          .filter((c) => c.id !== card.id)
          .map((c) => (isAnswerWithTerm ? c.term : c.definition))
          .filter((val) => val && val.trim() !== "")
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);

        answers = [...falseAnswers, correctAnswer].sort(
          () => 0.5 - Math.random()
        );
      }

      return {
        ...card,
        definition: updatedDefinition,
        answers,
      };
    });

    setSessionCards(cards);
    setCurrentIndex(0);
    setCorrectCount(correctCountLoaded);
    setSkippedCorrectCount(correctCountLoaded);
    setUserAnswer(undefined);
    setIsCompleted(false);
    setWrittenInput("");
    setIsFlipped(false);

    // Reset segment states
    setCorrectAnswersCount(0);
    setGlobalStreak(0);
    setCurrentSegment(0);
    setIsSegmentLocked(false);
    setWrongQuestionsList([]);
    setIsReviewMode(false);
    setReviewIndex(0);
    setShowSegmentEnd(false);
    setSegmentWrongIds(new Set());
    setAwaitingContinue(false);
    setProgressFlashRed(false);
  };

  useEffect(() => {
    if (flashcards.length > 0) {
      restart(config);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flashcards, config.shuffle, config.starredOnly, config.answerWith]);



  // ─── Refs cho keyboard handler (tránh stale closures) ───
  const handlersRef = useRef({
    continueToNextSegment: () => {},
    continueAfterWrongMC: () => {},
    continueWritten: () => {},
  });

  // ─── checkSegmentEnd helper ───
  function checkSegmentEnd(
    nextIndex: number,
    streak: number,
    locked: boolean,
    wrongList: typeof flashcards
  ) {
    const segEnd = Math.min((currentSegment + 1) * SEGMENT_SIZE, sessionCards.length);

    if (nextIndex >= sessionCards.length) {
      // Hết tất cả cards
      if (wrongList.length > 0) {
        setIsReviewMode(true);
        setReviewIndex(0);
      } else {
        setShowSegmentEnd(true);
      }
    } else if (nextIndex >= segEnd) {
      // Hết segment hiện tại
      if (!locked && streak >= 5) {
        // Bypass - tiếp tục liền mạch sang segment tiếp
        setCurrentSegment((prev) => prev + 1);
        setIsSegmentLocked(false);
        setWrongQuestionsList([]);
        setSegmentWrongIds(new Set());
      } else if (wrongList.length > 0) {
        // Vào review mode
        setIsReviewMode(true);
        setReviewIndex(0);
      } else {
        // Không có câu sai nhưng streak < 5 → hiện end screen
        setShowSegmentEnd(true);
      }
    }
    // else: tiếp tục bình thường (câu tiếp theo trong segment)
  }

  // ─── MC: handleAnswerSelect (segment + streak + review) ───
  const handleAnswerSelect = (idx: number, _event: React.MouseEvent<HTMLDivElement>) => {
    if (userAnswer || awaitingContinue) return;

    const card = isReviewMode
      ? wrongQuestionsList[reviewIndex]
      : sessionCards[currentIndex];
    if (!card) return;

    const selected = (card.answers || [])[idx];
    if (!selected) return;
    setUserAnswer(selected);

    const isCorrect = selected === card.definition;

    if (isReviewMode) {
      // ─── REVIEW MODE ───
      if (isCorrect) {
        saveCardProgress(card.id, "correct");
        playCorrectSound();
        setCorrectAnswersCount((prev) => prev + 1);
        // Loại bỏ câu đúng khỏi danh sách ôn tập
        const newList = wrongQuestionsList.filter((_, i) => i !== reviewIndex);

        setTimeout(() => {
          setUserAnswer(undefined);
          setWrongQuestionsList(newList);
          if (newList.length === 0) {
            setIsReviewMode(false);
            setShowSegmentEnd(true);
          } else {
            setReviewIndex((prev) => (prev >= newList.length ? 0 : prev));
          }
        }, 800);
      } else {
        // Sai trong review → chờ user bấm "Tiếp tục", rồi hiện lại câu này
        setAwaitingContinue(true);
      }
    } else {
      // ─── NORMAL MODE (lần thử đầu) ───
      if (isCorrect) {
        saveCardProgress(card.id, "correct");
        submitReview({ flashcardId: card.id, grade: 4 });
        playCorrectSound();
        setCorrectAnswersCount((prev) => prev + 1);
        setCorrectCount((prev) => prev + 1);
        const newStreak = globalStreak + 1;
        setGlobalStreak(newStreak);

        setTimeout(() => {
          setUserAnswer(undefined);
          const nextIndex = currentIndex + 1;
          setCurrentIndex(nextIndex);
          checkSegmentEnd(nextIndex, newStreak, isSegmentLocked, wrongQuestionsList);
        }, 800);
      } else {
        saveCardProgress(card.id, "incorrect");
        submitReview({ flashcardId: card.id, grade: 1 });
        // Sai → theo dõi câu sai, reset streak
        setGlobalStreak(0);
        setIsSegmentLocked(true);
        const newWrongList = [...wrongQuestionsList, card];
        setWrongQuestionsList(newWrongList);
        setSegmentWrongIds((prev) => new Set([...prev, card.id]));

        // Flash đỏ thanh progress bar
        setProgressFlashRed(true);
        setTimeout(() => setProgressFlashRed(false), 500);

        // Chờ user bấm "Tiếp tục"
        setAwaitingContinue(true);
      }
    }
  };

  // ─── MC: Continue sau khi trả lời sai ───
  function handleContinueAfterWrongMC() {
    setUserAnswer(undefined);
    setAwaitingContinue(false);

    if (isReviewMode) {
      // Giữ nguyên câu hiện tại (user sẽ thử lại)
      return;
    }

    // Advance tới câu tiếp
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    checkSegmentEnd(nextIndex, globalStreak, isSegmentLocked, wrongQuestionsList);
  }

  // ─── Chuyển sang segment tiếp theo (từ end screen) ───
  function handleContinueToNextSegment() {
    setShowSegmentEnd(false);

    const nextSegStart = (currentSegment + 1) * SEGMENT_SIZE;

    if (nextSegStart >= sessionCards.length) {
      // Hết tất cả segment → hiện final completion
      setIsCompleted(true);
      return;
    }

    setCurrentSegment((prev) => prev + 1);
    setCurrentIndex(nextSegStart);

    // Reset states cho segment mới (giữ correctAnswersCount & globalStreak)
    setIsSegmentLocked(false);
    setWrongQuestionsList([]);
    setIsReviewMode(false);
    setReviewIndex(0);
    setSegmentWrongIds(new Set());
    setAwaitingContinue(false);
  }

  // ─── Cập nhật refs cho keyboard handler ───
  handlersRef.current.continueToNextSegment = handleContinueToNextSegment;
  handlersRef.current.continueAfterWrongMC = handleContinueAfterWrongMC;

  // ─── Written/Flashcard: handleContinue (giữ nguyên logic cũ) ───
  function handleContinue() {
    setUserAnswer(undefined);
    setWrittenInput("");
    if (currentIndex + 1 >= sessionCards.length) {
      setIsCompleted(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }

  handlersRef.current.continueWritten = handleContinue;

  // ─── Keyboard handler (hợp nhất tất cả trường hợp) ───
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Không xử lý khi đang focus input
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      // 1. Segment end screen → tiếp tục
      if (showSegmentEnd) {
        e.preventDefault();
        handlersRef.current.continueToNextSegment();
        return;
      }

      // 2. Chờ bấm tiếp tục sau khi sai MC → tiếp tục
      if (awaitingContinue) {
        e.preventDefault();
        handlersRef.current.continueAfterWrongMC();
        return;
      }

      // 3. Written mode: bấm phím khi đã trả lời sai → tiếp tục
      if (activeMode === "written" && userAnswer !== undefined) {
        const card = sessionCards[currentIndex];
        if (card) {
          const isCorrect =
            (userAnswer || "").trim().toLowerCase() ===
            (card.definition || "").trim().toLowerCase();
          if (!isCorrect) {
            e.preventDefault();
            handlersRef.current.continueWritten();
          }
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [showSegmentEnd, awaitingContinue, activeMode, userAnswer, currentIndex, sessionCards]);

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

  // ─── Written mode handlers ───
  const handleWrittenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userAnswer || !writtenInput.trim()) return;
    const card = sessionCards[currentIndex];
    if (!card) return;

    const trimmedInput = writtenInput.trim();
    setUserAnswer(trimmedInput);

    const isCorrect = trimmedInput.toLowerCase() === card.definition.toLowerCase();
    saveCardProgress(card.id, isCorrect ? "correct" : "incorrect");
    submitReview({ flashcardId: card.id, grade: isCorrect ? 4 : 1 });

    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
      setCorrectAnswersCount((prev) => prev + 1);
      setTimeout(() => {
        handleContinue();
      }, 1000);
    }
  };

  const handleDontKnow = () => {
    if (userAnswer) return;
    const card = sessionCards[currentIndex];
    if (card) {
      saveCardProgress(card.id, "incorrect");
      submitReview({ flashcardId: card.id, grade: 1 });
    }
    setUserAnswer("Đã bỏ qua");
  };

  const handleOverrideCorrect = () => {
    const card = sessionCards[currentIndex];
    if (card) {
      saveCardProgress(card.id, "correct");
      submitReview({ flashcardId: card.id, grade: 4 });
    }
    setCorrectCount((prev) => prev + 1);
    setCorrectAnswersCount((prev) => prev + 1);
    handleContinue();
  };

  // ─── Flashcard mode handlers ───
  const handleFlashcardFeedback = (know: boolean) => {
    const card = sessionCards[currentIndex];
    if (card) {
      saveCardProgress(card.id, know ? "correct" : "incorrect");
      submitReview({ flashcardId: card.id, grade: know ? 4 : 1 });
    }
    
    if (know) {
      setCorrectCount((prev) => prev + 1);
      setCorrectAnswersCount((prev) => prev + 1);
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

  // ─── Loading state ───
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-muted-foreground font-bold font-sans">
        Đang tải chế độ học...
      </div>
    );
  }

  // ─── Render ───
  return (
    <div className="grid gap-6 md:grid-cols-4 select-none pb-12">
      {/* Main column */}
      <div className="md:col-span-3 space-y-4">
        {/* Progress bar (phân đoạn) */}
        <LearnProgressBar
          correctAnswersCount={correctAnswersCount}
          totalCards={sessionCards.length}
          totalSegments={totalSegments}
          isFlashRed={progressFlashRed}
          isStreakActive={isStreakActive}
        />

        {/* ─── Segment End Screen ─── */}
        {showSegmentEnd && !isCompleted && (
          <SegmentEndScreen
            segmentCards={sessionCards.slice(segmentStart, segmentEnd)}
            wrongIds={segmentWrongIds}
            correctAnswersCount={correctAnswersCount}
            totalCards={sessionCards.length}
            onContinue={handleContinueToNextSegment}
            session={session}
            isLastSegment={(currentSegment + 1) * SEGMENT_SIZE >= sessionCards.length}
          />
        )}

        {/* ─── Question Cards ─── */}
        {!showSegmentEnd && currentCard && !isCompleted && (
          <>
            {activeMode === "mc" && (
              <>
                <MultipleChoiceCard
                  term={config.answerWith === "term" ? currentCard.definition : currentCard.term}
                  answers={currentCard.answers}
                  index={isReviewMode ? reviewIndex : currentIndex}
                  callback={handleAnswerSelect}
                  definition={config.answerWith === "term" ? currentCard.term : currentCard.definition}
                  userAnswer={userAnswer}
                  isReviewMode={isReviewMode || initialWrongIds.has(currentCard.id)}
                />

                {/* Continue bar sau khi trả lời sai */}
                {awaitingContinue && (
                  <div className="flex items-center justify-between bg-card border-2 rounded-2xl p-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <span className="text-sm text-muted-foreground">
                      Nhấp vào câu trả lời đúng hoặc nhấn phím bất kỳ để tiếp tục
                    </span>
                    <Button
                      onClick={handleContinueAfterWrongMC}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6 transition-all active:scale-[0.98]"
                    >
                      Tiếp tục
                    </Button>
                  </div>
                )}
              </>
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

        {/* ─── Final Completion Screen ─── */}
        {isCompleted && (
          <>
            <div className="mb-6 text-center space-y-2 font-sans">
              <div className="text-4xl">🎉</div>
              <div className="text-3xl font-extrabold tracking-tight text-foreground">
                Chúc mừng! Bạn đã hoàn thành lượt học này.
              </div>
              <p className="text-muted-foreground text-sm">
                Bạn đã đi qua toàn bộ các thẻ ghi nhớ. Tiếp theo bạn muốn làm gì?
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 max-w-2xl mx-auto mb-8 font-sans">
              {/* Làm bài kiểm tra */}
              <button
                onClick={() => setIsTestSettingsOpen(true)}
                className="flex flex-col items-center justify-center p-6 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 border-2 border-blue-200 dark:border-blue-900 rounded-2xl shadow-sm hover:shadow transition-all active:scale-[0.98] text-center space-y-3 group"
              >
                <div className="bg-blue-600 text-white p-3 rounded-xl group-hover:scale-110 transition-all">
                  <FileText size={24} />
                </div>
                <div className="space-y-1">
                  <span className="font-extrabold text-base text-blue-700 dark:text-blue-400 block">
                    Làm bài kiểm tra
                  </span>
                  <span className="text-xs text-muted-foreground block leading-normal">
                    Đánh giá kiến thức với các dạng câu hỏi đa dạng
                  </span>
                </div>
              </button>

              {/* Ôn tập thêm */}
              <button
                onClick={instantRestart}
                className="flex flex-col items-center justify-center p-6 bg-green-50 hover:bg-green-100 dark:bg-green-950/40 dark:hover:bg-green-900/40 border-2 border-green-200 dark:border-green-900 rounded-2xl shadow-sm hover:shadow transition-all active:scale-[0.98] text-center space-y-3 group"
              >
                <div className="bg-green-600 text-white p-3 rounded-xl group-hover:scale-110 transition-all">
                  <RotateCw size={24} />
                </div>
                <div className="space-y-1">
                  <span className="font-extrabold text-base text-green-700 dark:text-green-400 block">
                    Ôn tập thêm
                  </span>
                  <span className="text-xs text-muted-foreground block leading-normal">
                    Tiếp tục ôn luyện lại bộ thẻ này một lần nữa
                  </span>
                </div>
              </button>

              {/* Học lại từ đầu */}
              <button
                onClick={handleResetProgress}
                className="flex flex-col items-center justify-center p-6 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/40 dark:hover:bg-orange-900/40 border-2 border-orange-200 dark:border-orange-900 rounded-2xl shadow-sm hover:shadow transition-all active:scale-[0.98] text-center space-y-3 group"
              >
                <div className="bg-orange-600 text-white p-3 rounded-xl group-hover:scale-110 transition-all">
                  <RotateCcw size={24} />
                </div>
                <div className="space-y-1">
                  <span className="font-extrabold text-base text-orange-700 dark:text-orange-400 block">
                    Học lại từ đầu
                  </span>
                  <span className="text-xs text-muted-foreground block leading-normal">
                    Xóa sạch tiến độ học tập và bắt đầu lại từ 0%
                  </span>
                </div>
              </button>
            </div>

            <div className="flex justify-center mb-8 font-sans">
              <Button
                variant="outline"
                onClick={backToStudySet}
                className="gap-2 font-bold rounded-xl active:scale-[0.98] transition-all"
              >
                <Undo2 size={16} /> Quay lại học phần
              </Button>
            </div>

            <Separator className="my-8" />
            <div className="font-sans">
              <span className="mb-4 inline-block text-xl font-bold tracking-tight">
                Các thuật ngữ đã học trong vòng này ({sessionCards.length})
              </span>
              <div className="flex flex-col gap-4">
                {sessionCards.map((flashcard, index) => (
                  <FlashcardCard
                    key={index}
                    flashcard={{ ...flashcard, progress: null } as any}
                    session={session}
                  />
                ))}
              </div>
            </div>

            <TestSettingsDialog
              open={isTestSettingsOpen}
              onOpenChange={setIsTestSettingsOpen}
              studySetId={id}
              studySetTitle={studySet.title}
              totalCards={studySet.flashcards.length}
            />
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
              onSave={setConfig}
              onRestart={() => setIsRestartConfirmOpen(true)}
              hasStarredTerms={flashcards.some((c) => c.starred)}
            />
          </div>
        </div>
      </div>

      <Dialog open={isRestartConfirmOpen} onOpenChange={setIsRestartConfirmOpen}>
        <DialogContent className="max-w-md w-full p-0 overflow-hidden flex flex-col rounded-2xl border bg-card">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-2xl font-extrabold tracking-tight">
              Khởi động lại Học?
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-2">
            <p className="text-sm text-foreground/80 leading-relaxed mb-6">
              Chế độ Học căn cứ vào hành vi học tập trước đây của bạn để xác định nội dung nào là thách thức nhất đối với bạn, qua đó giúp các phiên học đúng trọng tâm hơn. Khởi động lại chế độ Học sẽ thiết lập lại mục tiêu học tập cũng như tiến độ của bạn. Điều đó có nghĩa là bạn sẽ thấy tất cả các thuật ngữ như trước, khởi động lại từ đầu.
            </p>
            <div className="flex items-center justify-end gap-3 mt-4">
              <Button 
                variant="ghost" 
                onClick={() => setIsRestartConfirmOpen(false)}
                className="font-bold text-foreground bg-muted hover:bg-muted/80 rounded-xl px-5 h-12"
              >
                Không, tiếp tục
              </Button>
              <Button 
                onClick={confirmRestart}
                className="font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl px-5 h-12"
              >
                Có, khởi động lại chế độ Học
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <LearnModeDialog 
        open={isLearnModalOpen} 
        onOpenChange={setIsLearnModalOpen} 
        studySetId={id} 
        onGoalSelected={startNewGoal}
      />
    </div>
  );
};

export default LearnMode;
