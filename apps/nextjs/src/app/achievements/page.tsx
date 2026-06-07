import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@acme/auth";
import { api, HydrateClient } from "~/trpc/server";
import AchievementsClient from "~/components/user/achievements-client";

export const metadata: Metadata = {
  title: "Thành tựu - Quizlet",
};

export default async function AchievementsPage() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  // Prefetch data
  await api.activity.allByUser.prefetch();
  await api.studySet.allByUser.prefetch({ userId: session.user.id });

  return (
    <HydrateClient>
      <AchievementsClient userId={session.user.id} />
    </HydrateClient>
  );
}
