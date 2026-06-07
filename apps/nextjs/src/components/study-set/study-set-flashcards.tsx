"use client";

import { useParams } from "next/navigation";

import type { Session } from "@acme/auth";

import { api } from "~/trpc/react";
import FlashcardCard from "../shared/flashcard-card";
import { useTranslation } from "~/contexts/i18n-context";

const StudySetFlashcards = ({ session }: { session: Session | null }) => {
  const { id }: { id: string } = useParams();
  const [{ flashcards, userId }] = api.studySet.byId.useSuspenseQuery({ id });
  const { t } = useTranslation();

  return (
    <div className="mb-8 select-none">
      <span className="mb-5 inline-block text-lg font-extrabold tracking-tight">
        {t("termsInSet")} ({flashcards.length})
      </span>
      <div className="flex flex-col gap-3">
        {flashcards.map((flashcard, index) => (
          <FlashcardCard
            editable={userId === session?.user.id}
            key={index}
            flashcard={flashcard}
            session={session}
          />
        ))}
      </div>
    </div>
  );
};

export default StudySetFlashcards;
