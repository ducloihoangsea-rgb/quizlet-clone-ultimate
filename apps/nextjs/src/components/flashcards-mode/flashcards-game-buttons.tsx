"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Maximize,
  Play,
  Shuffle,
  Undo2,
  X,
} from "lucide-react";

import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import { Switch } from "@acme/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@acme/ui/tooltip";

import { useFlashcardsModeContext } from "~/contexts/flashcards-mode-context";
import FlashcardsGameSettingsDialog from "./flashcards-game-settings-dialog";

interface FlashcardButtonsProps {
  fullscreen?: boolean;
}

const FlashcardsGameButtons = ({ fullscreen }: FlashcardButtonsProps) => {
  const { id }: { id: string } = useParams();
  const {
    shuffle,
    handleLeft,
    handleRight,
    index,
    sorting,
    count,
    trackProgress,
    toggleTrackProgress,
    canUndo,
    undo,
  } = useFlashcardsModeContext();

  // Chế độ Theo dõi tiến độ BẬT
  if (trackProgress) {
    return (
      <div className="mt-4 mb-4 select-none">
        <div className="flex items-center justify-between">
          {/* Toggle Theo dõi tiến độ - bên trái */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-muted-foreground">
              Theo dõi tiến độ
            </span>
            <Switch
              checked={trackProgress}
              onCheckedChange={toggleTrackProgress}
            />
          </div>

          {/* Nút X và ✓ ở giữa */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={handleLeft}
              className="rounded-full w-12 h-12 border-2 border-orange-400 text-orange-500 hover:bg-orange-50 hover:border-orange-500 hover:text-orange-600 dark:hover:bg-orange-950/30 transition-all"
              size="icon"
            >
              <X size={22} />
            </Button>
            <Button
              variant="outline"
              onClick={handleRight}
              className="rounded-full w-12 h-12 border-2 border-emerald-400 text-emerald-500 hover:bg-emerald-50 hover:border-emerald-500 hover:text-emerald-600 dark:hover:bg-emerald-950/30 transition-all"
              size="icon"
            >
              <Check size={22} />
            </Button>
          </div>

          {/* Nút Undo, Settings và Fullscreen - bên phải */}
          <TooltipProvider delayDuration={0}>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={undo}
                    disabled={!canUndo}
                    size="icon"
                    className="transition-all rounded-xl"
                  >
                    <Undo2 size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Hoàn tác</TooltipContent>
              </Tooltip>

              <FlashcardsGameSettingsDialog />

              {!fullscreen && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href={`/study-sets/${id}/flashcards`}>
                      <Button variant="outline" size="icon" className="rounded-xl">
                        <Maximize size={18} />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>Toàn màn hình</TooltipContent>
                </Tooltip>
              )}
            </div>
          </TooltipProvider>
        </div>
      </div>
    );
  }

  // Chế độ Theo dõi tiến độ TẮT (mặc định)
  return (
    <div className="mt-4 mb-4 select-none">
      <div className="flex items-center justify-between">
        {/* Toggle Theo dõi tiến độ - bên trái */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-muted-foreground">
            Theo dõi tiến độ
          </span>
          <Switch
            checked={trackProgress}
            onCheckedChange={toggleTrackProgress}
          />
        </div>

        {/* Nút điều hướng ở giữa */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={handleLeft}
            disabled={!sorting && index === 0}
            className={cn("rounded-full", {
              "hover:border-red-500 hover:text-red-500": sorting,
            })}
            size="icon"
          >
            {sorting ? <X /> : <ArrowLeft />}
          </Button>
          <span className="select-none font-semibold text-muted-foreground">
            {index + 1} / {count}
          </span>
          <Button
            variant="outline"
            onClick={handleRight}
            disabled={index === count}
            className={cn("rounded-full", {
              "hover:border-green-600 hover:text-green-600": sorting,
            })}
            size="icon"
          >
            {sorting ? <Check /> : <ArrowRight />}
          </Button>
        </div>

        {/* Nút Play, Shuffle, Settings, Fullscreen - bên phải */}
        <TooltipProvider delayDuration={0}>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={shuffle} size="icon">
                  <Shuffle size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Trộn thẻ</TooltipContent>
            </Tooltip>

            <FlashcardsGameSettingsDialog />

            {!fullscreen && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href={`/study-sets/${id}/flashcards`}>
                    <Button variant="outline" size="icon">
                      <Maximize size={18} />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>Toàn màn hình</TooltipContent>
              </Tooltip>
            )}
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default FlashcardsGameButtons;
