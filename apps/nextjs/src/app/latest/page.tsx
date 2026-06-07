import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@acme/auth";

import Dashboard from "~/components/user/dashboard";

export const metadata: Metadata = {
  title: "Quizlet - Latest",
};

export default async function Latest() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  return <Dashboard userId={session.user.id} />;
}
