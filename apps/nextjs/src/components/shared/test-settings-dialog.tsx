import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";
import { Switch } from "@acme/ui/switch";
import { Button } from "@acme/ui/button";

interface TestSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studySetId: string;
  studySetTitle: string;
  totalCards: number;
}

export default function TestSettingsDialog({
  open,
  onOpenChange,
  studySetId,
  studySetTitle,
  totalCards,
}: TestSettingsDialogProps) {
  const router = useRouter();

  // State các cấu hình
  const [questionCount, setQuestionCount] = useState<number>(totalCards);
  const [answerWith, setAnswerWith] = useState<string>("both"); // Mặc định cả hai
  
  // Các loại câu hỏi (mặc định chỉ bật Trắc nghiệm)
  const [types, setTypes] = useState({
    trueFalse: false,
    mc: true,
    written: false,
  });

  const handleStart = () => {
    // Thu thập các type được bật
    const selectedTypes: string[] = [];
    if (types.trueFalse) selectedTypes.push("trueFalse");
    if (types.mc) selectedTypes.push("mc");
    if (types.written) selectedTypes.push("written");

    // Nếu không chọn chế độ nào, mặc định dùng trắc nghiệm
    const finalTypes = selectedTypes.length > 0 ? selectedTypes : ["mc"];

    // Chuyển hướng sang trang kiểm tra với các query params
    const query = new URLSearchParams({
      limit: questionCount.toString(),
      answerWith,
      types: finalTypes.join(","),
    });

    onOpenChange(false);
    router.push(`/study-sets/${studySetId}/test?${query.toString()}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl p-6 font-sans">
        <DialogHeader className="flex flex-row items-start justify-between border-b pb-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">
              {studySetTitle}
            </span>
            <DialogTitle className="text-2xl font-extrabold text-foreground">
              Thiết lập bài kiểm tra
            </DialogTitle>
          </div>
          <div className="bg-blue-100 dark:bg-blue-950 p-3 rounded-2xl text-blue-600 dark:text-blue-400">
            <FileText size={32} />
          </div>
        </DialogHeader>

        <div className="py-6 space-y-6">
          {/* Số lượng câu hỏi */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-sm font-bold text-foreground block">
                Câu hỏi
              </span>
              <span className="text-xs text-muted-foreground block">
                (tối đa {totalCards})
              </span>
            </div>
            <input
              type="number"
              min={1}
              max={totalCards}
              value={questionCount}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val)) {
                  setQuestionCount(Math.min(Math.max(val, 1), totalCards));
                } else {
                  setQuestionCount(1);
                }
              }}
              className="w-20 bg-secondary text-foreground text-center font-bold py-2 px-3 border-2 rounded-xl outline-none focus:border-blue-600 transition-all text-sm"
            />
          </div>

          {/* Trả lời bằng */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">
              Trả lời bằng
            </span>
            <select
              value={answerWith}
              onChange={(e) => setAnswerWith(e.target.value)}
              className="bg-secondary text-foreground font-bold py-2 px-3 border-2 rounded-xl outline-none cursor-pointer focus:border-blue-600 transition-all text-sm min-w-[120px]"
            >
              <option value="both">Cả hai</option>
              <option value="definition">Định nghĩa</option>
              <option value="term">Thuật ngữ</option>
            </select>
          </div>

          <div className="border-t pt-4 space-y-4">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">
              Loại câu hỏi
            </span>

            {/* Đúng / Sai */}
            <div className="flex items-center justify-between py-1">
              <span className="text-sm font-bold text-foreground">Đúng/Sai</span>
              <Switch
                checked={types.trueFalse}
                onCheckedChange={(checked) =>
                  setTypes((prev) => ({ ...prev, trueFalse: checked }))
                }
              />
            </div>

            {/* Trắc nghiệm */}
            <div className="flex items-center justify-between py-1">
              <span className="text-sm font-bold text-foreground">Trắc nghiệm</span>
              <Switch
                checked={types.mc}
                onCheckedChange={(checked) =>
                  setTypes((prev) => ({ ...prev, mc: checked }))
                }
              />
            </div>

            {/* Tự luận */}
            <div className="flex items-center justify-between py-1">
              <span className="text-sm font-bold text-foreground">Tự luận</span>
              <Switch
                checked={types.written}
                onCheckedChange={(checked) =>
                  setTypes((prev) => ({ ...prev, written: checked }))
                }
              />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <Button
            onClick={handleStart}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl text-base transition-all active:scale-[0.98] shadow-md hover:shadow-lg"
          >
            Bắt đầu làm kiểm tra
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
