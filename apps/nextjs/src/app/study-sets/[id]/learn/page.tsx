import type { Metadata } from "next";

import { auth } from "@acme/auth";

import LearnMode from "~/components/learn-mode/learn-mode";
import StudyModeHeader from "~/components/study-set/study-mode-header";
import { api, HydrateClient } from "~/trpc/server";

interface LearnModeProps {
  params: { id: string };
}

export async function generateMetadata({
  params: { id },
}: LearnModeProps): Promise<Metadata> {
  const { title } = await api.studySet.byId({ id });

  return {
    title: `${title} - Learn`,
  };
}

export default async function Learn({
  params: { id },
  searchParams,
}: {
  params: { id: string };
  searchParams?: { goal?: "cramming" | "spaced_repetition" };
}) {
  const goal = searchParams?.goal;
  
  await api.studySet.learnCards.prefetch({ id, goal });
  await api.studySet.byId.prefetch({ id });
  const session = await auth();

  return (
    <HydrateClient>
      <div className="m-auto max-w-3xl px-4">
        <StudyModeHeader currentMode="learn" studySetId={id} />
        <LearnMode session={session} goal={goal} />
      </div>
    </HydrateClient>
  );
}
