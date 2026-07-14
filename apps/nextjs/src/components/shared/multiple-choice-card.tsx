import type { InputHTMLAttributes, MouseEvent } from "react";
import { forwardRef } from "react";
import { Check, X } from "lucide-react";

import { cn } from "@acme/ui";
import { Card, CardContent } from "@acme/ui/card";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";

interface MultipleChoiceCardProps
  extends InputHTMLAttributes<HTMLInputElement> {
  term: string;
  answers: string[];
  index: number;
  callback?: (index: number, event: MouseEvent<HTMLDivElement>) => void;
  definition?: string;
  userAnswer?: string;
  isReviewMode?: boolean;
}

const MultipleChoiceCard = forwardRef<
  HTMLInputElement,
  MultipleChoiceCardProps
>(
  (
    { index, term, answers, callback, userAnswer, definition, isReviewMode, ...props },
    ref,
  ) => {
    const hasAnswered = !!userAnswer;
    const isCorrectAnswer = userAnswer === definition;

    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-1 flex-col sm:mb-12 sm:flex-row">
            <div className="flex-1 pb-4">
              <span className="mb-6 block font-semibold text-muted-foreground">
                Thuật ngữ (Term)
              </span>
              <div className="text-2xl whitespace-pre-wrap leading-relaxed">{term}</div>
            </div>
          </div>

          {/* Label chọn đáp án / feedback */}
          {!hasAnswered && (
            <div className="mb-4 flex items-center gap-3">
              <span className="font-semibold text-muted-foreground">Chọn đáp án</span>
              {isReviewMode && (
                <span className="bg-slate-400 dark:bg-slate-600 text-white px-3 py-0.5 rounded-full text-xs font-bold tracking-wide">
                  Hãy thử lại lần nữa
                </span>
              )}
            </div>
          )}
          {hasAnswered && !isCorrectAnswer && (
            <div className="mb-4 text-orange-500 font-bold text-base">
              Đừng nản chí, học là một quá trình!
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {(answers || []).map((answer, answerIndex) => (
              <Label
                key={answerIndex}
                htmlFor={`card-${index}-choice-${answerIndex}`}
              >
                <span className="sr-only">{answer}</span>
                <Input
                  ref={ref}
                  id={`card-${index}-choice-${answerIndex}`}
                  name="multiple-choice"
                  type="radio"
                  className="peer hidden"
                  {...props}
                  value={answer}
                />
                <Card
                  onClick={(event) => callback && callback(answerIndex, event)}
                  className={cn(
                    "cursor-pointer border-2 peer-checked:border-blue-600 peer-checked:bg-blue-600/10 hover:shadow-sm transition-all",
                    {
                      // User chọn đáp án SAI
                      "border-red-600 bg-red-600/10 text-red-700 dark:text-red-300":
                        answer !== definition && userAnswer === answer,
                      // Đáp án ĐÚNG khi user chọn đúng (solid green)
                      "border-green-600 bg-green-600/10 text-green-700 dark:text-green-300":
                        answer === definition && userAnswer === definition,
                      // Đáp án ĐÚNG khi user chọn sai (dashed green để chỉ ra đáp án đúng)
                      "border-dashed border-green-600 bg-green-600/5 text-green-700 dark:text-green-300":
                        answer === definition && !!userAnswer && userAnswer !== definition,
                      // Disable các đáp án khác khi đã trả lời
                      "opacity-50 pointer-events-none":
                        !!userAnswer && answer !== userAnswer && answer !== definition,
                    },
                  )}
                >
                  <CardContent className="p-4 font-sans font-semibold flex items-center gap-3">
                    {/* Icon trạng thái / Số thứ tự */}
                    <span
                      className={cn(
                        "w-6 h-6 rounded flex items-center justify-center text-xs font-bold flex-shrink-0",
                        answer !== definition && userAnswer === answer
                          ? "bg-red-600 text-white"
                          : answer === definition && !!userAnswer
                            ? "bg-green-600 text-white"
                            : "bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400",
                      )}
                    >
                      {answer !== definition && userAnswer === answer ? (
                        <X size={12} />
                      ) : answer === definition && !!userAnswer ? (
                        <Check size={12} />
                      ) : (
                        answerIndex + 1
                      )}
                    </span>
                    <span>{answer}</span>
                  </CardContent>
                </Card>
              </Label>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  },
);

MultipleChoiceCard.displayName = "MultipleChoiceCard";

export default MultipleChoiceCard;
