"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import type { Session } from "@acme/auth";
import { cn } from "@acme/ui";

import { useFlashcardsModeContext } from "~/contexts/flashcards-mode-context";
import FlipCardContent from "./flip-card-content";

interface FlipCardProps {
  fullscreen?: boolean;
  session: Session | null;
}

const FlipCard = ({ fullscreen, session }: FlipCardProps) => {
  const { currentCard, cardRef, textToSpeech, frontFace } = useFlashcardsModeContext();

  const [animation, setAnimation] = useState<
    "flipIn" | "flipOut" | undefined
  >();
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset trạng thái lật khi đổi thẻ
  useEffect(() => {
    setIsFlipped(false);
    setAnimation(undefined);
  }, [currentCard]);

  // Tự động phát âm khi chuyển thẻ hoặc lật thẻ nếu bật textToSpeech
  useEffect(() => {
    if (textToSpeech && currentCard) {
      const isDefinitionOnFront = frontFace === "definition";
      const showDefinition = isFlipped ? !isDefinitionOnFront : isDefinitionOnFront;
      const textToSpeak = showDefinition ? currentCard.definition : currentCard.term;

      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        const hasVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(textToSpeak);
        utterance.lang = hasVietnamese ? "vi-VN" : "en-US";
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [currentCard, isFlipped, textToSpeech, frontFace]);

  const toggleFlip = () => {
    setAnimation((prev) =>
      !prev || prev === "flipOut" ? "flipIn" : "flipOut",
    );
    setIsFlipped((prev) => !prev);
  };

  const flipVariants = {
    flipIn: {
      rotateX: [0, 180],
    },
    flipOut: {
      rotateX: [180, 360],
    },
  };

  if (!currentCard) {
    return null;
  }

  return (
    <div
      role="button"
      onClick={toggleFlip}
      ref={cardRef}
      className={cn("w-full [perspective:1000px]", {
        "min-h-[21rem] sm:min-h-[25rem]": !fullscreen,
        "min-h-[40rem]": fullscreen,
      })}
    >
      <motion.div
        variants={flipVariants}
        animate={animation}
        className="relative h-full w-full cursor-pointer [transform-style:preserve-3d]"
      >
        <FlipCardContent flashcard={currentCard} session={session} />
        <FlipCardContent flashcard={currentCard} session={session} back />
      </motion.div>
    </div>
  );
};

export default FlipCard;
