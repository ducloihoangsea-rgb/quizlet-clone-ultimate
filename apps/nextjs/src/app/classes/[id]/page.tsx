import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { auth } from "@acme/auth";
import { api, HydrateClient } from "~/trpc/server";
import ClassDetailClient from "~/components/class/class-detail-client";

interface ClassPageProps {
  params: { id: string };
}

export async function generateMetadata({
  params: { id },
}: ClassPageProps): Promise<Metadata> {
  try {
    const classData = await api.class.byId({ id });
    return {
      title: `${classData.name} - Quizlet`,
    };
  } catch {
    return {
      title: "Lớp học - Quizlet",
    };
  }
}

export default async function ClassPage({ params: { id } }: ClassPageProps) {
  let classData;
  try {
    classData = await api.class.byId({ id });
  } catch {
    notFound();
  }

  const session = await auth();

  // Prefetch class data for client hydration if needed
  await api.class.byId.prefetch({ id });

  return (
    <HydrateClient>
      <ClassDetailClient classData={classData} session={session} />
    </HydrateClient>
  );
}
