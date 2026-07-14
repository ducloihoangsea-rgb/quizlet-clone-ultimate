"use client";

import type { MouseEvent } from "react";
import { Lightbulb, Star, Volume2 } from "lucide-react";

import type { RouterOutputs } from "@acme/api";
import type { Session } from "@acme/auth";
import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";

import { useSignInDialogContext } from "~/contexts/sign-in-dialog-context";
import { useFlashcardsModeContext } from "~/contexts/flashcards-mode-context";
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
  const { frontFace } = useFlashcardsModeContext();

  const onStarClick = (event: MouseEvent) => {
    event.stopPropagation();

    if (session) {
      toggleStar();
    } else {
      onOpenChange(true);
    }
  };

  let title = "";
  let content = "";

  if (frontFace === "both") {
    if (!back) {
      title = "Thuật ngữ & Định nghĩa";
      content = `${flashcard.term}\n\n---\n\n${flashcard.definition}`;
    } else {
      title = "Thuật ngữ & Định nghĩa (Mặt sau)";
      content = `${flashcard.definition}\n\n---\n\n${flashcard.term}`;
    }
  } else {
    const isDefinitionOnFront = frontFace === "definition";
    const showDefinition = back ? !isDefinitionOnFront : isDefinitionOnFront;
    title = showDefinition ? "Định nghĩa" : "Thuật ngữ";
    content = showDefinition ? flashcard.definition : flashcard.term;
  }

  const handleSpeak = (event: MouseEvent) => {
    event.stopPropagation();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(content);
      const hasVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(content);
      utterance.lang = hasVietnamese ? "vi-VN" : "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

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
            <Button
              className="rounded-full"
              onClick={handleSpeak}
              variant="ghost"
              size="icon"
            >
              <Volume2 size={16} />
            </Button>
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
          <div className="select-none text-2xl sm:text-3xl whitespace-pre-wrap text-left max-w-full overflow-y-auto px-4 py-2 max-h-full leading-relaxed w-full [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full dark:[&::-webkit-scrollbar-thumb]:bg-gray-600">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlipCardContent;
