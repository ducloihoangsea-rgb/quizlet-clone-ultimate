"use client";

import React, { useState } from "react";
import { SettingsIcon } from "lucide-react";

import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@acme/ui/dialog";
import { Separator } from "@acme/ui/separator";
import { Switch } from "@acme/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@acme/ui/tooltip";

import { useFlashcardsModeContext } from "~/contexts/flashcards-mode-context";

const FlashcardsGameSettingsDialog = () => {
  const {
    reset,
    starredOnly,
    toggleStarredOnly,
    disableStarredOnly,
    trackProgress,
    toggleTrackProgress,
    frontFace,
    setFrontFace,
    textToSpeech,
    toggleTextToSpeech,
  } = useFlashcardsModeContext();

  const [open, setOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const handleRestart = () => {
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-xl active:scale-95 transition-all shadow-sm">
          <SettingsIcon className="size-4 text-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-full rounded-2xl p-6 font-sans select-none bg-card border">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-2xl font-black text-foreground">
            Tùy chọn
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Theo dõi tiến độ */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-foreground">Theo dõi tiến độ</span>
              <Switch checked={trackProgress} onCheckedChange={toggleTrackProgress} />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Sắp xếp các thẻ ghi nhớ của bạn để theo dõi những gì bạn đã biết và những gì đang học. Tắt tính năng theo dõi tiến độ nếu bạn muốn nhanh chóng ôn lại các thẻ ghi nhớ.
            </p>
          </div>

          <Separator />

          {/* Chỉ học thuật ngữ có gắn sao */}
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-foreground">Chỉ học thuật ngữ có gắn sao</span>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Switch
                      disabled={disableStarredOnly}
                      checked={starredOnly}
                      onCheckedChange={toggleStarredOnly}
                    />
                  </div>
                </TooltipTrigger>
                {disableStarredOnly && (
                  <TooltipContent className="text-xs font-semibold">
                    Bạn cần gắn sao một số thuật ngữ để sử dụng tính năng này
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>

          <Separator />

          {/* Mặt trước */}
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-foreground">Mặt trước</span>
            <select
              value={frontFace}
              onChange={(e) => setFrontFace(e.target.value as "term" | "definition" | "both")}
              className="bg-secondary text-foreground font-extrabold py-1.5 px-3 border-2 rounded-xl outline-none cursor-pointer focus:border-indigo-600 transition-all text-xs min-w-[110px]"
            >
              <option value="term">Thuật ngữ</option>
              <option value="definition">Định nghĩa</option>
              <option value="both">Cả hai</option>
            </select>
          </div>

          <Separator />

          {/* Phím tắt bàn phim */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-foreground">Phím tắt bàn phím</span>
              <Button
                variant="ghost"
                onClick={() => setShowShortcuts(!showShortcuts)}
                className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40 rounded-xl"
              >
                {showShortcuts ? "Ẩn" : "Xem"}
              </Button>
            </div>
            {showShortcuts && (
              <div className="p-3 bg-muted/40 rounded-xl space-y-2 text-xs font-semibold text-muted-foreground border transition-all">
                <div className="flex justify-between">
                  <span>Phím cách (Space):</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-muted border font-bold">Lật thẻ</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Mũi tên Trái / phím X:</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-muted border font-bold">Đang học / Thẻ trước</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Mũi tên Phải / tích xanh:</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-muted border font-bold">Đã biết / Thẻ tiếp</kbd>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Chuyển văn bản thành lời nói */}
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-foreground">Chuyển văn bản thành lời nói</span>
            <Switch checked={textToSpeech} onCheckedChange={toggleTextToSpeech} />
          </div>

          <Separator />

          {/* Khởi động lại Thẻ ghi nhớ */}
          <div className="pt-2">
            <button
              onClick={handleRestart}
              className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:hover:bg-red-900/20 dark:text-red-400 font-extrabold text-sm rounded-xl transition-all border border-red-100 dark:border-red-950/40"
            >
              Khởi động lại Thẻ ghi nhớ
            </button>
          </div>

          {/* Link chính sách */}
          <div className="text-center pt-2">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
            >
              Chính sách quyền riêng tư
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FlashcardsGameSettingsDialog;
