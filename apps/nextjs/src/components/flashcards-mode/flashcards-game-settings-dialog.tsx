import React from "react";
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
    sorting,
    reset,
    toggleSorting,
    starredOnly,
    toggleStarredOnly,
    disableStarredOnly,
  } = useFlashcardsModeContext();

  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <SettingsIcon className="size-4" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Settings</TooltipContent>
      </Tooltip>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cài đặt</DialogTitle>
          <DialogDescription>
            Tùy chỉnh cách bạn muốn học thẻ ghi nhớ.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="font-medium">Phân loại thẻ</span>
            <span className="text-sm text-muted-foreground">
              Chia thẻ thành hai nhóm - dễ và khó. Sau đó bạn có thể chỉ ôn lại
              các thẻ khó.
            </span>
          </div>
          <Switch checked={sorting} onCheckedChange={toggleSorting} />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <span className="font-medium">Chỉ học thuật ngữ có gắn sao</span>
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
                <TooltipContent>
                  Bạn cần gắn sao một số thuật ngữ để sử dụng tính năng này
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
        <Separator />
        <div>
          <Button onClick={reset} variant="destructive">
            Đặt lại thẻ ghi nhớ
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FlashcardsGameSettingsDialog;
