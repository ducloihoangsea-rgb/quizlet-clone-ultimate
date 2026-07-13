import type { Metadata } from "next";

import { auth } from "@acme/auth";

import FlashcardsGame from "~/components/flashcards-mode/flashcards-game";
import StudyModeHeader from "~/components/study-set/study-mode-header";
import FlashcardsModeProvider from "~/contexts/flashcards-mode-context";
import { api, HydrateClient } from "~/trpc/server";

interface FlashcardsModeProps {
  params: { id: string };
}

export async function generateMetadata({
  params: { id },
}: FlashcardsModeProps): Promise<Metadata> {
  const { title } = await api.studySet.byId({ id });

  return {
    title: `${title} - Flashcards`,
  };
}

export default async function FlashcardsMode({
  params: { id },
}: FlashcardsModeProps) {
  const { userId } = await api.studySet.byId({ id });
  await api.studyProgress.getProgress.prefetch({ studySetId: id });
  const session = await auth();

  return (
    <HydrateClient>
      <FlashcardsModeProvider id={id}>
        <div className="m-auto max-w-5xl px-4">
          <StudyModeHeader currentMode="flashcards" studySetId={id} />
          <FlashcardsGame fullscreen session={session} editable={userId === session?.user?.id} />
        </div>
      </FlashcardsModeProvider>
    </HydrateClient>
  );
}
