import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Switch } from "@acme/ui/switch";
import { cn } from "@acme/ui";

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
  const [types, setTypes] = useState({
    trueFalse: false,
    mc: true,
    matching: false,
    written: false,
  });

  // Tự động tắt cuộn trang khi mở modal
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  if (!open) return null;

  const handleStart = () => {
    // Thu thập các type được bật
    const selectedTypes: string[] = [];
    if (types.trueFalse) selectedTypes.push("trueFalse");
    if (types.mc) selectedTypes.push("mc");
    if (types.written) selectedTypes.push("written");

    // Mặc định ít nhất phải có 1 type
    const finalTypes = selectedTypes.length > 0 ? selectedTypes : ["mc"];

    // Chuyển hướng sang trang kiểm tra với các query params
    const query = new URLSearchParams({
      limit: questionCount.toString(),
      answerWith: "both",
      types: finalTypes.join(","),
    });

    onOpenChange(false);
    router.push(`/study-sets/${studySetId}/test?${query.toString()}`);
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/50 flex items-center justify-center p-4 font-sans backdrop-blur-[1px]">
      <div 
        className="bg-white rounded-[24px] w-full max-w-[500px] shadow-2xl flex flex-col relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button at top right */}
        <button 
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors z-10"
        >
          <X size={18} className="text-gray-500" />
        </button>

        {/* Scrollable Content Area */}
        <div className="p-8 max-h-[85vh] overflow-y-auto">
          <h2 className="text-[28px] font-bold text-[#1a1d28] mb-8 tracking-tight">Tùy chọn</h2>

          <div className="space-y-6">
            {/* Câu hỏi (tối đa) */}
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-normal text-[#374151]">
                Câu hỏi <span className="text-[13px] text-gray-500">(tối đa {totalCards})</span>
              </span>
              <div className="bg-[#f6f7fb] px-4 py-2 rounded-xl">
                <input
                  type="number"
                  min={1}
                  max={totalCards}
                  value={questionCount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val)) setQuestionCount(Math.min(Math.max(val, 1), totalCards));
                    else setQuestionCount(1);
                  }}
                  className="w-10 bg-transparent text-[#1a1d28] text-center font-bold text-[15px] outline-none"
                />
              </div>
            </div>

            {/* Chỉ học thuật ngữ có gắn sao */}
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-normal text-[#374151]">Chỉ học thuật ngữ có gắn sao</span>
              <Switch disabled />
            </div>

            {/* Đúng/Sai */}
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-normal text-[#374151]">Đúng/Sai</span>
              <Switch
                checked={types.trueFalse}
                onCheckedChange={(checked) => setTypes((prev) => ({ ...prev, trueFalse: checked }))}
              />
            </div>

            {/* Trắc nghiệm */}
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-normal text-[#374151]">Trắc nghiệm</span>
              <Switch
                checked={types.mc}
                onCheckedChange={(checked) => setTypes((prev) => ({ ...prev, mc: checked }))}
              />
            </div>

            {/* Ghép thẻ */}
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-normal text-[#374151]">Ghép thẻ</span>
              <Switch disabled />
            </div>

            {/* Tự luận */}
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-normal text-[#374151]">Tự luận</span>
              <Switch
                checked={types.written}
                onCheckedChange={(checked) => setTypes((prev) => ({ ...prev, written: checked }))}
              />
            </div>

            <div className="h-[1px] bg-gray-200 my-2" />

            {/* Định dạng câu hỏi */}
            <div className="flex items-center justify-between cursor-pointer group">
              <span className="text-[15px] font-normal text-[#374151]">Định dạng câu hỏi</span>
              <div className="flex items-center gap-1 text-[#4255ff] text-[15px] font-bold group-hover:underline">
                <span>Xem</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </div>

            {/* Tùy chọn sửa sai */}
            <div className="flex items-center justify-between cursor-pointer group">
              <span className="text-[15px] font-normal text-[#374151]">Tùy chọn sửa sai</span>
              <div className="flex items-center gap-1 text-[#4255ff] text-[15px] font-bold group-hover:underline">
                <span>Xem</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleStart}
              className="bg-[#4255ff] hover:bg-[#3245df] text-white px-6 py-3 rounded-full font-bold text-[15px] transition-colors active:scale-95"
            >
              Tạo bài kiểm tra mới
            </button>
          </div>
        </div>

        {/* Footer Area */}
        <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-white rounded-b-[24px]">
          <button className="text-[#4255ff] font-bold text-[14px] hover:underline">
            Chính sách quyền riêng tư
          </button>
          <button 
            onClick={() => onOpenChange(false)}
            className="px-6 py-2 border border-gray-300 rounded-full font-bold text-[14px] text-[#374151] hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
        </div>

      </div>
    </div>
  );
}
