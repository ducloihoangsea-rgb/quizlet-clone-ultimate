"use client";

import type { MouseEvent } from "react";
import { Lightbulb, Star } from "lucide-react";

import type { RouterOutputs } from "@acme/api";
import type { Session } from "@acme/auth";
import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";

import { useSignInDialogContext } from "~/contexts/sign-in-dialog-context";
import useStar from "~/hooks/use-star";
import EditFlashcardDialog from "../shared/edit-flashcard-dialog";

interface FlipCardContentProps {
  flashcard: RouterOutputs["studySet"]["byId"]["flashcards"][0];
  session: Session | null;
  editable?: boolean;
  back?: boolean;
}

const FlipCardContent = ({
  flashcard,
  session,
  back,
  editable,
}: FlipCardContentProps) => {
  const { toggleStar } = useStar(flashcard);
  const { onOpenChange } = useSignInDialogContext();

  const onStarClick = (event: MouseEvent) => {
    event.stopPropagation();

    if (session) {
      toggleStar();
    } else {
      onOpenChange(true);
    }
  };

  const title = back ? "Definition" : "Term";

  const content = back ? flashcard.definition : flashcard.term;

  return (
    <div
      className={cn("absolute h-full w-full [backface-visibility:hidden]", {
        "[transform:rotateX(180deg)]": back,
      })}
    >
      <div className="flex h-full w-full flex-col rounded-t-lg bg-primary-foreground p-4 drop-shadow-lg md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Lightbulb size={14} />
            <span className="text-xs font-semibold">Hiển thị gợi ý</span>
          </div>
          <div className="flex justify-end gap-2">
            {editable && <EditFlashcardDialog flashcard={flashcard} />}
            <Button
              className="rounded-full"
              onClick={onStarClick}
              variant="ghost"
              size="icon"
            >
              <Star
                size={16}
                className={flashcard.starred ? "text-yellow-300" : undefined}
              />
            </Button>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center w-full h-full overflow-hidden">
          <div className="select-none text-2xl sm:text-3xl whitespace-pre-wrap text-center max-w-full overflow-y-auto px-4 max-h-[180px] sm:max-h-[280px] leading-relaxed">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlipCardContent;
