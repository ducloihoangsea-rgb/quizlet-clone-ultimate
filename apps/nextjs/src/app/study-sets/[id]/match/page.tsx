import type { Metadata } from "next";

import MatchGame from "~/components/match-mode/match-game";
import StudyModeHeader from "~/components/study-set/study-mode-header";
import MatchModeProvider from "~/contexts/match-mode-context";
import { api, HydrateClient } from "~/trpc/server";

interface MatchModeProps {
  params: { id: string };
}

export async function generateMetadata({
  params: { id },
}: MatchModeProps): Promise<Metadata> {
  const { title } = await api.studySet.byId({ id });

  return {
    title: `${title} - Match`,
  };
}

export default async function MatchMode({
  params: { id },
}: {
  params: { id: string };
}) {
  await api.studySet.matchCards.prefetch({ id });

  return (
    <HydrateClient>
      <MatchModeProvider id={id}>
        <div className="m-auto max-w-5xl px-4">
          <StudyModeHeader currentMode="match" studySetId={id} />
          <MatchGame id={id} />
        </div>
      </MatchModeProvider>
    </HydrateClient>
  );
}
