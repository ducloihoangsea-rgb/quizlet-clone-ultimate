"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Star, Zap, FileText } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";
import { Button } from "@acme/ui/button";
import { api } from "~/trpc/react";

interface LearnModeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studySetId: string;
}

const LearnModeDialog = ({ open, onOpenChange, studySetId }: LearnModeDialogProps) => {
  const router = useRouter();
  const [selectedGoal, setSelectedGoal] = useState<"cramming" | "spaced_repetition">("cramming");
  const { data: studySet } = api.studySet.byId.useQuery({ id: studySetId }, { enabled: open });

  const handleStart = () => {
    onOpenChange(false);
    router.push(`/study-sets/${studySetId}/learn?goal=${selectedGoal}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm w-full p-0 overflow-hidden flex flex-col rounded-3xl border bg-card sm:max-w-md">
        {/* Header */}
        <DialogHeader className="p-6 pb-2">
          {studySet && (
            <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider line-clamp-1">
              {studySet.title}
            </p>
          )}
          <DialogTitle className="text-2xl font-extrabold tracking-tight leading-snug">
            Chọn mục tiêu cho phiên học này
          </DialogTitle>
        </DialogHeader>

        {/* Body */}
        <div className="p-6 space-y-4 pt-4">
          <button
            onClick={() => setSelectedGoal("cramming")}
            className={`w-full text-left px-5 py-4 rounded-full border-2 transition-all flex items-center justify-between ${
              selectedGoal === "cramming"
                ? "border-blue-600 bg-blue-50 text-blue-900 dark:bg-blue-900/20 dark:text-blue-100 ring-2 ring-blue-600/20"
                : "border-border bg-background text-foreground hover:bg-muted/50"
            }`}
          >
            <span className="font-bold text-[15px]">Học nhồi nhét cho bài thi</span>
            <div className="flex -space-x-1">
              <div className="bg-orange-100 text-orange-500 rounded-full p-1.5 z-10 border-2 border-background dark:border-card">
                <Zap size={14} className="fill-current" />
              </div>
              <div className="bg-blue-100 text-blue-500 rounded-full p-1.5 border-2 border-background dark:border-card">
                <Clock size={14} className="fill-current" />
              </div>
            </div>
          </button>

          <button
            onClick={() => setSelectedGoal("spaced_repetition")}
            className={`w-full text-left px-5 py-4 rounded-full border-2 transition-all flex items-center justify-between ${
              selectedGoal === "spaced_repetition"
                ? "border-blue-600 bg-blue-50 text-blue-900 dark:bg-blue-900/20 dark:text-blue-100 ring-2 ring-blue-600/20"
                : "border-border bg-background text-foreground hover:bg-muted/50"
            }`}
          >
            <span className="font-bold text-[15px]">Ghi nhớ tất cả</span>
            <div className="flex -space-x-1">
              <div className="bg-sky-100 text-sky-500 rounded-full p-1.5 z-10 border-2 border-background dark:border-card">
                <FileText size={14} className="fill-current" />
              </div>
              <div className="bg-yellow-100 text-yellow-500 rounded-full p-1.5 border-2 border-background dark:border-card">
                <Star size={14} className="fill-current" />
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="p-6 pt-2">
          <Button
            onClick={handleStart}
            size="lg"
            className="w-full h-14 rounded-2xl text-[17px] font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all active:scale-[0.98]"
          >
            Bắt đầu chế độ Học
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LearnModeDialog;
