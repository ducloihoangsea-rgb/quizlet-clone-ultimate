import type { InputHTMLAttributes } from "react";
import { forwardRef } from "react";
import { Check, X } from "lucide-react";

import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import { Card, CardContent } from "@acme/ui/card";
import { FormItem } from "@acme/ui/form";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";

interface WrittenCardProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'onSubmit'> {
  term: string;
  definition?: string;
  userAnswer?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDontKnow?: () => void;
  onSubmit?: (e: React.FormEvent) => void;
  onOverrideCorrect?: () => void;
  onContinue?: () => void;
}

const WrittenCard = forwardRef<HTMLInputElement, WrittenCardProps>(
  (
    {
      term,
      definition = "",
      userAnswer,
      value = "",
      onChange,
      onDontKnow,
      onSubmit,
      onOverrideCorrect,
      onContinue,
      className,
      ...props
    },
    ref,
  ) => {
    const isSubmitted = userAnswer !== undefined;
    const isCorrect = userAnswer?.trim().toLowerCase() === definition.trim().toLowerCase();
    const isSkipped = userAnswer === "Đã bỏ qua";

    // Giao diện khi đã trả lời / đã submit
    if (isSubmitted) {
      return (
        <Card className={cn("border-2 shadow-sm rounded-2xl", className)}>
          <CardContent className="flex min-h-[30rem] flex-col p-6 justify-between">
            <div className="space-y-6">
              {/* Thuật ngữ */}
              <div>
                <span className="mb-2 block text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Thuật ngữ (Term)
                </span>
                <div className="text-2xl whitespace-pre-wrap font-sans leading-relaxed text-foreground">
                  {term}
                </div>
              </div>

              {/* So khớp đúng hay sai */}
              {isCorrect ? (
                <div className="space-y-3">
                  <span className="text-sm font-bold text-green-600 uppercase tracking-wide">
                    Tuyệt vời! Bạn đã trả lời đúng
                  </span>
                  <div className="flex items-center gap-3 p-4 border-2 border-green-600 bg-green-600/10 rounded-xl">
                    <Check className="text-green-600 flex-shrink-0" size={20} />
                    <span className="text-lg text-green-800 dark:text-green-300 font-sans whitespace-pre-wrap">
                      {userAnswer}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Tiêu đề phụ và Override button */}
                  <div className="flex items-center justify-between">
                    <span className={cn("text-base font-bold", isSkipped ? "text-orange-500" : "text-red-500")}>
                      {isSkipped ? "Thử lại câu hỏi này sau!" : "Đừng lo, bạn vẫn đang học mà!"}
                    </span>
                    {!isSkipped && onOverrideCorrect && (
                      <button
                        type="button"
                        onClick={onOverrideCorrect}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all"
                      >
                        Tôi đã trả lời đúng
                      </button>
                    )}
                  </div>

                  {/* Đáp án của bạn */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      Đáp án của bạn:
                    </span>
                    <div className={cn(
                      "flex items-center gap-3 p-4 border-2 rounded-xl",
                      isSkipped ? "border-gray-400 bg-gray-400/10 text-gray-500" : "border-red-600 bg-red-600/10 text-red-700 dark:text-red-300"
                    )}>
                      <X className={cn("flex-shrink-0", isSkipped ? "text-gray-400" : "text-red-600")} size={20} />
                      <span className="text-lg font-sans whitespace-pre-wrap">
                        {userAnswer}
                      </span>
                    </div>
                  </div>

                  {/* Đáp án đúng */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-green-600 uppercase tracking-widest block">
                      Đáp án đúng
                    </span>
                    <div className="flex items-center gap-3 p-4 border-2 border-dashed border-green-600 bg-green-600/10 rounded-xl text-green-700 dark:text-green-300">
                      <Check className="flex-shrink-0 text-green-600" size={20} />
                      <span className="text-lg font-sans whitespace-pre-wrap">
                        {definition}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Dòng điều khiển phía dưới */}
            {onContinue && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t pt-4 mt-6 gap-4">
                <span className="text-xs text-muted-foreground italic">
                  Nhấp vào câu trả lời đúng hoặc nhấn phím bất kỳ để tiếp tục
                </span>
                <Button
                  onClick={onContinue}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-8 py-3 transition-all active:scale-[0.98]"
                >
                  Tiếp tục
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    // Giao diện khi chưa trả lời (chưa submit)
    return (
      <Card className={cn("border-2 shadow-sm rounded-2xl", className)}>
        <CardContent className="flex min-h-[30rem] flex-col p-6 justify-between">
          <div>
            <span className="mb-2 block text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Thuật ngữ (Term)
            </span>
            <div className="text-2xl whitespace-pre-wrap font-sans leading-relaxed text-foreground">
              {term}
            </div>
          </div>

          <div className="space-y-4">
            <FormItem>
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Đáp án của bạn
              </Label>
              {onSubmit ? (
                // Chế độ Học (có onSubmit và value/onChange)
                <div className="space-y-4">
                  <Input
                    ref={ref}
                    type="text"
                    placeholder="Nhập đáp án"
                    value={value}
                    onChange={onChange}
                    className="py-6 px-4 rounded-xl text-lg font-sans border-2 focus-visible:ring-blue-600"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && value.trim()) {
                        e.preventDefault();
                        onSubmit(e);
                      }
                    }}
                    {...props}
                  />
                  <div className="flex items-center justify-between border-t pt-4">
                    {onDontKnow ? (
                      <button
                        type="button"
                        onClick={onDontKnow}
                        className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all"
                      >
                        Bạn không biết?
                      </button>
                    ) : (
                      <div />
                    )}
                    <Button
                      type="button"
                      disabled={!value.trim()}
                      onClick={onSubmit}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-8 py-3 transition-all active:scale-[0.98]"
                    >
                      Trả lời
                    </Button>
                  </div>
                </div>
              ) : (
                // Chế độ Kiểm tra (Test Mode)
                <Input
                  ref={ref}
                  type="text"
                  placeholder="Nhập đáp án"
                  className="py-6 px-4 rounded-xl text-lg font-sans border-2 focus-visible:ring-blue-600"
                  {...props}
                />
              )}
            </FormItem>
          </div>
        </CardContent>
      </Card>
    );
  },
);

WrittenCard.displayName = "WrittenCard";

export default WrittenCard;
