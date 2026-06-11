"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Settings, FileText, Check, X, RotateCcw, ArrowRight } from "lucide-react";

import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import { Card, CardContent } from "@acme/ui/card";
import { toast } from "@acme/ui/toast";

import { api } from "~/trpc/react";
import TestSettingsDialog from "../shared/test-settings-dialog";

// Hàm xáo trộn mảng ở client để tối ưu tốc độ và giảm tải cho server
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const TestMode = () => {
  const { id }: { id: string } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const limitParam = searchParams.get("limit");
  const typesParam = searchParams.get("types");
  const answerWithParam = searchParams.get("answerWith");

  const queryInput = {
    id,
    limit: limitParam ? parseInt(limitParam) : undefined,
    types: typesParam ? (typesParam.split(",") as any[]) : undefined,
    answerWith: answerWithParam ? (answerWithParam as any) : undefined,
  };

  const [test] = api.studySet.testCards.useSuspenseQuery(queryInput);
  const [studySet] = api.studySet.byId.useSuspenseQuery({ id });

  // === STATE MANAGEMENT ===
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Danh sách phẳng các câu hỏi để thuận tiện cuộn dọc và auto-scroll
  const [questions, setQuestions] = useState<any[]>([]);
  const [originalQuestions, setOriginalQuestions] = useState<any[]>([]);
  
  // Lưu câu trả lời của người dùng: { [questionIndex]: answerValue }
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  
  // Lưu nội dung nhập của câu hỏi tự luận để tránh submit ngay khi gõ
  const [writtenInputs, setWrittenInputs] = useState<Record<number, string>>({});

  const [isTestFinished, setIsTestFinished] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [timeStart, setTimeStart] = useState<number>(0);
  const [testResults, setTestResults] = useState({
    correct: 0,
    incorrect: 0,
    percentage: 0,
    timeTaken: "0s",
  });

  // Khởi tạo danh sách phẳng khi nhận dữ liệu từ API
  useEffect(() => {
    if (test) {
      const flat: any[] = [];
      if (test.trueOrFalse) {
        test.trueOrFalse.forEach((q) => flat.push({ ...q, type: "trueOrFalse" }));
      }
      if (test.multipleChoice) {
        test.multipleChoice.forEach((q) => flat.push({ ...q, type: "multipleChoice" }));
      }
      if (test.written) {
        test.written.forEach((q) => flat.push({ ...q, type: "written" }));
      }
      
      setQuestions(flat);
      setOriginalQuestions(flat);
      setUserAnswers({});
      setWrittenInputs({});
      setIsTestFinished(false);
      setTimeStart(Date.now());
    }
  }, [test]);

  // Helper kiểm tra câu trả lời có đúng hay không
  const checkAnswerIsCorrect = (q: any, uAns: string | undefined) => {
    if (uAns === undefined) return false;
    if (q.type === "multipleChoice") {
      return uAns === q.definition;
    } else if (q.type === "trueOrFalse") {
      const correctAns = q.answer === q.definition ? "true" : "false";
      return uAns === correctAns;
    } else if (q.type === "written") {
      return uAns.trim().toLowerCase() === q.definition.trim().toLowerCase();
    }
    return false;
  };

  // Logic 1: Chọn đáp án & Auto-Scroll (KHÔNG nộp bài tự động)
  const handleAnswerSelect = (questionIndex: number, answerValue: string) => {
    if (isTestFinished) return;

    const nextAnswers = { ...userAnswers, [questionIndex]: answerValue };
    setUserAnswers(nextAnswers);

    const isLastQuestion = Object.keys(nextAnswers).length === questions.length;

    // Cuộn mượt xuống câu tiếp theo sau độ trễ nhẹ
    setTimeout(() => {
      const nextElem = document.getElementById("question-" + (questionIndex + 1));
      if (nextElem) {
        nextElem.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (isLastQuestion) {
        const submitBtn = document.getElementById("submit-test-btn");
        if (submitBtn) {
          submitBtn.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }, 350);
  };

  // Logic 1.5: Gửi bài kiểm tra
  const handleSubmitTest = () => {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (checkAnswerIsCorrect(q, userAnswers[idx])) {
        correctCount++;
      }
    });

    const total = questions.length;
    const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const elapsedMs = Date.now() - timeStart;
    const seconds = Math.floor(elapsedMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const displayTime = minutes > 0 ? `${minutes} phút ${seconds % 60} giây` : `${seconds} giây`;

    setTestResults({
      correct: correctCount,
      incorrect: total - correctCount,
      percentage,
      timeTaken: displayTime,
    });
    setIsTestFinished(true);
    setIsDrawerOpen(false);

    // Cuộn mượt lên đầu trang
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Logic 2: Khởi tạo lại bài kiểm tra mới
  const handleRestartTest = () => {
    const shuffled = shuffleArray(originalQuestions);
    setQuestions(shuffled);
    setUserAnswers({});
    setWrittenInputs({});
    setIsTestFinished(false);
    setTimeStart(Date.now());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Logic 3: Hỏi lại các thuật ngữ trả lời sai
  const handleRetryWrongQuestions = () => {
    const wrongQuestions = questions.filter((q, idx) => {
      return !checkAnswerIsCorrect(q, userAnswers[idx]);
    });

    if (wrongQuestions.length === 0) {
      toast.success("Chúc mừng! Bạn đã hoàn thành chính xác 100% câu hỏi!");
      return;
    }

    setQuestions(wrongQuestions);
    setUserAnswers({});
    setWrittenInputs({});
    setIsTestFinished(false);
    setTimeStart(Date.now());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const backToStudySet = () => {
    router.push(`/study-sets/${id}`);
  };

  // Render các loại thẻ câu hỏi
  const renderMultipleChoice = (q: any, qIdx: number) => {
    const uAns = userAnswers[qIdx];
    const isCorrect = checkAnswerIsCorrect(q, uAns);

    return (
      <Card
        id={"question-" + qIdx}
        key={q.id ?? qIdx}
        className={cn("border-2 rounded-2xl p-6 transition-all scroll-mt-24 shadow-sm", {
          "border-green-200 bg-green-50/5 dark:border-green-950/20": isTestFinished && isCorrect,
          "border-red-200 bg-red-50/5 dark:border-red-950/20": isTestFinished && !isCorrect,
        })}
      >
        <CardContent className="p-0 space-y-4 font-sans">
          <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-widest">
            <span>Câu hỏi {qIdx + 1} &middot; Trắc nghiệm</span>
          </div>

          <div className="text-xl font-bold text-foreground whitespace-pre-wrap leading-relaxed">
            {q.term}
          </div>

          {isTestFinished && (
            <div className={cn("text-sm font-extrabold", isCorrect ? "text-green-600" : "text-orange-600")}>
              {isCorrect ? "Tuyệt vời!" : "Đừng lo, bạn vẫn đang học mà!"}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {(q.answers || []).map((ans: string, ansIdx: number) => {
              const isSelected = uAns === ans;
              const isCorrectAns = ans === q.definition;

              let cardStyles = "bg-[#f6f7fb] dark:bg-slate-800/40 border border-[#d9dde8] dark:border-slate-700 hover:bg-[#edeff4] dark:hover:bg-slate-700 cursor-pointer text-base";
              let iconToShow = null;

              if (isSelected && !isTestFinished) {
                cardStyles = "border-2 border-[#282e3e] dark:border-slate-300 bg-[#f6f7fb] dark:bg-slate-800/60 text-[#282e3e] dark:text-white text-base font-bold";
              }

              if (isTestFinished) {
                if (isSelected && !isCorrectAns) {
                  cardStyles = "border border-orange-500 text-orange-600 bg-white dark:bg-slate-900 pointer-events-none text-base";
                  iconToShow = <span className="text-orange-500 font-extrabold">✕</span>;
                } else if (isCorrectAns) {
                  cardStyles = "border-2 border-dashed border-green-500 text-green-700 bg-white dark:bg-slate-900 pointer-events-none text-base";
                  iconToShow = <span className="text-green-600 font-extrabold">✓</span>;
                } else {
                  cardStyles = "opacity-50 pointer-events-none border border-border bg-slate-50 dark:bg-slate-800/20 text-base";
                }
              }

              return (
                <div
                  key={ansIdx}
                  onClick={() => !isTestFinished && handleAnswerSelect(qIdx, ans)}
                  className={cn(
                    "p-4 rounded-xl font-semibold transition-all flex items-center gap-3 select-none",
                    cardStyles
                  )}
                >
                  <span
                    className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center text-xs font-extrabold flex-shrink-0",
                      isSelected && !isTestFinished
                        ? "bg-blue-600 text-white"
                        : isTestFinished && isSelected && !isCorrectAns
                          ? "bg-orange-100 text-orange-600"
                          : isTestFinished && isCorrectAns
                            ? "bg-green-100 text-green-600"
                            : "bg-slate-100 dark:bg-slate-800 text-muted-foreground"
                    )}
                  >
                    {iconToShow ? iconToShow : ansIdx + 1}
                  </span>
                  <span className="text-base sm:text-lg">{ans}</span>

                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderTrueFalse = (q: any, qIdx: number) => {
    const uAns = userAnswers[qIdx];
    const isCorrect = checkAnswerIsCorrect(q, uAns);
    const correctAns = q.answer === q.definition ? "true" : "false";

    return (
      <Card
        id={"question-" + qIdx}
        key={q.id ?? qIdx}
        className={cn("border-2 rounded-2xl p-6 transition-all scroll-mt-24 shadow-sm", {
          "border-green-200 bg-green-50/5 dark:border-green-950/20": isTestFinished && isCorrect,
          "border-red-200 bg-red-50/5 dark:border-red-950/20": isTestFinished && !isCorrect,
        })}
      >
        <CardContent className="p-0 space-y-6 font-sans">
          <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-widest">
            <span>Câu hỏi {qIdx + 1} &middot; Đúng / Sai</span>
          </div>

          <div className="flex flex-col md:flex-row gap-6 border-b pb-4">
            <div className="flex-1 md:border-r pr-6 space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">Thuật ngữ</span>
              <div className="text-xl font-bold leading-relaxed">{q.term}</div>
            </div>
            <div className="flex-1 space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">Định nghĩa</span>
              <div className="text-xl font-bold leading-relaxed">{q.answer}</div>
            </div>
          </div>

          {isTestFinished && (
            <div className={cn("text-sm font-extrabold", isCorrect ? "text-green-600" : "text-orange-600")}>
              {isCorrect ? "Tuyệt vời!" : "Đừng lo, bạn vẫn đang học mà!"}
            </div>
          )}

          <div className="flex gap-4">
            {["true", "false"].map((option) => {
              const isSelected = uAns === option;
              const isCorrectOption = option === correctAns;

              let cardStyles = "bg-[#f6f7fb] dark:bg-slate-800/40 border border-[#d9dde8] dark:border-slate-700 hover:bg-[#edeff4] dark:hover:bg-slate-700 cursor-pointer flex-1";
              let iconToShow = null;

              if (isSelected && !isTestFinished) {
                cardStyles = "border-2 border-[#282e3e] dark:border-slate-300 bg-[#f6f7fb] dark:bg-slate-800/60 text-[#282e3e] dark:text-white flex-1 font-bold";
              }

              if (isTestFinished) {
                if (isSelected && !isCorrectOption) {
                  cardStyles = "border border-orange-500 text-orange-600 bg-white dark:bg-slate-900 pointer-events-none flex-1";
                  iconToShow = <span className="text-orange-500 font-extrabold">✕</span>;
                } else if (isCorrectOption) {
                  cardStyles = "border-2 border-dashed border-green-500 text-green-700 bg-white dark:bg-slate-900 pointer-events-none flex-1";
                  iconToShow = <span className="text-green-600 font-extrabold">✓</span>;
                } else {
                  cardStyles = "opacity-50 pointer-events-none border border-border bg-slate-50 dark:bg-slate-800/20 flex-1";
                }
              }

              return (
                <div
                  key={option}
                  onClick={() => !isTestFinished && handleAnswerSelect(qIdx, option)}
                  className={cn(
                    "p-4 rounded-xl font-bold transition-all flex items-center justify-center gap-3 text-center select-none",
                    cardStyles
                  )}
                >
                  {iconToShow && (
                    <span
                      className={cn(
                        "w-6 h-6 rounded-lg flex items-center justify-center text-xs font-extrabold flex-shrink-0",
                        isCorrectOption ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
                      )}
                    >
                      {iconToShow}
                    </span>
                  )}
                  <span>{option === "true" ? "Đúng (True)" : "Sai (False)"}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderWritten = (q: any, qIdx: number) => {
    const uAns = userAnswers[qIdx];
    const isCorrect = checkAnswerIsCorrect(q, uAns);
    const inputValue = writtenInputs[qIdx] || "";

    return (
      <Card
        id={"question-" + qIdx}
        key={q.id ?? qIdx}
        className={cn("border-2 rounded-2xl p-6 transition-all scroll-mt-24 shadow-sm", {
          "border-green-200 bg-green-50/5 dark:border-green-950/20": isTestFinished && isCorrect,
          "border-red-200 bg-red-50/5 dark:border-red-950/20": isTestFinished && !isCorrect,
        })}
      >
        <CardContent className="p-0 space-y-4 font-sans">
          <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-widest">
            <span>Câu hỏi {qIdx + 1} &middot; Tự luận</span>
          </div>

          <div className="text-xl font-bold leading-relaxed">{q.term}</div>

          {isTestFinished && (
            <div className={cn("text-sm font-extrabold", isCorrect ? "text-green-600" : "text-orange-600")}>
              {isCorrect ? "Tuyệt vời!" : "Đừng lo, bạn vẫn đang học mà!"}
            </div>
          )}

          {!isTestFinished ? (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nhập đáp án của bạn..."
                value={inputValue}
                onChange={(e) => setWrittenInputs({ ...writtenInputs, [qIdx]: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && inputValue.trim()) {
                    handleAnswerSelect(qIdx, inputValue);
                  }
                }}
                className="w-full py-4 px-4 rounded-xl text-base font-medium border-2 focus:border-blue-600 outline-none transition-all dark:bg-slate-900"
              />
              <div className="flex justify-end">
                <Button
                  type="button"
                  disabled={!inputValue.trim()}
                  onClick={() => handleAnswerSelect(qIdx, inputValue)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6 py-2.5 transition-all active:scale-[0.98] text-sm"
                >
                  Tiếp tục
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">Đáp án của bạn</span>
                <div
                  className={cn(
                    "p-4 border-2 rounded-xl flex items-center gap-3 text-base font-semibold",
                    isCorrect
                      ? "border-green-500 bg-green-50/20 text-green-700 dark:text-green-300"
                      : "border-orange-500 bg-orange-50/20 text-orange-700 dark:text-orange-300"
                  )}
                >
                  <span
                    className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center text-xs font-extrabold flex-shrink-0",
                      isCorrect ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
                    )}
                  >
                    {isCorrect ? "✓" : "✕"}
                  </span>
                  <span>{uAns || "(Bỏ trống)"}</span>
                </div>
              </div>

              {!isCorrect && (
                <div className="space-y-1">
                  <span className="text-xs font-bold text-green-600 uppercase tracking-widest block">Đáp án đúng</span>
                  <div className="p-4 border-2 border-dashed border-green-500 bg-green-50/10 text-green-700 dark:text-green-300 rounded-xl flex items-center gap-3 text-base font-semibold">
                    <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-extrabold bg-green-100 text-green-600 flex-shrink-0">
                      ✓
                    </span>
                    <span>{q.definition}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Màn hình tổng kết (End Screen) hiển thị ở trên cùng
  const renderEndScreen = () => {
    if (!isTestFinished) return null;

    const titleText =
      testResults.percentage >= 80
        ? "Tuyệt vời! Bạn đã hoàn thành xuất sắc bài kiểm tra."
        : testResults.percentage >= 50
          ? "Khá tốt! Hãy luyện tập thêm để đạt điểm tuyệt đối."
          : "Đừng bỏ cuộc lúc này! Hãy vững tin và cố gắng hơn.";

    return (
      <Card className="border-2 rounded-2xl p-6 bg-card shadow-sm space-y-6">
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground text-center sm:text-left">
          {titleText}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
          {/* Cột trái: Thống kê */}
          <div className="space-y-4">
            <div className="text-sm font-extrabold text-muted-foreground">
              Thời gian của bạn: <span className="text-foreground">{testResults.timeTaken}</span>
            </div>

            <div className="flex items-center gap-6">
              {/* Donut Chart hiển thị điểm số */}
              <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    className="stroke-slate-200 dark:stroke-slate-700 fill-none"
                    strokeWidth="8"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    className="stroke-emerald-500 fill-none transition-all duration-1000 ease-out"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - testResults.percentage / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-xl font-extrabold text-foreground">
                  {testResults.percentage}%
                </span>
              </div>

              {/* Badges */}
              <div className="flex flex-col gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 text-sm font-extrabold border border-green-200 dark:border-green-900/40">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Đúng: {testResults.correct} câu
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 text-sm font-extrabold border border-orange-200 dark:border-orange-900/40">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  Sai: {testResults.incorrect} câu
                </span>
              </div>
            </div>
          </div>

          {/* Cột phải: Bước tiếp theo */}
          <div className="flex flex-col gap-3">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Bước tiếp theo
            </div>

            <div
              onClick={() => router.push(`/study-sets/${id}/learn`)}
              className="flex items-center justify-between p-4 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-all active:scale-[0.99] shadow-sm group"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg">
                  🔄
                </span>
                <div className="space-y-0.5 text-left">
                  <span className="text-sm font-bold block">Ôn luyện thuật ngữ trong chế độ Học</span>
                  <span className="text-xs text-muted-foreground block">Tập trung ôn tập để nhớ sâu sắc hơn</span>
                </div>
              </div>
              <ArrowRight size={16} className="text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </div>

            <div
              onClick={handleRestartTest}
              className="flex items-center justify-between p-4 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-all active:scale-[0.99] shadow-sm group"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
                  📄
                </span>
                <div className="space-y-0.5 text-left">
                  <span className="text-sm font-bold block">Làm bài kiểm tra mới</span>
                  <span className="text-xs text-muted-foreground block">Tạo đề thi mới với thứ tự ngẫu nhiên</span>
                </div>
              </div>
              <ArrowRight size={16} className="text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* COMPONENT A: MAIN HEADER */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border py-4 font-sans select-none shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="md:hidden p-2 text-[#939bb4] hover:bg-muted rounded-xl transition-all active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            </button>
            <button
              onClick={backToStudySet}
              className="hidden md:block p-2 hover:bg-muted rounded-xl transition-all active:scale-95"
              title="Quay lại học phần"
            >
              <span className="text-lg">←</span>
            </button>
            <div className="space-y-0.5">
              <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest block">
                Bài kiểm tra
              </span>
              <h2 className="text-sm sm:text-lg font-extrabold text-foreground tracking-tight max-w-[150px] sm:max-w-md truncate">
                {studySet.title}
              </h2>
            </div>
          </div>

          {isTestFinished && (
            <div className="hidden sm:flex items-center justify-center bg-secondary px-4 py-1.5 rounded-full text-xs sm:text-sm font-extrabold text-foreground border">
              {testResults.correct} / {questions.length} câu &middot; {testResults.percentage}%
            </div>
          )}

          <div className="flex items-center gap-2">
            {!isTestFinished ? (
              <>
                <button
                  onClick={() => {
                    const submitBtn = document.getElementById("submit-test-btn");
                    if (submitBtn) {
                      submitBtn.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                  }}
                  className="hidden sm:inline-flex bg-white hover:bg-[#edeff4] text-[#282e3e] border border-[#d9dde8] rounded-xl font-bold px-4 py-2 text-sm transition-all shadow-sm h-9 items-center justify-center"
                >
                  Gửi bài kiểm tra
                </button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => typeof window !== "undefined" && window.print()}
                  className="hidden sm:inline-flex rounded-xl font-bold gap-1.5 text-xs h-9 border"
                >
                  In bài kiểm tra
                </Button>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 bg-secondary hover:bg-secondary/80 text-foreground border rounded-xl transition-all active:scale-95 flex items-center justify-center w-9 h-9"
                  title="Thiết lập bài kiểm tra"
                >
                  <Settings size={18} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleRetryWrongQuestions}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-secondary hover:bg-secondary/80 text-foreground border rounded-xl font-extrabold text-[11px] sm:text-xs transition-all active:scale-95 shadow-sm"
                >
                  Hỏi lại thuật ngữ sai
                </button>
                <button
                  onClick={handleRestartTest}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold text-[11px] sm:text-xs transition-all active:scale-95 shadow-md border border-blue-400"
                >
                  Làm bài kiểm tra mới
                </button>
              </>
            )}

            <button
              onClick={backToStudySet}
              className="p-2 hover:bg-muted text-muted-foreground rounded-xl transition-all active:scale-95 ml-1"
              title="Đóng chế độ kiểm tra"
            >
              <X size={20} className="stroke-[3]" />
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER OVERLAY */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 md:hidden transition-opacity"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}
      
      {/* MOBILE DRAWER CONTENT */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-background border-r border-border shadow-xl transform transition-transform duration-300 ease-in-out md:hidden flex flex-col",
        isDrawerOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 border-b flex justify-between items-center">
           <h3 className="font-extrabold text-sm uppercase tracking-wider text-muted-foreground">
             {isTestFinished ? "Kết quả bài làm" : "Danh sách câu hỏi"}
           </h3>
           <button onClick={() => setIsDrawerOpen(false)} className="p-2 text-muted-foreground hover:bg-muted rounded-xl">
             <X size={20} />
           </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1 content-start space-y-4">
           <div className="grid grid-cols-4 gap-2">
             {questions.map((q, idx) => {
                const hasAnswer = userAnswers[idx] !== undefined;
                const isCorrect = isTestFinished ? checkAnswerIsCorrect(q, userAnswers[idx]) : false;

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setIsDrawerOpen(false);
                      setTimeout(() => {
                        document.getElementById("question-" + idx)?.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                      }, 300);
                    }}
                    className={cn(
                      "w-10 h-10 rounded-xl font-bold flex items-center justify-center transition-all text-xs border cursor-pointer active:scale-90",
                      isTestFinished
                        ? isCorrect
                          ? "bg-green-500 border-green-500 text-white shadow-sm"
                          : "bg-orange-500 border-orange-500 text-white shadow-sm"
                        : hasAnswer
                          ? "bg-blue-50 dark:bg-blue-950/40 border-blue-300 text-blue-600 font-extrabold"
                          : "bg-secondary hover:bg-secondary/80 border-border text-foreground"
                    )}
                  >
                    {isTestFinished ? (
                      isCorrect ? <Check size={14} className="stroke-[3]" /> : <X size={14} className="stroke-[3]" />
                    ) : (
                      idx + 1
                    )}
                  </button>
                );
              })}
           </div>
        </div>
      </div>

      {/* BODY LAYOUT */}
      <div className="flex gap-8 max-w-7xl mx-auto px-4 py-8 font-sans relative">
        {/* COMPONENT B: SIDEBAR ĐIỀU HƯỚNG */}
        <div className="hidden md:block w-64 flex-shrink-0 sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto border-r border-border pr-4 scrollbar-thin select-none">
          <div className="space-y-4">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-muted-foreground">
              {isTestFinished ? "Kết quả bài làm" : "Danh sách câu hỏi"}
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {questions.map((q, idx) => {
                const hasAnswer = userAnswers[idx] !== undefined;
                const isCorrect = isTestFinished ? checkAnswerIsCorrect(q, userAnswers[idx]) : false;

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      document.getElementById("question-" + idx)?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                    }}
                    className={cn(
                      "w-10 h-10 rounded-xl font-bold flex items-center justify-center transition-all text-xs border cursor-pointer active:scale-90",
                      isTestFinished
                        ? isCorrect
                          ? "bg-green-500 border-green-500 text-white shadow-sm"
                          : "bg-orange-500 border-orange-500 text-white shadow-sm"
                        : hasAnswer
                          ? "bg-blue-50 dark:bg-blue-950/40 border-blue-300 text-blue-600 font-extrabold"
                          : "bg-secondary hover:bg-secondary/80 border-border text-foreground"
                    )}
                    title={`Đi đến câu hỏi ${idx + 1}`}
                  >
                    {isTestFinished ? (
                      isCorrect ? (
                        <Check size={14} className="stroke-[3]" />
                      ) : (
                        <X size={14} className="stroke-[3]" />
                      )
                    ) : (
                      idx + 1
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* CỘT CÂU HỎI CUỘN DỌC */}
        <div className="flex-1 max-w-3xl mx-auto space-y-6">
          {/* COMPONENT C: MÀN HÌNH TỔNG KẾT */}
          {renderEndScreen()}

          {/* Tiêu đề Đáp án của bạn nếu đã Finished */}
          {isTestFinished && (
            <div className="text-base font-extrabold text-muted-foreground pt-4 border-t uppercase tracking-wider">
              Đáp án của bạn
            </div>
          )}

          {/* RENDER DANH SÁCH CÂU HỎI */}
          <div className="space-y-8">
            {questions.map((q, idx) => {
              if (q.type === "multipleChoice") {
                return renderMultipleChoice(q, idx);
              } else if (q.type === "trueOrFalse") {
                return renderTrueFalse(q, idx);
              } else if (q.type === "written") {
                return renderWritten(q, idx);
              }
              return null;
            })}
          </div>

          {/* Nút gửi bài kiểm tra nằm dưới cùng danh sách câu hỏi */}
          {!isTestFinished && questions.length > 0 && (
            <div className="pt-10 pb-16 flex justify-center">
              <Button
                id="submit-test-btn"
                onClick={handleSubmitTest}
                size="lg"
                className="bg-[#4255ff] hover:bg-blue-700 text-white font-bold text-lg px-12 py-7 rounded-2xl shadow-xl hover:shadow-2xl transition-all active:scale-95"
              >
                Gửi bài kiểm tra
              </Button>
            </div>
          )}
        </div>
      </div>

      <TestSettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        studySetId={id}
        studySetTitle={studySet.title}
        totalCards={studySet.flashcards.length}
      />
    </div>
  );
};

export default TestMode;
