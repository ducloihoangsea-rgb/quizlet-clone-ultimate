import type { Metadata } from "next";

import TestMode from "~/components/test-mode/test-mode";
import StudyModeHeader from "~/components/study-set/study-mode-header";
import { api, HydrateClient } from "~/trpc/server";

interface TestModeProps {
  params: { id: string };
}

export async function generateMetadata({
  params: { id },
}: TestModeProps): Promise<Metadata> {
  const { title } = await api.studySet.byId({ id });

  return {
    title: `${title} - Test`,
  };
}

export default async function Test({
  params: { id },
}: {
  params: { id: string };
}) {
  await api.studySet.testCards.prefetch({ id });

  return (
    <HydrateClient>
      <div className="m-auto max-w-3xl px-4">
        <StudyModeHeader currentMode="test" studySetId={id} />
        <TestMode />
      </div>
    </HydrateClient>
  );
}
