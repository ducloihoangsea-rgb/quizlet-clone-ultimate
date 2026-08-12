"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

import type { Session } from "@acme/auth";
import { cn } from "@acme/ui";

import { api } from "~/trpc/react";
import FlashcardCard from "../shared/flashcard-card";
import { useTranslation } from "~/contexts/i18n-context";
import { useFlashcardsModeContext } from "~/contexts/flashcards-mode-context";

const StudySetFlashcards = ({ session }: { session: Session | null }) => {
  const { id }: { id: string } = useParams();
  const [{ flashcards }] = api.studySet.byId.useSuspenseQuery({ id });
  const { t } = useTranslation();
  
  const { starredOnly, toggleStarredOnly } = useFlashcardsModeContext();
  const filter = starredOnly ? "starred" : "all";

  const starredCount = flashcards.filter((f) => f.starred).length;
  const filteredFlashcards = filter === "starred" 
    ? flashcards.filter((f) => f.starred) 
    : flashcards;

  return (
    <div className="mb-8 select-none font-sans">
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-3">
        <span className="text-xl font-black tracking-tight text-foreground">
          {t("termsInSet")} ({flashcards.length})
        </span>
        
        <div className="flex items-center gap-4 text-sm font-bold">
          <button
            onClick={() => { if (starredOnly) toggleStarredOnly(); }}
            className={cn(
              "pb-1 transition-all border-b-2 outline-none",
              filter === "all"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 font-black"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t("all")}
          </button>
          
          <button
            onClick={() => { if (!starredOnly) toggleStarredOnly(); }}
            className={cn(
              "pb-1 transition-all border-b-2 flex items-center gap-1 outline-none",
              filter === "starred"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 font-black"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t("starredTerms")} ({starredCount})
          </button>
        </div>
      </div>

      {filteredFlashcards.length === 0 && filter === "starred" ? (
        <div className="py-12 text-center border-2 border-dashed rounded-2xl bg-muted/20 text-muted-foreground font-bold font-sans">
          {t("noStarredTerms")}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredFlashcards.map((flashcard, index) => (
            <FlashcardCard
              editable={userId === session?.user.id}
              key={flashcard.id || index}
              flashcard={flashcard}
              session={session}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StudySetFlashcards;
